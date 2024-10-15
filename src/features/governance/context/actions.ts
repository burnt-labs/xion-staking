import BigNumber from "bignumber.js";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";

import { fetchFromAPI } from "@/features/core/utils";
import { getCosmosFee } from "@/features/staking/lib/core/fee";
import { getTxVerifier, handleTxError } from "@/features/staking/lib/core/tx";

import { GOVERNANCE_ENDPOINTS } from "../config/api";
import { GOVERNANCE_PAGE_LIMIT } from "../config/constants";
import {
  ExecuteVoteParams,
  GovDepositParamsResponse,
  GovProposalDepositsResponse,
  GovProposalsResponse,
  GovTallyParams,
  GovTallyParamsResponse,
  GovTallyResponse,
  GovVoteResponse,
  GovVotingParamsResponse,
  PaginationParams,
  Proposal,
  ProposalStatus,
  ProposalTallyResult,
  StakingPool,
  VoteType,
} from "../lib/types";
import { StakingPoolResponse } from "../lib/types";

// Add this type definition and export it
export type SortOrder = "ASC" | "DESC";

// Add this type definition and export it
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
  let nextKey: string | null = null;

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

export const fetchVotingParams = async (): Promise<GovVotingParamsResponse> => {
  return fetchFromAPI<GovVotingParamsResponse>(
    GOVERNANCE_ENDPOINTS.VOTING_PARAMS.url,
  );
};

export const fetchDepositParams =
  async (): Promise<GovDepositParamsResponse> => {
    return fetchFromAPI<GovDepositParamsResponse>(
      GOVERNANCE_ENDPOINTS.DEPOSIT_PARAMS.url,
    );
  };

export const fetchTallyParams = async (): Promise<GovTallyParamsResponse> => {
  return fetchFromAPI<GovTallyParamsResponse>(
    GOVERNANCE_ENDPOINTS.TALLY_PARAMS.url,
  );
};

export const fetchProposalDeposits = async (
  proposalId: string,
): Promise<GovProposalDepositsResponse> => {
  return fetchFromAPI<GovProposalDepositsResponse>(
    GOVERNANCE_ENDPOINTS.PROPOSAL_DEPOSITS.url(proposalId),
  );
};

export const fetchTally = async (
  proposalId: string,
): Promise<GovTallyResponse> => {
  return fetchFromAPI<GovTallyResponse>(
    GOVERNANCE_ENDPOINTS.TALLY.url(proposalId),
  );
};

export const fetchVote = async (
  proposalId: string,
  voterAddress: string,
): Promise<GovVoteResponse> => {
  return fetchFromAPI<GovVoteResponse>(
    GOVERNANCE_ENDPOINTS.VOTE.url(proposalId, voterAddress),
  );
};

export const fetchStakingPool = async (): Promise<StakingPoolResponse> => {
  return fetchFromAPI<StakingPoolResponse>(
    GOVERNANCE_ENDPOINTS.STAKING_POOL.url,
  );
};

export const calcTallies = (
  tally: ProposalTallyResult,
  { quorum }: GovTallyParams,
  pool: StakingPool,
) => {
  const getTallyItem = (option: VoteType) => {
    const voted = tallies[option] || "0";
    const byVoted = new BigNumber(voted).div(total.voted).toNumber();
    const byStaked = new BigNumber(byVoted).times(ratio).toNumber();

    return { option, voted, ratio: { byVoted, byStaked } };
  };

  const tallies = {
    [VoteType.Yes]: tally.yes_count,
    [VoteType.No]: tally.no_count,
    [VoteType.NoWithVeto]: tally.no_with_veto_count,
    [VoteType.Abstain]: tally.abstain_count,
  };

  const total = {
    voted: Object.values(tallies)
      .reduce((sum, value) => sum.plus(value), new BigNumber(0))
      .toString(),
    staked: pool.bonded_tokens,
  };

  const ratio = new BigNumber(total.voted).div(total.staked).toNumber();
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
  const noRatio = list.slice(2, 4).map(({ ratio }) => ratio.byVoted);

  const isPassing =
    !isBelowQuorum && new BigNumber(noRatio[0]).plus(noRatio[1]).lte(yesRatio);

  return {
    list,
    total: { ...total, ratio },
    tallies,
    isPassing,
  };
};

export const submitVote = async ({
  proposalId,
  voter,
  option,
  client,
  memo = "",
}: ExecuteVoteParams) => {
  const msg = MsgVote.fromPartial({
    proposalId: BigInt(proposalId),
    voter,
    option,
  });

  const messageWrapper = {
    typeUrl: "/cosmos.gov.v1beta1.MsgVote",
    value: msg,
  };

  const fee = await getCosmosFee({
    address: voter,
    memo,
    msgs: [messageWrapper],
  });

  return await client
    .signAndBroadcast(voter, [messageWrapper], fee, memo)
    .then(getTxVerifier("vote"))
    .catch(handleTxError);
};
