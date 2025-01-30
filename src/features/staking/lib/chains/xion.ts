import type { AssetList, Chain } from "@chain-registry/types";

interface Coin {
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

interface ChainInfo {
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
  pretty_name?: string;
  stakeCurrency: Coin;
  walletUrlForStaking?: string;
}

const xionCoin: Coin = {
  coinDecimals: 6,
  coinDenom: "XION",
  coinImageUrl:
    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-testnet/chain.png",
  coinMinimalDenom: "uxion",
  gasPriceStep: {
    average: 0.01,
    high: 0.02,
    low: 0.005,
  },
};

const mainnetCoin: Coin = {
  coinDecimals: 6,
  coinDenom: "XION",
  coinGeckoId: "xion-2",
  coinImageUrl:
    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
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
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-testnet/chain.png",
  currencies: [xionCoin],
  features: ["cosmwasm"],
  feeCurrencies: [
    {
      ...xionCoin,
      gasPriceStep: {
        average: 0.01,
        high: 0.02,
        low: 0.005,
      },
    },
  ],
  nodeProvider: {
    email: "security@lavenderfive.com",
    name: "Dylan Schultzie",
    website: "https://lavenderfive.com",
  },
  stakeCurrency: {
    ...xionCoin,
    coinImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-testnet/chain.png",
  },
};

const mainnetChainInfo: ChainInfo = {
  ...commonInfo,
  chainId: "xion-mainnet-1",
  chainName: "xion",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
  currencies: [mainnetCoin],
  feeCurrencies: [
    {
      ...mainnetCoin,
      gasPriceStep: {
        average: 0.001,
        high: 0.002,
        low: 0.0005,
      },
    },
  ],
  pretty_name: "Xion",
  stakeCurrency: {
    ...mainnetCoin,
    coinImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/xion-mainnet/chain.png",
  },
  walletUrlForStaking: "https://wallet.keplr.app/chains/xion",
};

const testnetChainInfo: ChainInfo = {
  ...commonInfo,
  chainId: "xion-testnet-1",
  chainName: "xiontestnet",
  pretty_name: "Xion Testnet",
};

const testChainInfo: ChainInfo = {
  ...commonInfo,
  chainId: "xion-local-testnet-1",
  chainName: "Xion Testnet Local",
  pretty_name: "Xion Local Testnet",
};

function buildCosmosKitChainSpecification(burntChainInfo: ChainInfo): Chain {
  return {
    bech32_prefix: burntChainInfo.bech32Config.bech32PrefixAccAddr,
    chain_id: burntChainInfo.chainId,
    chain_name: burntChainInfo.chainName,
    chain_type: "cosmos" as const,
    fees: {
      fee_tokens: [
        {
          average_gas_price:
            burntChainInfo.feeCurrencies[0].gasPriceStep.average,
          denom: burntChainInfo.feeCurrencies[0].coinMinimalDenom,
          fixed_min_gas_price: burntChainInfo.feeCurrencies[0].gasPriceStep.low,
          high_gas_price: burntChainInfo.feeCurrencies[0].gasPriceStep.high,
          low_gas_price: burntChainInfo.feeCurrencies[0].gasPriceStep.low,
        },
      ],
    },
    network_type: burntChainInfo.chainId.includes("mainnet")
      ? "mainnet"
      : "testnet",
    pretty_name: burntChainInfo.pretty_name,
    slip44: burntChainInfo.bip44.coinType,
    staking: {
      staking_tokens: [],
    },
    status: "live",
  };
}

function buildCosmosKitAssetSpecification(
  burntChainInfo: ChainInfo,
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
    chain_name: burntChainInfo.chainName,
  };
}

export const assets = [mainnetChainInfo, testnetChainInfo, testChainInfo].map(
  buildCosmosKitAssetSpecification,
);
export const chains = [mainnetChainInfo, testnetChainInfo, testChainInfo].map(
  buildCosmosKitChainSpecification,
);
