import { notFound } from "next/navigation";
import StakingPage from "@/features/staking/components/main-page";
import ValidatorPage from "@/features/staking/components/validator-page";

const VALID_ROUTES = {
  staking: StakingPage,
  validator: ValidatorPage,
} as const;

export function generateStaticParams() {
  return Object.keys(VALID_ROUTES).map((path) => ({
    path: [path],
  }));
}

export default function ProCatchAllPage({
  params: { path: [path] },
}: {
  params: { path: string[] };
}) {
  const PageComponent = VALID_ROUTES[path as keyof typeof VALID_ROUTES];

  if (!PageComponent) {
    notFound();
  }

  return <PageComponent />;
} 
