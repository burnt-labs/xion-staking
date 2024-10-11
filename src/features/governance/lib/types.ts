export interface ProposalMessage {
  "@type": string;
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

export interface ProposalDeposit {
  denom: string;
  amount: string;
}

export interface Proposal {
  id: string;
  messages: ProposalMessage[];
  status: string;
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

export interface PaginationResponse {
  next_key: string;
  total: string;
}

export interface ProposalsResponse {
  proposals: Proposal[];
  pagination: PaginationResponse;
}

export interface PaginationParams {
  key?: string;
  offset?: string;
  limit?: string;
  count_total?: boolean;
  reverse?: boolean;
}

export enum ProposalStatus {
  PROPOSAL_STATUS_UNSPECIFIED = "PROPOSAL_STATUS_UNSPECIFIED",
  PROPOSAL_STATUS_DEPOSIT_PERIOD = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  PROPOSAL_STATUS_VOTING_PERIOD = "PROPOSAL_STATUS_VOTING_PERIOD",
  PROPOSAL_STATUS_PASSED = "PROPOSAL_STATUS_PASSED",
  PROPOSAL_STATUS_REJECTED = "PROPOSAL_STATUS_REJECTED",
  PROPOSAL_STATUS_FAILED = "PROPOSAL_STATUS_FAILED",
}

export const ProposalStatusColor: Record<ProposalStatus, string> = {
  [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: "#808080", // Default gray color for unspecified status
  [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: "#808080", // Using gray for deposit period as well
  [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: "#caf033",
  [ProposalStatus.PROPOSAL_STATUS_PASSED]: "#03c600",
  [ProposalStatus.PROPOSAL_STATUS_REJECTED]: "#d64406",
  [ProposalStatus.PROPOSAL_STATUS_FAILED]: "#d64406", // Using the same color as rejected for failed status
};

export enum VoteType {
  Yes = "yes",
  No = "no",
  NoWithVeto = "no_with_veto",
  Abstain = "abstain",
}
