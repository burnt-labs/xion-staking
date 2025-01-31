"use client";

import { useAbstraxionAccount } from "@burnt-labs/abstraxion";

import { SubmitProposalForm } from "../components/SubmitProposalForm";

export default function NewProposalPage() {
  const { isConnected } = useAbstraxionAccount();

  if (!isConnected) {
    return <div>Connect your wallet to create a proposal</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Submit New Proposal</h1>
      <SubmitProposalForm />
    </div>
  );
}
