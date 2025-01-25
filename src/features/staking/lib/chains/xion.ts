import type { AssetList, Chain } from "@chain-registry/types";

export interface Coin {
  coinDecimals: number;
  coinDenom: string;
  coinMinimalDenom: string;
  gasPriceStep: {
    average: number;
    high: number;
    low: number;
  };
}

interface Bech32Config {
  bech32PrefixAccAddr: string;
  bech32PrefixAccPub: string;
  bech32PrefixConsAddr: string;
  bech32PrefixConsPub: string;
  bech32PrefixValAddr: string;
  bech32PrefixValPub: string;
}

interface Bip44 {
  coinType: number;
}

export interface ChainInfo {
  bech32Config: Bech32Config;
  bip44: Bip44;
  chainId: string;
  chainName: string;
  currencies: Coin[];
  features: string[];
  feeCurrencies: Coin[];
  rest: string;
  rpc: string;
  stakeCurrency: Coin;
}

export const xionCoin: Coin = {
  coinDecimals: 6,
  coinDenom: "XION",
  coinMinimalDenom: "uxion",
  gasPriceStep: {
    average: 0.001,
    high: 0.001,
    low: 0.001,
  },
};

const commonInfo: ChainInfo = {
  bech32Config: {
    bech32PrefixAccAddr: "xion",
    bech32PrefixAccPub: "xionpub",
    bech32PrefixConsAddr: "xionvalcons",
    bech32PrefixConsPub: "xionvalconspub",
    bech32PrefixValAddr: "xionvaloper",
    bech32PrefixValPub: "xionvaloperpub",
  },
  bip44: {
    coinType: 118,
  },
  chainId: "base",
  chainName: "Xion Testnet",
  currencies: [xionCoin],
  features: ["cosmwasm"],
  feeCurrencies: [{
    ...xionCoin,
    gasPriceStep: {
      average: 0.001,
      high: 0.001,
      low: 0.001,
    }
  }],
  rest: "undefined",
  rpc: "undefined",
  stakeCurrency: xionCoin,
};

export const testnetChainInfo: ChainInfo = {
  ...commonInfo,
  chainId: "xion-testnet-1",
  chainName: "Xion Testnet",
  rest: "https://api.xion-testnet-1.burnt.com",
  rpc: "https://rpc.xion-testnet-1.burnt.com:443",
};

export const testChainInfo: ChainInfo = {
  ...commonInfo,
  chainId: "xion-local-testnet-1",
  chainName: "Xion Testnet Local",
  rest: "http://localhost:26656",
  rpc: "http://localhost:26657",
};

function buildCosmosKitChainSpecification(burntChainInfo: ChainInfo): Chain {
  return {
    apis: {
      rest: [
        {
          address: burntChainInfo.rest,
        },
      ],
      rpc: [
        {
          address: burntChainInfo.rpc,
        },
      ],
    },
    bech32_prefix: burntChainInfo.bech32Config.bech32PrefixAccAddr,
    chain_id: burntChainInfo.chainId,
    chain_name: burntChainInfo.chainId,
    chain_type: "cosmos" as const,
    fees: {
      fee_tokens: [
        {
          average_gas_price: 0.001,
          denom: "uxion",
          fixed_min_gas_price: 0.001,
          high_gas_price: 0.001,
          low_gas_price: 0.001,
        },
      ],
    },
    network_type: "testnet",
    staking: {
      staking_tokens: [],
    },
    status: "live",
  };
}

function buildCosmosKitAssetSpecification(
  burntChainInfo: ChainInfo
): AssetList {
  return {
    assets: [
      {
        base: "",
        denom_units: [],
        display: "Xion",
        name: "Xion token",
        symbol: "xion",
        type_asset: "sdk.coin",
      },
    ],
    chain_name: burntChainInfo.chainName,
  };
}

export const keplrChainInfos = [testnetChainInfo, testChainInfo];
export const assets = [testnetChainInfo, testChainInfo].map(
  buildCosmosKitAssetSpecification
);
export const chains = [testnetChainInfo, testChainInfo].map(
  buildCosmosKitChainSpecification
);
export const defaultFee = {
  amount: [{ amount: ".5", denom: "uxion" }],
  gas: "500000",
};