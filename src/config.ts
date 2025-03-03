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

export const NETWORK_TYPES = {
  MAINNET: {
    id: "mainnet",
    version: "1",
  },
  TESTNET_1: {
    id: "testnet",
    version: "1",
  },
  TESTNET_2: {
    id: "testnet-2",
    version: "2",
  },
} as const;

export type NetworkType = keyof typeof NETWORK_TYPES;

const NETWORK_ID = getEnvStringOrThrow(
  "NEXT_PUBLIC_NETWORK_TYPE",
  process.env.NEXT_PUBLIC_NETWORK_TYPE,
);

// Find the network type based on the ID
const NETWORK_TYPE = (Object.keys(NETWORK_TYPES) as NetworkType[]).find(
  (key) => NETWORK_TYPES[key].id === NETWORK_ID
) || "TESTNET_1" as NetworkType;

export const NETWORK_CONFIG = NETWORK_TYPES[NETWORK_TYPE];

export const IS_TESTNET = NETWORK_TYPE !== "MAINNET";

export const NETWORK_VERSION = NETWORK_CONFIG.version;

export interface NavItem {
  href: string;
  label: string;
}

export const mainNavItems: NavItem[] = [
  { href: "staking", label: "Staking" },
  { href: "governance", label: "Governance" },
];

const ASSET_ENDPOINTS = {
  mainnet: "https://assets.xion.burnt.com/chain-registry/xion/assetlist.json",
  testnet: "https://assets.xion.burnt.com/chain-registry/testnets/xiontestnet/assetlist.json",
} as const;

export const ASSET_ENDPOINT = IS_TESTNET
  ? ASSET_ENDPOINTS.testnet
  : ASSET_ENDPOINTS.mainnet;

export const COINGECKO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price";

export const RPC_URL = IS_TESTNET
  ? `https://rpc.xion-testnet-${NETWORK_VERSION}.burnt.com:443`
  : "https://rpc.xion-mainnet-1.burnt.com:443";

export const REST_API_URL = IS_TESTNET
  ? `https://api.xion-testnet-${NETWORK_VERSION}.burnt.com`
  : "https://api.xion-mainnet-1.burnt.com";

export const REST_ENDPOINTS = {
  balances: "/cosmos/bank/v1beta1/balances",
  distributionParams: "/cosmos/distribution/v1beta1/params",
  inflation: "/xion/mint/v1/inflation",
  simulate: "/cosmos/tx/v1beta1/simulate",
} as const;

export const GAS_CONFIG = {
  defaultMultiplier: 2.3,
  defaultStakeEstimate: 200000,
  price: "0.001",
} as const;
