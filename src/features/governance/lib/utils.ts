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
