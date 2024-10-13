import { Coin } from "@cosmjs/proto-signing";

import { ProposalStatus, VoteType } from "./types";

export const formatProposalDate = (
  dateString: string,
  format: string = "custom",
): string => {
  const date = new Date(dateString);

  switch (format.toLowerCase()) {
    case "utc":
      return date.toUTCString();
    case "locale":
      return date.toLocaleString();
    case "iso":
      return date.toISOString();
    case "custom":
    default:
      return (
        date
          .toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
            hour12: false,
          })
          .replace(",", "") + " UTC"
      );
  }
};

export const getProposalStatus = (status: string): ProposalStatus => {
  return status as ProposalStatus;
};

export const getReadableVoteType = (voteType: VoteType): string => {
  switch (voteType) {
    case VoteType.Yes:
      return "yes";
    case VoteType.No:
      return "no";
    case VoteType.NoWithVeto:
      return "noWithVeto";
    case VoteType.Abstain:
      return "abstain";
    default:
      return "unknown";
  }
};

export function getAmount(coin: Coin, denom: string): number {
  if (coin.denom === denom) {
    return parseFloat(coin.amount);
  }
  return 0;
}

// Get a human-readable proposal type from the message type
export function getProposalType(messageType: string): string {
  const types: { [key: string]: string } = {
    "/cosmos.gov.v1beta1.TextProposal": "Text",
    "/cosmos.params.v1beta1.ParameterChangeProposal": "Parameter Change",
    "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal": "Software Upgrade",
  };
  return types[messageType] || "Unknown";
}

export function readPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function toInput(amount: number, decimals: number): number {
  return Number(amount.toFixed(decimals));
}

// Add this function to the existing utils.ts file
export function getReadableProposalStatus(status: ProposalStatus): string {
  switch (status) {
    case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
      return "Unspecified";
    case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return "Deposit";
    case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
      return "Voting";
    case ProposalStatus.PROPOSAL_STATUS_PASSED:
      return "Passed";
    case ProposalStatus.PROPOSAL_STATUS_REJECTED:
      return "Rejected";
    case ProposalStatus.PROPOSAL_STATUS_FAILED:
      return "Failed";
    default:
      return "Unknown";
  }
}

export function calculateDepositPercent(
  totalDeposit: Coin[],
  minDeposit: Coin[],
): string {
  return readPercent(
    Number(getAmount(totalDeposit[0], totalDeposit[0].denom)) /
      Number(getAmount(minDeposit[0], minDeposit[0].denom)),
  );
}
