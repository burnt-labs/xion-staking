import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import {
  ExecuteVoteParams,
  GovDepositParamsResponse,
  GovProposalDepositsResponse,
  GovTallyParams,
  GovTallyParamsResponse,
  GovTallyResponse,
  GovVoteResponse,
  GovVotingParamsResponse,
  Proposal,
  ProposalDetailsResult,
  ProposalStatus,
  StakingPoolResponse,
  VoteType,
  toProgressLabel,
} from "../lib/types";
import {
  calculateDepositPercent,
  formatProposalDate,
  getAmount,
  getProposalType,
  readPercent,
  toInput,
} from "../lib/utils";
import {
  FetchProposalsOptions,
  calcTallies,
  fetchDepositParams,
  fetchProposal,
  fetchProposalDeposits,
  fetchProposals,
  fetchStakingPool,
  fetchTally,
  fetchTallyParams,
  fetchVote,
  fetchVotingParams,
  submitVote,
} from "./actions";

const RefetchOptions = {
  INFINITY: {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
  } as const,
  DEFAULT: {} as const,
};

/**
 * Fetches all proposals, optionally filtered by status and other criteria.
 * @param options - Options to filter and sort proposals.
 * @returns The proposals.
 */
export const useProposals = (
  options?: FetchProposalsOptions,
): UseQueryResult<Proposal[], Error> => {
  return useQuery<Proposal[], Error>({
    queryKey: ["proposals", options],
    queryFn: async () => {
      const result = await fetchProposals(options);
      if (Array.isArray(result)) {
        return result as Proposal[];
      }
      throw new Error("Invalid response from fetchProposals");
    },
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches a single proposal.
 * @param proposalId - The id of the proposal.
 * @returns The proposal.
 */
export const useProposal = (
  proposalId: string,
): UseQueryResult<Proposal, Error> => {
  return useQuery<Proposal, Error>({
    queryKey: ["proposal", proposalId],
    queryFn: () => fetchProposal(proposalId),
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the voting parameters.
 * @returns The voting parameters.
 */
export const useVotingParams = (): UseQueryResult<
  GovVotingParamsResponse,
  Error
> => {
  return useQuery<GovVotingParamsResponse, Error>({
    queryKey: ["votingParams"],
    queryFn: fetchVotingParams as () => Promise<GovVotingParamsResponse>,
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the deposit parameters.
 * @returns The deposit parameters.
 */
export const useDepositParams = (): UseQueryResult<
  GovDepositParamsResponse,
  Error
> => {
  return useQuery<GovDepositParamsResponse, Error>({
    queryKey: ["depositParams"],
    queryFn: fetchDepositParams as () => Promise<GovDepositParamsResponse>,
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the tally parameters.
 * @returns The tally parameters.
 */
export const useTallyParams = (): UseQueryResult<
  GovTallyParamsResponse,
  Error
> => {
  return useQuery<GovTallyParamsResponse, Error>({
    queryKey: ["tallyParams"],
    queryFn: fetchTallyParams as () => Promise<GovTallyParamsResponse>,
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the proposal deposits.
 * @param proposalId - The id of the proposal.
 * @returns The proposal deposits.
 */
export const useProposalDeposits = (
  proposalId: string,
): UseQueryResult<GovProposalDepositsResponse, Error> => {
  return useQuery<GovProposalDepositsResponse, Error>({
    queryKey: ["proposalDeposits", proposalId],
    queryFn: () =>
      fetchProposalDeposits(proposalId) as Promise<GovProposalDepositsResponse>,
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the proposal tally.
 * @param proposalId - The id of the proposal.
 * @returns The proposal tally.
 */
export const useTally = (
  proposalId: string,
): UseQueryResult<GovTallyResponse, Error> => {
  return useQuery<GovTallyResponse, Error>({
    queryKey: ["tally", proposalId],
    queryFn: () => fetchTally(proposalId),
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the proposal vote.
 * @param proposalId - The id of the proposal.
 * @param voterAddress - The address of the voter.
 * @returns The proposal vote.
 */
export const useVote = (
  proposalId: string,
  voterAddress: string,
): UseQueryResult<GovVoteResponse, Error> => {
  return useQuery<GovVoteResponse, Error>({
    queryKey: ["vote", proposalId, voterAddress],
    queryFn: () => {
      if (!voterAddress) {
        return Promise.resolve({
          vote: {
            proposal_id: proposalId,
            voter: "",
            options: [],
            metadata: "",
          },
        });
      }
      return fetchVote(proposalId, voterAddress);
    },
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the staking pool.
 * @returns The staking pool.
 */
export const useStakingPool = (): UseQueryResult<
  StakingPoolResponse,
  Error
> => {
  return useQuery<StakingPoolResponse, Error>({
    queryKey: ["stakingPool"],
    queryFn: fetchStakingPool,
    ...RefetchOptions.INFINITY,
  });
};

/**
 * Fetches the proposal details.
 */
export const useProposalDetails = (
  proposalId: string,
): ProposalDetailsResult | null => {
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
      voting_start_time,
      submit_time,
      total_deposit,
      deposit_end_time,
      voting_end_time,
    } = proposal;
    const { min_deposit } = depositParams.params;

    const depositPercent = calculateDepositPercent(total_deposit, min_deposit);

    const { tallies, list, total } = calcTallies(
      tally.tally,
      tallyParams?.params as GovTallyParams,
      pool.pool,
    );

    const quorum = parseFloat(tallyParams.params.quorum);
    const quorumReached = total.ratio >= quorum;

    const progressData = inDepositPeriod
      ? [
          {
            type: "deposit",
            percent: depositPercent,
            amount: `${toInput(getAmount(total_deposit[0], total_deposit[0].denom), 6).toFixed(2)} ${total_deposit[0].denom}`,
          },
        ]
      : [
          {
            type: "quorum",
            percent: readPercent(total.ratio),
            percentStaked: readPercent(quorum),
            amount: total.voted,
          },
          ...list.map(({ option, ratio }) => ({
            type: toProgressLabel[option as VoteType],
            percent: readPercent(ratio.byVoted),
            percentStaked: readPercent(ratio.byStaked),
            amount: tallies[option as keyof typeof tallies],
          })),
        ];

    return {
      info: {
        status: proposal.status,
        metaText: `${proposalId} | ${proposal.messages.length && getProposalType(proposal.messages[0]["@type"])}`,
        title: proposal.title,
        submittedDate: formatProposalDate(
          (voting_start_time ?? submit_time).toString(),
        ),
        endsDate: formatProposalDate(
          (voting_end_time ?? deposit_end_time).toString(),
        ),
        voteValue: voteData?.vote?.options[0]?.option,
      },
      proposal,
      labelOverride: inDepositPeriod ? depositPercent : undefined,
      threshold: parseFloat(tallyParams.params.threshold),
      progressData,
      total,
      quorum,
      quorumReached,
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
    mutationFn: (params: ExecuteVoteParams) =>
      submitVote({
        ...params,
        client: client!,
        voter: address!,
      }),
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
    submitVote: voteMutation.mutate,
    isVoting: voteMutation.isLoading,
    voteError: voteMutation.error,
  };
};
