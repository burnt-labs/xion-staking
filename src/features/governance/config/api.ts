import type {
  GovDepositParamsResponse,
  GovProposalDepositsResponse,
  GovProposalsResponse,
  GovTallyParamsResponse,
  GovTallyResponse,
  GovVoteResponse,
  GovVotingParamsResponse,
  Proposal,
  StakingPoolResponse,
} from "../lib/types";

export const GOVERNANCE_ENDPOINTS = {
  DEPOSIT_PARAMS: {
    responseType: {} as GovDepositParamsResponse,
    url: "/cosmos/gov/v1/params/deposit",
  },
  PROPOSAL: {
    responseType: {} as { proposal: Proposal },
    url: (id: string) => `/cosmos/gov/v1/proposals/${id}`,
  },
  PROPOSAL_DEPOSITS: {
    responseType: {} as GovProposalDepositsResponse,
    url: (id: string) => `/cosmos/gov/v1/proposals/${id}/deposits`,
  },
  PROPOSALS: {
    responseType: {} as GovProposalsResponse,
    url: "/cosmos/gov/v1/proposals",
  },
  STAKING_POOL: {
    responseType: {} as StakingPoolResponse,
    url: "/cosmos/staking/v1beta1/pool",
  },
  TALLY: {
    responseType: {} as GovTallyResponse,
    url: (proposalId: string) => `/cosmos/gov/v1/proposals/${proposalId}/tally`,
  },
  TALLY_PARAMS: {
    responseType: {} as GovTallyParamsResponse,
    url: "/cosmos/gov/v1/params/tallying",
  },
  VOTE: {
    responseType: {} as GovVoteResponse,
    url: (proposalId: string, voterAddress: string) =>
      `/cosmos/gov/v1/proposals/${proposalId}/votes/${voterAddress}`,
  },
  VOTING_PARAMS: {
    responseType: {} as GovVotingParamsResponse,
    url: "/cosmos/gov/v1/params/voting",
  },
} as const;
