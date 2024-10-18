function getEnvStringOrThrow(key: string, value?: string): string {
  if (!value) {
    throw new Error(`Environment variable ${key} must be defined`);
  }

  return value;
}

// Write helper function to get boolean environment variable
function getEnvBooleanOrThrow(key: string, value?: string): boolean {
  if (!value) {
    throw new Error(`Environment variable ${key} must be defined`);
  }

  return value === "true";
}

// The base path for the deployment
export const BASE_PATH = getEnvBooleanOrThrow(
  "NEXT_PUBLIC_IS_DEPLOYMENT",
  process.env.NEXT_PUBLIC_IS_DEPLOYMENT,
)
  ? "/xion-staking"
  : "";

// The contract address for the faucet
export const FAUCET_CONTRACT_ADDRESS =
  "xion1mczdpmlc2lcng2ktly3fapdc24zqhxsyn5eek8uu3egmrd97c73qqtss3u";

const NETWORK_TYPE = getEnvStringOrThrow(
  "NEXT_PUBLIC_NETWORK_TYPE",
  process.env.NEXT_PUBLIC_NETWORK_TYPE,
);

export const IS_TESTNET = NETWORK_TYPE === "testnet";

export interface NavItem {
  href: string;
  isRootLink?: boolean;
  label: string;
}

export const mainNavItems: NavItem[] = [
  { href: "/staking", isRootLink: true, label: "Staking" },
  { href: "/governance", label: "Governance" },
];
