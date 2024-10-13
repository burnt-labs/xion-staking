import {
  GovDepositParamsResponse,
  GovProposalDepositsResponse,
  GovProposalsResponse,
  GovTallyParamsResponse,
  GovTallyResponse,
  GovVoteResponse,
  GovVotingParamsResponse,
  Proposal,
} from "../lib/types";

export const GOVERNANCE_ENDPOINTS = {
  PROPOSALS: {
    url: "/cosmos/gov/v1/proposals",
    responseType: {} as GovProposalsResponse,
  },
  PROPOSAL: {
    url: (id: string) => `/cosmos/gov/v1/proposals/${id}`,
    responseType: {} as { proposal: Proposal },
  },
  VOTING_PARAMS: {
    url: "/cosmos/gov/v1/params/voting",
    responseType: {} as GovVotingParamsResponse,
  },
  DEPOSIT_PARAMS: {
    url: "/cosmos/gov/v1/params/deposit",
    responseType: {} as GovDepositParamsResponse,
  },
  TALLY_PARAMS: {
    url: "/cosmos/gov/v1/params/tallying",
    responseType: {} as GovTallyParamsResponse,
  },
  PROPOSAL_DEPOSITS: {
    url: (id: string) => `/cosmos/gov/v1/proposals/${id}/deposits`,
    responseType: {} as GovProposalDepositsResponse,
  },
  TALLY: {
    url: (proposalId: string) => `/cosmos/gov/v1/proposals/${proposalId}/tally`,
    responseType: {} as GovTallyResponse,
  },
  VOTE: {
    url: (proposalId: string, voterAddress: string) =>
      `/cosmos/gov/v1/proposals/${proposalId}/votes/${voterAddress}`,
    responseType: {} as GovVoteResponse,
  },
} as const;

export type GovernanceEndpoint = keyof typeof GOVERNANCE_ENDPOINTS;
