import type { Metadata } from "next";
import { Suspense } from "react";

import GovernancePage from "@/features/governance/components/GovernancePage";

export const metadata: Metadata = {
  title: "XION Governance",
};

export default function Page() {
  return (
    <Suspense>
      <GovernancePage />
    </Suspense>
  );
}
