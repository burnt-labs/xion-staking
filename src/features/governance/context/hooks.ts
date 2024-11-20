import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  ExecuteVoteParams,
  GovDepositParamsResponse,
  GovProposalDepositsResponse,
  GovTallyParams,
  GovTallyParamsResponse,
  GovTallyResponse,
  GovVoteResponse,
  Proposal,
  ProposalDetailsResult,
  StakingPoolResponse,
  VoteType,
} from "../lib/types";
import { ProposalStatus, toProgressLabel } from "../lib/types";
import {
  calculateDepositPercent,
  formatProposalDate,
  getAmount,
  getProposalType,
  readPercent,
  toInput,
} from "../lib/utils";
import {
  calcTallies,
  fetchDepositParams,
  fetchProposal,
  fetchProposalDeposits,
  fetchProposals,
  fetchStakingPool,
  fetchTally,
  fetchTallyParams,
  fetchVote,
  submitVote,
} from "./actions";
import type { FetchProposalsOptions } from "./actions";

const RefetchOptions = {
  DEFAULT: {} as const,
  INFINITY: {
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  } as const,
};

/**
 * Fetches all proposals, optionally filtered by status and other criteria.
 * @param options - Options to filter and sort proposals.
 * @returns The proposals.
 */
export const useProposals = (options?: FetchProposalsOptions) =>
  useQuery<Proposal[], Error>({
    queryFn: async () => {
      const result = await fetchProposals(options);

      if (Array.isArray(result)) {
        return result as Proposal[];
      }

      throw new Error("Invalid response from fetchProposals");
    },
    queryKey: ["proposals", options],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches a single proposal.
 * @param proposalId - The id of the proposal.
 * @returns The proposal.
 */
export const useProposal = (proposalId: string) =>
  useQuery<Proposal, Error>({
    queryFn: () => fetchProposal(proposalId),
    queryKey: ["proposal", proposalId],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches the deposit parameters.
 * @returns The deposit parameters.
 */
const useDepositParams = () =>
  useQuery<GovDepositParamsResponse, Error>({
    queryFn: fetchDepositParams as () => Promise<GovDepositParamsResponse>,
    queryKey: ["depositParams"],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches the tally parameters.
 * @returns The tally parameters.
 */
const useTallyParams = () =>
  useQuery<GovTallyParamsResponse, Error>({
    queryFn: fetchTallyParams as () => Promise<GovTallyParamsResponse>,
    queryKey: ["tallyParams"],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches the proposal deposits.
 * @param proposalId - The id of the proposal.
 * @returns The proposal deposits.
 */
const useProposalDeposits = (proposalId: string) =>
  useQuery<GovProposalDepositsResponse, Error>({
    queryFn: () =>
      fetchProposalDeposits(proposalId) as Promise<GovProposalDepositsResponse>,
    queryKey: ["proposalDeposits", proposalId],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches the proposal tally.
 * @param proposalId - The id of the proposal.
 * @returns The proposal tally.
 */
const useTally = (proposalId: string) =>
  useQuery<GovTallyResponse, Error>({
    queryFn: () => fetchTally(proposalId),
    queryKey: ["tally", proposalId],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches the proposal vote.
 * @param proposalId - The id of the proposal.
 * @param voterAddress - The address of the voter.
 * @returns The proposal vote.
 */
const useVote = (proposalId: string, voterAddress: string) =>
  useQuery<GovVoteResponse, Error>({
    queryFn: () => {
      if (!voterAddress) {
        return Promise.resolve({
          vote: {
            metadata: "",
            options: [],
            proposal_id: proposalId,
            voter: "",
          },
        });
      }

      return fetchVote(proposalId, voterAddress);
    },
    queryKey: ["vote", proposalId, voterAddress],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches the staking pool.
 * @returns The staking pool.
 */
const useStakingPool = () =>
  useQuery<StakingPoolResponse, Error>({
    queryFn: fetchStakingPool,
    queryKey: ["stakingPool"],
    ...RefetchOptions.INFINITY,
  });

/**
 * Fetches the proposal details.
 */
export const useProposalDetails = (
  proposalId: string,
): null | ProposalDetailsResult => {
  const { data: abstraxionAccount } = useAbstraxionAccount();
  const { data: proposal } = useProposal(proposalId);
  const { data: deposits } = useProposalDeposits(proposalId);
  const { data: pool } = useStakingPool();
  const { data: tally } = useTally(proposalId);
  const { data: tallyParams } = useTallyParams();
  const { data: depositParams } = useDepositParams();

  const { data: voteData } = useVote(
    proposalId,
    abstraxionAccount?.bech32Address ?? "",
  );

  return useMemo(() => {
    if (
      !(proposal && deposits && depositParams && tally && tallyParams && pool)
    ) {
      return null;
    }

    const inDepositPeriod =
      proposal.status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;

    const {
      deposit_end_time,
      submit_time,
      total_deposit,
      voting_end_time,
      voting_start_time,
    } = proposal;

    const { min_deposit } = depositParams.params;

    const depositPercent = calculateDepositPercent(total_deposit, min_deposit);

    const { list, tallies, total } = calcTallies(
      tally.tally,
      tallyParams?.params as GovTallyParams,
      pool.pool,
    );

    const quorum = parseFloat(tallyParams.params.quorum);
    const quorumReached = total.ratio >= quorum;

    const progressData = inDepositPeriod
      ? [
          {
            amount: `${toInput(getAmount(total_deposit[0], total_deposit[0].denom), 6).toFixed(2)} ${total_deposit[0].denom}`,
            percent: depositPercent,
            type: "deposit",
          },
        ]
      : [
          {
            amount: total.voted,
            percent: readPercent(total.ratio),
            percentStaked: readPercent(quorum),
            type: "quorum",
          },
          ...list.map(({ option, ratio }) => ({
            amount: tallies[option as keyof typeof tallies],
            percent: readPercent(ratio.byVoted),
            percentStaked: readPercent(ratio.byStaked),
            type: toProgressLabel[option as VoteType],
          })),
        ];

    return {
      info: {
        endsDate: formatProposalDate(
          (voting_end_time ?? deposit_end_time).toString(),
        ),
        metaText: `${proposalId} | ${proposal.messages.length && getProposalType(proposal.messages[0]["@type"])}`,
        status: proposal.status,
        submittedDate: formatProposalDate(
          (voting_start_time ?? submit_time).toString(),
        ),
        title: proposal.title,
        voteValue: voteData?.vote?.options[0]?.option,
      },
      labelOverride: inDepositPeriod ? depositPercent : undefined,
      progressData,
      proposal,
      quorum,
      quorumReached,
      threshold: parseFloat(tallyParams.params.threshold),
      total,
    };
  }, [
    proposal,
    deposits,
    depositParams,
    tally,
    tallyParams,
    pool,
    voteData,
    proposalId,
  ]);
};

/**
 * Hook for interacting with the governance module.
 * @returns The governance context.
 */
export const useGovernanceTx = () => {
  const { client } = useAbstraxionSigningClient();
  const { data: account, isConnected } = useAbstraxionAccount();
  const queryClient = useQueryClient();

  const address = account?.bech32Address;

  const voteMutation = useMutation({
    mutationFn: async (params: ExecuteVoteParams) => {
      const result = await submitVote({
        ...params,
        client: client!,
        voter: address!,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote"] });
      queryClient.invalidateQueries({ queryKey: ["tally"] });
    },
  });

  return {
    account,
    address,
    client: isConnected ? client : undefined,
    isConnected,
    isVoting: voteMutation.isLoading,
    submitVote: voteMutation.mutateAsync,
    voteError: voteMutation.error,
  };
};
