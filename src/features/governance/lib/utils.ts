import { ProposalStatus } from "./types";

export const formatProposalDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toUTCString();
};

export const getProposalStatus = (status: string): ProposalStatus => {
  return status as ProposalStatus;
};
