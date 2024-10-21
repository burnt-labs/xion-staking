import type { Metadata } from "next";
import { Suspense } from "react";

import ProposalPage from "@/features/governance/components/ProposalPage";

export const metadata: Metadata = {
  title: "XION Governance Proposal",
};

export default function Page() {
  return (
    <Suspense>
      <ProposalPage />
    </Suspense>
  );
}
