import axios, { AxiosResponse } from "axios";

import { REST_URL } from "@/constants";

import { GOVERNANCE_PAGE_LIMIT } from "../config";
import { PaginationParams, Proposal, ProposalsResponse } from "../lib/types";

// Add this type for the sort order
type SortOrder = "ASC" | "DESC";

/**
 * Fetches all proposals from the governance module.
 * @param paginationParams - The pagination parameters.
 * @param sortOrder - The order to sort the proposals by ID (default: "DESC").
 * @returns An array of proposals sorted by ID.
 */
export const fetchProposals = async (
  paginationParams: PaginationParams = {
    limit: GOVERNANCE_PAGE_LIMIT.toString(),
  },
  sortOrder: SortOrder = "DESC",
): Promise<Proposal[]> => {
  let allProposals: Proposal[] = [];
  let nextKey: string | null = null;

  do {
    const params = new URLSearchParams({
      "pagination.key": nextKey || "",
      "pagination.limit":
        paginationParams.limit || GOVERNANCE_PAGE_LIMIT.toString(),
    });

    try {
      const response: AxiosResponse<ProposalsResponse> = await axios.get(
        `${REST_URL}/cosmos/gov/v1/proposals`,
        { params },
      );

      const data = response.data;
      allProposals = allProposals.concat(data.proposals);
      nextKey = data.pagination.next_key;

      paginationParams.key = nextKey || undefined;
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
      throw error;
    }
  } while (nextKey);

  // Sort the proposals by id
  allProposals.sort((a, b) => {
    const idA = parseInt(a.id);
    const idB = parseInt(b.id);
    return sortOrder === "ASC" ? idA - idB : idB - idA;
  });

  return allProposals;
};

/**
 * Fetches a single proposal from the governance module.
 * @param proposalId - The ID of the proposal.
 * @returns The proposal.
 */
export const fetchProposal = async (proposalId: string): Promise<Proposal> => {
  try {
    const response = await axios.get(
      `${REST_URL}/cosmos/gov/v1/proposals/${proposalId}`,
    );
    return response.data.proposal;
  } catch (error) {
    console.error(`Failed to fetch proposal ${proposalId}:`, error);
    throw error;
  }
};
