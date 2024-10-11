import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { Proposal } from "../lib/types";
import { fetchProposal, fetchProposals } from "./actions";

/**
 * Fetches all proposals.
 * @returns The proposals.
 */
export const useProposals = (): UseQueryResult<Proposal[], Error> => {
  return useQuery<Proposal[], Error>({
    queryKey: ["proposals"],
    queryFn: async () => {
      const result = await fetchProposals();
      if (Array.isArray(result)) {
        return result as Proposal[];
      }
      throw new Error("Invalid response from fetchProposals");
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetches a single proposal.
 * @param proposalId - The id of the proposal.
 * @returns The proposal.
 */
export const useProposal = (
  proposalId: string,
): UseQueryResult<Proposal, Error> => {
  return useQuery<Proposal, Error>({
    queryKey: ["proposal", proposalId],
    queryFn: () => fetchProposal(proposalId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
