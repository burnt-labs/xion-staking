"use client";

import { useSearchParams } from "next/navigation";

import { LoadingBanner, Title } from "@/features/core/components/base";

import { useProposal, useProposalDetails } from "../context/hooks";
import {
  useDepositParams,
  useTallyParams,
  useVotingParams,
} from "../context/hooks";
import { BreadCrumbNav } from "./bread-crumb";
import { ProposalOverview } from "./proposal-overview";

export function TallyParams() {
  const { data: tallyParams, isLoading: isTallyLoading } = useTallyParams();

  if (isTallyLoading) {
    return <LoadingBanner />;
  }
  return (
    <div>
      <Title>Tally Parameters</Title>
      {JSON.stringify(tallyParams)}
    </div>
  );
}

export function VotingParams() {
  const { data: votingParams, isLoading: isVotingLoading } = useVotingParams();

  if (isVotingLoading) {
    return <LoadingBanner />;
  }
  return (
    <div>
      <Title>Voting Parameters</Title>
      {JSON.stringify(votingParams)}
    </div>
  );
}

export function DepositParams() {
  const { data: depositParams, isLoading: isDepositLoading } =
    useDepositParams();

  if (isDepositLoading) {
    return <LoadingBanner />;
  }
  return (
    <div>
      <Title>Deposit Parameters</Title>
      {JSON.stringify(depositParams)}
    </div>
  );
}

export default function ProposalPage() {
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposal_id");

  const { data: proposal, isLoading } = useProposal(proposalId ?? "");
  const proposalDetails = useProposalDetails(proposalId ?? "");

  console.log({ proposal, proposalDetails });

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
      <ProposalOverview proposal={proposal} />
      <VotingParams />
      <DepositParams />
      <TallyParams />
    </div>
  );
}
