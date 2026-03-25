import type { Coin } from "@cosmjs/proto-signing";
import { type AccessConfig } from "cosmjs-types/cosmwasm/wasm/v1/types";

import type { SigningClient } from "@/features/staking/lib/core/client";

// Enums
export enum ProposalStatus {
  PROPOSAL_STATUS_DEPOSIT_PERIOD = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  PROPOSAL_STATUS_FAILED = "PROPOSAL_STATUS_FAILED",
  PROPOSAL_STATUS_PASSED = "PROPOSAL_STATUS_PASSED",
  PROPOSAL_STATUS_REJECTED = "PROPOSAL_STATUS_REJECTED",
  PROPOSAL_STATUS_UNSPECIFIED = "PROPOSAL_STATUS_UNSPECIFIED",
  PROPOSAL_STATUS_VOTING_PERIOD = "PROPOSAL_STATUS_VOTING_PERIOD",
}

// Values returned from the Vote Tally API
export enum VoteType {
  Abstain = "abstain",
  No = "no",
  NoWithVeto = "no_with_veto",
  Yes = "yes",
}

// Values returned from the user Vote API
export enum VoteOptionType {
  VOTE_OPTION_ABSTAIN = "VOTE_OPTION_ABSTAIN",
  VOTE_OPTION_NO = "VOTE_OPTION_NO",
  VOTE_OPTION_NO_WITH_VETO = "VOTE_OPTION_NO_WITH_VETO",
  VOTE_OPTION_UNSPECIFIED = "VOTE_OPTION_UNSPECIFIED",
  VOTE_OPTION_YES = "VOTE_OPTION_YES",
}

// Pagination related interfaces
interface PaginationResponse {
  next_key: string;
  total: string;
}

export interface PaginationParams {
  "pagination.count_total"?: boolean;
  "pagination.key"?: string;
  "pagination.limit"?: string;
  "pagination.offset"?: string;
  "pagination.reverse"?: boolean;
}

// Governance related interfaces

export interface ProposalMessage {
  "@type": ProposalMessageType;
  "authority": string;
  "content": {
    [key: string]: any;
    "@type": string;
    "changes"?: Array<{
      key: string;
      subspace: string;
      value: string;
    }>;
    "description": string;
    "title": string;
  };
  "params"?: {
    [key: string]: string;
  };
  "plan"?: {
    height: string;
    info: string;
    name: string;
    time: string;
    upgraded_client_state: null;
  };
}

export interface ProposalTallyResult {
  abstain_count: string;
  no_count: string;
  no_with_veto_count: string;
  yes_count: string;
}

type ProposalDeposit = Coin;

export interface Proposal {
  deposit_end_time: string;
  expedited: boolean;
  failed_reason: string;
  final_tally_result: ProposalTallyResult;
  id: string;
  messages: ProposalMessage[];
  metadata: string;
  proposer: string;
  status: ProposalStatus;
  submit_time: string;
  summary: string;
  title: string;
  total_deposit: ProposalDeposit[];
  voting_end_time: string;
  voting_start_time: string;
}

interface ProposalTallyTotal {
  ratio: number;
  staked: string;
  voted: string;
}

export interface ProposalDetailsResult {
  info: {
    endsDate: string;
    metaText: string;
    status: ProposalStatus;
    submittedDate: string;
    title: string;
    voteValue?: VoteOptionType;
  };
  labelOverride?: string;
  progressData: Array<{
    amount: string;
    percent: string;
    percentStaked?: string;
    type: string;
  }>;
  proposal: Proposal;
  quorum: number;
  quorumReached: boolean;
  threshold: number;
  total: ProposalTallyTotal;
}

export interface GovProposalsResponse {
  pagination: PaginationResponse;
  proposals: Proposal[];
}

export interface GovTallyParams {
  quorum: string;
  threshold: string;
  veto_threshold: string;
}

interface GovVotingParams {
  voting_period: string;
}

interface GovDepositParams {
  max_deposit_period: string;
  min_deposit: Coin[];
}

