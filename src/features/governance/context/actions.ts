import BigNumber from "bignumber.js";
import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1/tx";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgStoreCode } from "cosmjs-types/cosmwasm/wasm/v1/tx";

import { fetchFromAPI } from "@/features/core/utils";
import { getTxVerifier, handleTxError } from "@/features/staking/lib/core/tx";

import { GOVERNANCE_ENDPOINTS } from "../config/api";
import {
  GOVERNANCE_MODULE_ADDRESS,
  GOVERNANCE_PAGE_LIMIT,
} from "../config/constants";
import type {
  ExecuteVoteParams,
  GovDepositParamsResponse,
  GovProposalDepositsResponse,
  GovProposalsResponse,
  GovTallyParams,
  GovTallyParamsResponse,
  GovTallyResponse,
  GovVoteResponse,
  PaginationParams,
  Proposal,
  ProposalTallyResult,
  StakingPool,
  StakingPoolResponse,
  SubmitProposalParams,
} from "../lib/types";
import { ProposalStatus, VoteType } from "../lib/types";

type SortOrder = "ASC" | "DESC";

export interface FetchProposalsOptions {
  paginationParams?: PaginationParams;
  sortOrder?: SortOrder;
  status?: ProposalStatus;
}

export const fetchProposals = async ({
  paginationParams = {
    "pagination.limit": GOVERNANCE_PAGE_LIMIT.toString(),
  },
  sortOrder = "DESC",
  status,
}: FetchProposalsOptions = {}): Promise<Proposal[]> => {
  let allProposals: Proposal[] = [];
  let nextKey: null | string = null;

  do {
    const params: PaginationParams = {
      "pagination.key": nextKey || "",
      "pagination.limit":
        paginationParams["pagination.limit"] ||
        GOVERNANCE_PAGE_LIMIT.toString(),
      ...(status ? { proposal_status: ProposalStatus[status] } : {}),
    };

    try {
      const data = await fetchFromAPI<GovProposalsResponse>(
        GOVERNANCE_ENDPOINTS.PROPOSALS.url,
        {
          params,
        },
      );

      allProposals = allProposals.concat(data.proposals);
      nextKey = data.pagination.next_key;
      paginationParams["pagination.key"] = nextKey || undefined;
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
      throw error;
    }
  } while (nextKey);

  // sort the proposals by id
  allProposals.sort((a, b) => {
    const idA = parseInt(a.id);
    const idB = parseInt(b.id);

    return sortOrder === "ASC" ? idA - idB : idB - idA;
  });

  return allProposals;
};

export const fetchProposal = async (proposalId: string): Promise<Proposal> => {
  const response = await fetchFromAPI<{ proposal: Proposal }>(
    GOVERNANCE_ENDPOINTS.PROPOSAL.url(proposalId),
  );

  return response.proposal;
};

export const fetchDepositParams = async (): Promise<GovDepositParamsResponse> =>
  fetchFromAPI<GovDepositParamsResponse>(
    GOVERNANCE_ENDPOINTS.DEPOSIT_PARAMS.url,
  );

export const fetchTallyParams = async (): Promise<GovTallyParamsResponse> =>
  fetchFromAPI<GovTallyParamsResponse>(GOVERNANCE_ENDPOINTS.TALLY_PARAMS.url);

export const fetchProposalDeposits = async (
  proposalId: string,
): Promise<GovProposalDepositsResponse> =>
  fetchFromAPI<GovProposalDepositsResponse>(
    GOVERNANCE_ENDPOINTS.PROPOSAL_DEPOSITS.url(proposalId),
  );

export const fetchTally = async (
  proposalId: string,
): Promise<GovTallyResponse> =>
  fetchFromAPI<GovTallyResponse>(GOVERNANCE_ENDPOINTS.TALLY.url(proposalId));

export const fetchVote = async (
  proposalId: string,
  voterAddress: string,
): Promise<GovVoteResponse> =>
  fetchFromAPI<GovVoteResponse>(
    GOVERNANCE_ENDPOINTS.VOTE.url(proposalId, voterAddress),
  );

export const fetchStakingPool = async (): Promise<StakingPoolResponse> =>
  fetchFromAPI<StakingPoolResponse>(GOVERNANCE_ENDPOINTS.STAKING_POOL.url);

export const calcTallies = (
  tally: ProposalTallyResult,
  { quorum }: GovTallyParams,
  pool: StakingPool,
) => {
  const tallies = {
    [VoteType.Abstain]: tally.abstain_count,
    [VoteType.No]: tally.no_count,
    [VoteType.NoWithVeto]: tally.no_with_veto_count,
    [VoteType.Yes]: tally.yes_count,
  };

  const total = {
    staked: pool.bonded_tokens,
    voted: Object.values(tallies)
      .reduce((sum, value) => sum.plus(value), new BigNumber(0))
      .toString(),
  };

  const ratio = new BigNumber(total.voted).div(total.staked).toNumber();

  const getTallyItem = (option: VoteType) => {
    const voted = tallies[option] || "0";
    const byVoted = new BigNumber(voted).div(total.voted).toNumber();
    const byStaked = new BigNumber(byVoted).times(ratio).toNumber();

    return { option, ratio: { byStaked, byVoted }, voted };
  };

  const options = [
    VoteType.Yes,
    VoteType.No,
    VoteType.NoWithVeto,
    VoteType.Abstain,
  ];

  const list = options.map(getTallyItem);

  const quorumValue = new BigNumber(
    Buffer.from(quorum).toString("hex"),
    16,
  ).toNumber();

  const isBelowQuorum = new BigNumber(quorumValue).gt(ratio);

  const yesRatio = list[0].ratio.byVoted;

  const noRatio = list
    .slice(2, 4)
    .map(({ ratio: voteRatio }) => voteRatio.byVoted);

  const isPassing =
    !isBelowQuorum && new BigNumber(noRatio[0]).plus(noRatio[1]).lte(yesRatio);

  return {
    isPassing,
    list,
    tallies,
    total: { ...total, ratio },
  };
};

export const submitVote = async ({
  client,
  memo = "",
  option,
  proposalId,
  voter,
}: ExecuteVoteParams) => {
  const msg = MsgVote.fromPartial({
    option,
    proposalId: BigInt(proposalId),
    voter,
  });

  const messageWrapper = {
    typeUrl: "/cosmos.gov.v1beta1.MsgVote",
    value: msg,
  };

  return await client
    .signAndBroadcast(voter, [messageWrapper], 2.5, memo)
    .then(getTxVerifier("proposal_vote"))
    .catch(handleTxError);
};

export const submitStoreCodeProposal = async ({
  client,
  memo = "",
  proposer,
  values,
}: SubmitProposalParams) => {
  const storeCodeMessages = values.wasmByteCodes.map((wasmByteCode) => ({
    typeUrl: "/cosmwasm.wasm.v1.MsgStoreCode",
    value: MsgStoreCode.encode(
      MsgStoreCode.fromPartial({
        sender: GOVERNANCE_MODULE_ADDRESS,
        wasmByteCode,
      }),
    ).finish(),
  }));

  const msg = MsgSubmitProposal.fromPartial({
    initialDeposit: values.initialDeposit ? [values.initialDeposit] : [],
    messages: storeCodeMessages,
    metadata: "",
    proposer,
    summary: values.description,
    title: values.title,
  });

  const messageWrapper = {
    typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
    value: msg,
  };

  return await client
    .signAndBroadcast(proposer, [messageWrapper], 2.5, memo)
    .then(getTxVerifier("submit_proposal"))
    .catch(handleTxError);
};
