type ChainId =
  | "xion-devnet-1"
  | "xion-mainnet-1"
  | "xion-testnet-1"
  | "xion-testnet-2";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID as ChainId;

export const IS_MAINNET = CHAIN_ID === "xion-mainnet-1";

export interface NavItem {
  href: string;
  label: string;
}

export const mainNavItems: NavItem[] = [
  { href: "/staking", label: "Staking" },
  { href: "/governance", label: "Governance" },
];

const ASSET_ENDPOINTS = {
  "xion-devnet-1":
    "https://assets.xion.burnt.com/chain-registry/devnets/xiondevnet1/assetlist.json",
  "xion-mainnet-1":
    "https://assets.xion.burnt.com/chain-registry/xion/assetlist.json",
  "xion-testnet-1":
    "https://assets.xion.burnt.com/chain-registry/testnets/xiontestnet/assetlist.json",
  "xion-testnet-2":
    "https://assets.xion.burnt.com/chain-registry/testnets/xiontestnet2/assetlist.json",
} as const;

export const ASSET_ENDPOINT = process.env.NEXT_PUBLIC_ASSET_ENDPOINT
  ? process.env.NEXT_PUBLIC_ASSET_ENDPOINT
  : ASSET_ENDPOINTS[CHAIN_ID];

export const COINGECKO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price";

const RPC_URLS = {
  "xion-devnet-1": "http://localhost:26657",
  "xion-mainnet-1": "https://rpc.xion-mainnet-1.burnt.com:443",
  "xion-testnet-1": "https://rpc.xion-testnet-1.burnt.com:443",
  "xion-testnet-2": "https://rpc.xion-testnet-2.burnt.com:443",
};

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_ENDPOINT
  ? process.env.NEXT_PUBLIC_RPC_ENDPOINT
  : RPC_URLS[CHAIN_ID];

const REST_API_URLS = {
  "xion-devnet-1": "http://localhost:1317",
  "xion-mainnet-1": "https://api.xion-mainnet-1.burnt.com",
  "xion-testnet-1": "https://api.xion-testnet-1.burnt.com",
  "xion-testnet-2": "https://api.xion-testnet-2.burnt.com",
};

export const REST_API_URL = process.env.NEXT_PUBLIC_REST_API_URL
  ? process.env.NEXT_PUBLIC_REST_API_URL
  : REST_API_URLS[CHAIN_ID];

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
