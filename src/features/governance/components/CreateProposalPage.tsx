"use client";

import { SubmitProposalForm } from "../components/SubmitProposalForm";

export default function NewProposalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Submit New Proposal</h1>
      <SubmitProposalForm />
    </div>
  );
}
