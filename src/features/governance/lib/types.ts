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
