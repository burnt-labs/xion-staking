import type { AssetList, Chain } from "@chain-registry/types";

export interface Coin {
  coinDecimals: number;
  coinDenom: string;
  coinGeckoId?: string;
  coinImageUrl?: string;
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
  chainSymbolImageUrl?: string;
  currencies: Coin[];
  features: string[];
  feeCurrencies: Coin[];
  nodeProvider?: {
    email: string;
    name: string;
    website: string;
  };
  rest: string;
  rpc: string;
  stakeCurrency: Coin;
  walletUrlForStaking?: string;
}

export const xionCoin: Coin = {
  coinDecimals: 6,
  coinDenom: "XION",
  coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-testnet/chain.png",
  coinMinimalDenom: "uxion",
  gasPriceStep: {
    average: 0.01,
    high: 0.02,
    low: 0.005,
  },
};

export const mainnetCoin: Coin = {
  coinDecimals: 6,
  coinDenom: "XION",
  coinGeckoId: "xion-2",
  coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
  coinMinimalDenom: "uxion",
  gasPriceStep: {
    average: 0.001,
    high: 0.002,
    low: 0.0005,
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
  chainSymbolImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-testnet/chain.png",
  currencies: [xionCoin],
  features: ["cosmwasm"],
  feeCurrencies: [{
    ...xionCoin,
    gasPriceStep: {
      average: 0.01,
      high: 0.02,
      low: 0.005,
    }
  }],
  nodeProvider: {
    email: "security@lavenderfive.com",
    name: "Dylan Schultzie",
    website: "https://lavenderfive.com"
  },
  rest: "undefined",
  rpc: "undefined",
  stakeCurrency: {
    ...xionCoin,
    coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-testnet/chain.png"
  }
};

export const mainnetChainInfo: ChainInfo = {
  ...commonInfo,
  chainId: "xion-mainnet-1",
  chainName: "XION",
  chainSymbolImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
  currencies: [mainnetCoin],
  feeCurrencies: [{
    ...mainnetCoin,
    gasPriceStep: {
      average: 0.001,
      high: 0.002,
      low: 0.0005,
    }
  }],
  rest: "https://lcd-xion.keplr.app",
  rpc: "https://rpc-xion.keplr.app",
  stakeCurrency: {
    ...mainnetCoin,
    coinImageUrl: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png"
  },
  walletUrlForStaking: "https://wallet.keplr.app/chains/xion"
};

export const testnetChainInfo: ChainInfo = {
  ...commonInfo,
  chainId: "xion-testnet-1",
  chainName: "Xion Testnet",
  rest: "https://api.xion-testnet-1.burnt.com/",
  rpc: "https://rpc.xion-testnet-1.burnt.com/",
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
          average_gas_price: burntChainInfo.feeCurrencies[0].gasPriceStep.average,
          denom: burntChainInfo.feeCurrencies[0].coinMinimalDenom,
          fixed_min_gas_price: burntChainInfo.feeCurrencies[0].gasPriceStep.low,
          high_gas_price: burntChainInfo.feeCurrencies[0].gasPriceStep.high,
          low_gas_price: burntChainInfo.feeCurrencies[0].gasPriceStep.low,
        },
      ],
    },
    network_type: burntChainInfo.chainId.includes("mainnet") ? "mainnet" : "testnet",
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
        base: burntChainInfo.stakeCurrency.coinMinimalDenom,
        coingecko_id: burntChainInfo.stakeCurrency.coinGeckoId,
        denom_units: [
          {
            denom: burntChainInfo.stakeCurrency.coinMinimalDenom,
            exponent: 0,
          },
          {
            denom: burntChainInfo.stakeCurrency.coinDenom,
            exponent: burntChainInfo.stakeCurrency.coinDecimals,
          },
        ],
        display: burntChainInfo.stakeCurrency.coinDenom,
        name: `${burntChainInfo.chainName} token`,
        symbol: burntChainInfo.stakeCurrency.coinDenom.toLowerCase(),
        type_asset: "sdk.coin",
      },
    ],
    chain_name: burntChainInfo.chainId,
  };
}

export const keplrChainInfos = [mainnetChainInfo, testnetChainInfo, testChainInfo];
export const assets = [mainnetChainInfo, testnetChainInfo, testChainInfo].map(
  buildCosmosKitAssetSpecification
);
export const chains = [mainnetChainInfo, testnetChainInfo, testChainInfo].map(
  buildCosmosKitChainSpecification
);
export const defaultFee = {
  amount: [{ amount: ".5", denom: "uxion" }],
  gas: "500000",
};