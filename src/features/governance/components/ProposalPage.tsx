"use client";

import { useSearchParams } from "next/navigation";

import { LoadingBanner, Title } from "@/features/core/components/base";

import { useProposal, useProposalDetails } from "../context/hooks";
import { extractProposalDetails } from "../lib/utils";
import { BreadCrumbNav } from "./BreadCrumbNav";
import { ProposalDetails } from "./ProposalDetails";
import { ProposalOverview } from "./ProposalOverview";
import { ProposalTallyWidget } from "./ProposalTallyWidget";
import { ProposalTallyingStatus } from "./ProposalTallyingStatus";

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

  if (!proposalDetails) {
    return <LoadingBanner />;
  }

  const {
    abstainPercentage,
    noPercentage,
    noWithVetoPercentage,
    status,
    submittedDate,
    title,
    voteValue,
    yesPercentage,
  } = extractProposalDetails(proposalDetails);

  return (
    <div className="page-container flex flex-col gap-6 px-[12px] pb-[24px] pt-[40px] md:px-[24px]">
      <BreadCrumbNav proposalId={proposalId} />
      {proposalDetails && (
        <>
          <ProposalOverview
            abstainPercentage={abstainPercentage}
            noPercentage={noPercentage}
            noWithVetoPercentage={noWithVetoPercentage}
            proposalId={proposalId}
            status={status}
            submittedDate={submittedDate}
            title={title}
            voteValue={voteValue}
            yesPercentage={yesPercentage}
          />
          <ProposalTallyingStatus proposalDetails={proposalDetails} />
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1">
              <ProposalDetails proposalDetails={proposalDetails} />
            </div>
            <div className="w-full md:w-[350px] md:min-w-[350px]">
              <ProposalTallyWidget
                abstainPercentage={abstainPercentage}
                noPercentage={noPercentage}
                noWithVetoPercentage={noWithVetoPercentage}
                yesPercentage={yesPercentage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
