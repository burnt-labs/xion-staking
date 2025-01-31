import { notFound } from "next/navigation";

// Import all possible page components
import GovernancePage from "@/features/governance/components/GovernancePage";
import ProposalPage from "@/features/governance/components/ProposalPage";
import StakingPage from "@/features/staking/components/main-page";
import ValidatorPage from "@/features/staking/components/validator-page";

const VALID_ROUTES = {
  "governance": GovernancePage,
  "governance/proposal": ProposalPage,
  "staking": StakingPage,
  "validator": ValidatorPage,
} as const;

export function generateStaticParams() {
  return Object.keys(VALID_ROUTES).map((path) => ({
    path: path.split("/"),
  }));
}

export default function ProCatchAllPage({
  params: { path },
}: {
  params: { path: string[] };
}) {
  const pathKey = path.join("/") as keyof typeof VALID_ROUTES;
  const PageComponent = VALID_ROUTES[pathKey];

  if (!PageComponent) {
    notFound();
  }

  return <PageComponent />;
}
