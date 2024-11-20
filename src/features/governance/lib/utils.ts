import type { Coin } from "@cosmjs/proto-signing";

import type { ProposalDetailsResult, ProposalStatus } from "./types";
import { VoteType } from "./types";

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
      return `${date
        .toLocaleString("en-US", {
          day: "2-digit",
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          month: "2-digit",
          timeZone: "UTC",
          year: "numeric",
        })
        .replace(",", "")} UTC`;
  }
};

export const getProposalStatus = (status: string): ProposalStatus =>
  status as ProposalStatus;

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

export function calculateDepositPercent(
  totalDeposit: Coin[],
  minDeposit: Coin[],
): string {
  return readPercent(
    Number(getAmount(totalDeposit[0], totalDeposit[0].denom)) /
      Number(getAmount(minDeposit[0], minDeposit[0].denom)),
  );
}

export function calculateRemainingDays(endTime: string): number {
  const now = new Date();
  const end = new Date(endTime);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export function calculateVotingProgress(endTime: string): number {
  const now = new Date();
  const end = new Date(endTime);
  const totalDuration = 14 * 24 * 60 * 60 * 1000; // Assuming 14 days voting period
  const startTime = new Date(end.getTime() - totalDuration);
  const elapsedTime = now.getTime() - startTime.getTime();
  const progress = (elapsedTime / totalDuration) * 100;

  return Math.min(100, Math.max(0, progress));
}

export const getReadableVoteType = (voteType: VoteType): string => {
  switch (voteType) {
    case VoteType.Yes:
      return "Yes";
    case VoteType.No:
      return "No";
    case VoteType.NoWithVeto:
      return "No With Veto";
    case VoteType.Abstain:
      return "Abstain";
    default:
      return "Unknown";
  }
};

export const extractProposalDetails = (
  proposalDetails: ProposalDetailsResult,
) => {
  const { submittedDate, title, voteValue } = proposalDetails.info;
  const { progressData, proposal } = proposalDetails;
  const proposalId = proposal.id;

  const getVoteAmount = (type: VoteType): number => {
    const voteData = progressData.find((data) => data.type === type);

    return voteData ? Number(voteData.amount) : 0;
  };

  const totalVotes = progressData.reduce(
    (sum, data) => (data.type !== "quorum" ? sum + Number(data.amount) : sum),
    0,
  );

  const getVotePercentage = (type: VoteType): number => {
    const amount = getVoteAmount(type);

    return totalVotes > 0 ? (amount / totalVotes) * 100 : 0;
  };

  const yesPercentage = getVotePercentage(VoteType.Yes);
  const noPercentage = getVotePercentage(VoteType.No);
  const abstainPercentage = getVotePercentage(VoteType.Abstain);
  const noWithVetoPercentage = getVotePercentage(VoteType.NoWithVeto);

  const status = getProposalStatus(proposalDetails.info.status);

  return {
    abstainPercentage,
    noPercentage,
    noWithVetoPercentage,
    proposalId,
    status,
    submittedDate,
    title,
    voteValue,
    yesPercentage,
  };
};
