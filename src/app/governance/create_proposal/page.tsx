import type { Metadata } from "next";
import { Suspense } from "react";

import NewProposalPage from "@/features/governance/components/CreateProposalPage";

export const metadata: Metadata = {
  title: "XION Governance - Create Proposal",
};

export default function Page() {
  return (
    <Suspense>
      <NewProposalPage />
    </Suspense>
  );
}
