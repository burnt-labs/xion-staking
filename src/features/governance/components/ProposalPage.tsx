"use client";

import { useSearchParams } from "next/navigation";

import { LoadingBanner, Title } from "@/features/core/components/base";

import { useProposal, useProposalDetails } from "../context/hooks";
import {
  useDepositParams,
  useTallyParams,
  useVotingParams,
} from "../context/hooks";
import { BreadCrumbNav } from "./BreadCrumb";
import { ProposalOverview } from "./ProposalOverview";
import { TallyingProcedure } from "./TallyingStatus";

export default function ProposalPage() {
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposal_id");

  const { data: proposal, isLoading } = useProposal(proposalId ?? "");
  const proposalDetails = useProposalDetails(proposalId ?? "");

  if (isLoading) {
    return <LoadingBanner />;
  }

  if (!proposalId) {
    return (
      <div className="page-container flex h-screen flex-col items-center justify-center">
        <Title>Error</Title>
        <p className="mt-4 text-lg">No proposal ID provided.</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="page-container flex h-screen flex-col items-center justify-center">
        <Title>Proposal Not Found</Title>
        <p className="mt-4 text-lg">
          The requested proposal could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container flex flex-col gap-6 px-[12px] pb-[24px] pt-[40px] md:px-[24px]">
      <BreadCrumbNav proposalId={proposalId} />
      {proposalDetails && (
        <>
          <ProposalOverview proposalDetails={proposalDetails} />
          <TallyingProcedure proposalDetails={proposalDetails} />
        </>
      )}
    </div>
  );
}