interface GovParams {
  burn_proposal_deposit_prevote: boolean;
  burn_vote_quorum: boolean;
  burn_vote_veto: boolean;
  expedited_min_deposit: Coin[];
  expedited_threshold: string;
  expedited_voting_period: string;
  max_deposit_period: string;
  min_deposit: Coin[];
  min_deposit_ratio: string;
  min_initial_deposit_ratio: string;
  proposal_cancel_dest: string;
  proposal_cancel_ratio: string;
  quorum: string;
  threshold: string;
  veto_threshold: string;
  voting_period: string;
}

interface GovParamsResponse {
  deposit_params: GovDepositParams | null;
  params: GovParams;
  tally_params: GovTallyParams | null;
  voting_params: GovVotingParams | null;
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
interface Deposit {
  amount: Coin[];
  depositor: string;
  proposal_id: string;
}

interface Vote {
  metadata: string;
  options: VoteOption[];
  proposal_id: string;
  voter: string;
}

interface VoteOption {
  option: VoteOptionType;
  weight: string;
}

export interface GovVoteResponse {
  vote: Vote;
}

// Staking related interfaces
export interface StakingPool {
  bonded_tokens: string;
  not_bonded_tokens: string;
}

export interface StakingPoolResponse {
  pool: StakingPool;
}

export type ExecuteVoteParams = {
  client: NonNullable<SigningClient>;
  memo?: string;
  option: number;
  proposalId: string;
  voter: string;
};

// Constants
export const ProposalStatusColor: Record<ProposalStatus, string> = {
  [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: "#808080",
  [ProposalStatus.PROPOSAL_STATUS_FAILED]: "#d64406",
  [ProposalStatus.PROPOSAL_STATUS_PASSED]: "#04C700",
  [ProposalStatus.PROPOSAL_STATUS_REJECTED]: "#d64406",
  [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: "#808080",
  [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: "#CAF033",
};

export const toProgressLabel: Record<VoteType, string> = {
  [VoteType.Abstain]: "abstain",
  [VoteType.No]: "no",
  [VoteType.NoWithVeto]: "noWithVeto",
  [VoteType.Yes]: "yes",
};

export const toStatusLabel: Record<ProposalStatus, string> = {
  [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: "Deposit",
  [ProposalStatus.PROPOSAL_STATUS_FAILED]: "Failed",
  [ProposalStatus.PROPOSAL_STATUS_PASSED]: "Passed",
  [ProposalStatus.PROPOSAL_STATUS_REJECTED]: "Rejected",
  [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: "Unspecified",
  [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: "Voting",
};

type ProposalMessageType = string;

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

export function getVoteTypeColorClass(type: VoteType): string {
  switch (type) {
    case VoteType.Yes:
      return "text-green-500";
    case VoteType.No:
      return "text-red-500";
    case VoteType.NoWithVeto:
      return "text-gray-500";
    case VoteType.Abstain:
      return "text-gray-500";
    default:
      return "text-white";
  }
}

export const getReadableVoteOption = (vote: VoteOptionType): string => {
  switch (vote) {
    case VoteOptionType.VOTE_OPTION_YES:
      return "Yes";
    case VoteOptionType.VOTE_OPTION_NO:
      return "No";
    case VoteOptionType.VOTE_OPTION_NO_WITH_VETO:
      return "No with Veto";
    case VoteOptionType.VOTE_OPTION_ABSTAIN:
      return "Abstain";
    default:
      return "Unknown";
  }
};

export enum ProposalType {
  PARAMS = "Parameter change",
  SPEND = "Community pool spend",
  STORE_CODE = "Store code",
  TEXT = "Text proposal",
}

interface BaseProposalValues {
  description: string;
  initialDeposit?: Coin;
  title: string;
}

export interface StoreCodeProposalValues extends BaseProposalValues {
  instantiatePermission?: AccessConfig;
  type: ProposalType.STORE_CODE;
  wasmByteCodes: Uint8Array[];
}

export type ProposalFormValues = StoreCodeProposalValues; // union with other types as they're added

export interface SubmitProposalParams {
  client: SigningClient;
  memo?: string;
  proposer: string;
  values: ProposalFormValues;
}
