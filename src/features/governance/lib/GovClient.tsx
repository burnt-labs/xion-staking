import axios, { AxiosResponse } from "axios";

import { PaginationParams, Proposal, ProposalsResponse } from "./types";

export class GovClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getProposals(
    paginationParams: PaginationParams = { limit: "6" },
  ): Promise<Proposal[]> {
    let allProposals: Proposal[] = [];
    let nextKey: string | null = null;

    do {
      const params = new URLSearchParams({
        "pagination.key": nextKey || "",
        "pagination.limit": paginationParams.limit || "6",
      });

      const response: AxiosResponse<ProposalsResponse> = await axios.get(
        `${this.baseUrl}/cosmos/gov/v1beta1/proposals`,
        { params },
      );

      const data = response.data;
      allProposals = allProposals.concat(data.proposals);
      nextKey = data.pagination.next_key;

      // Update the pagination key for the next iteration
      paginationParams.key = nextKey || undefined;
    } while (nextKey);

    return allProposals;
  }

  async getProposal(proposalId: string): Promise<Proposal> {
    const response = await axios.get(
      `${this.baseUrl}/cosmos/gov/v1beta1/proposals/${proposalId}`,
    );
    return response.data.proposal;
  }
}
