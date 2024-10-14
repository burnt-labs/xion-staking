import { Coin } from "@cosmjs/proto-signing";

// Enums
export enum OrderByOptions {
  ORDER_BY_UNSPECIFIED = "ORDER_BY_UNSPECIFIED",
  ORDER_BY_ASC = "ORDER_BY_ASC",
  ORDER_BY_DESC = "ORDER_BY_DESC",
}

export enum ProposalStatus {
  PROPOSAL_STATUS_UNSPECIFIED = "PROPOSAL_STATUS_UNSPECIFIED",
  PROPOSAL_STATUS_DEPOSIT_PERIOD = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  PROPOSAL_STATUS_VOTING_PERIOD = "PROPOSAL_STATUS_VOTING_PERIOD",
  PROPOSAL_STATUS_PASSED = "PROPOSAL_STATUS_PASSED",
  PROPOSAL_STATUS_REJECTED = "PROPOSAL_STATUS_REJECTED",
  PROPOSAL_STATUS_FAILED = "PROPOSAL_STATUS_FAILED",
}

export enum VoteType {
  Yes = "yes",
  No = "no",
  NoWithVeto = "no_with_veto",
  Abstain = "abstain",
}

// Pagination related interfaces
export interface PaginationResponse {
  next_key: string;
  total: string;
}

export interface PaginationParams {
  "pagination.key"?: string;
  "pagination.offset"?: string;
  "pagination.limit"?: string;
  "pagination.count_total"?: boolean;
  "pagination.reverse"?: boolean;
}

// Governance related interfaces

export interface ProposalMessage {
  "@type": ProposalMessageType;
  "authority": string;
  "params"?: {
    [key: string]: string;
  };
  "plan"?: {
    name: string;
    time: string;
    height: string;
    info: string;
    upgraded_client_state: null;
  };
}

export interface ProposalTallyResult {
  yes_count: string;
  abstain_count: string;
  no_count: string;
  no_with_veto_count: string;
}

export interface ProposalDeposit extends Coin {}

export interface Proposal {
  id: string;
  messages: ProposalMessage[];
  status: ProposalStatus;
  final_tally_result: ProposalTallyResult;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: ProposalDeposit[];
  voting_start_time: string;
  voting_end_time: string;
  metadata: string;
  title: string;
  summary: string;
  proposer: string;
  expedited: boolean;
  failed_reason: string;
}

export interface ProposalTallyTotal {
  ratio: number;
  voted: string;
  staked: string;
}

export interface ProposalDetailsResult {
  info: {
    status: ProposalStatus;
    metaText: string;
    title: string;
    submittedDate: string;
    endsDate: string;
    voteValue?: VoteType;
  };
  proposal: Proposal;
  labelOverride?: string;
  threshold: number;
  progressData: Array<{
    type: string;
    percent: string;
    percentStaked?: string;
    amount: string;
  }>;
  total: ProposalTallyTotal;
  quorum: number;
  quorumReached: boolean;
}

export interface GovProposalsResponse {
  proposals: Proposal[];
  pagination: PaginationResponse;
}

export interface GovTallyParams {
  quorum: string;
  threshold: string;
  veto_threshold: string;
}

export interface GovVotingParams {
  voting_period: string;
}

export interface GovDepositParams {
  min_deposit: Coin[];
  max_deposit_period: string;
}

export interface GovParams {
  min_deposit: Coin[];
  max_deposit_period: string;
  voting_period: string;
  quorum: string;
  threshold: string;
  veto_threshold: string;
  min_initial_deposit_ratio: string;
  proposal_cancel_ratio: string;
  proposal_cancel_dest: string;
  expedited_voting_period: string;
  expedited_threshold: string;
  expedited_min_deposit: Coin[];
  burn_vote_quorum: boolean;
  burn_proposal_deposit_prevote: boolean;
  burn_vote_veto: boolean;
  min_deposit_ratio: string;
}

export interface GovParamsResponse {
  voting_params: GovVotingParams | null;
  deposit_params: GovDepositParams | null;
  tally_params: GovTallyParams | null;
  params: GovParams;
}

export type GovVotingParamsResponse = GovParamsResponse;
export type GovDepositParamsResponse = GovParamsResponse;
export type GovTallyParamsResponse = GovParamsResponse;

export interface GovTallyResponse {
  tally: ProposalTallyResult;
}

export interface GovProposalDepositsResponse {
  deposits: Deposit[];
  pagination: PaginationResponse;
}

// Deposit and Vote related interfaces
export interface Deposit {
  proposal_id: string;
  depositor: string;
  amount: Coin[];
}

export interface Vote {
  proposal_id: string;
  voter: string;
  options: VoteOption[];
  metadata: string;
}

export interface VoteOption {
  option: VoteType;
  weight: string;
}

export interface GovVoteResponse {
  vote: Vote;
}

// Staking related interfaces
export interface StakingPool {
  not_bonded_tokens: string;
  bonded_tokens: string;
}

export interface StakingPoolResponse {
  pool: StakingPool;
}

// Constants
export const ProposalStatusColor: Record<ProposalStatus, string> = {
  [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: "#808080",
  [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: "#808080",
  [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: "#03c600",
  [ProposalStatus.PROPOSAL_STATUS_PASSED]: "#03c600",
  [ProposalStatus.PROPOSAL_STATUS_REJECTED]: "#d64406",
  [ProposalStatus.PROPOSAL_STATUS_FAILED]: "#d64406",
};

export const toProgressLabel: Record<VoteType, string> = {
  [VoteType.Yes]: "yes",
  [VoteType.No]: "no",
  [VoteType.NoWithVeto]: "noWithVeto",
  [VoteType.Abstain]: "abstain",
};

export const toStatusLabel: Record<ProposalStatus, string> = {
  [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: "Unspecified",
  [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: "Deposit",
  [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: "Voting",
  [ProposalStatus.PROPOSAL_STATUS_PASSED]: "Passed",
  [ProposalStatus.PROPOSAL_STATUS_REJECTED]: "Rejected",
  [ProposalStatus.PROPOSAL_STATUS_FAILED]: "Failed",
};

export type ProposalMessageType = string;

export function getProposalMessageType(
  proposal: Proposal,
): ProposalMessageType {
  return proposal.messages.length > 0 ? proposal.messages[0]["@type"] : "";
}

export function getProposalMessageTypeName(
  messageType: ProposalMessageType,
): string {
  return messageType.split(".").pop() || "";
}
