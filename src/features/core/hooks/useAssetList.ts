import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { useMemo } from "react";

import { ASSET_ENDPOINT, COINGECKO_API_URL } from "../../../config";
import type {
  Asset,
  AssetList,
  FormattedAssetAmount,
  PriceData,
} from "../types/assets";

/**
 * Fetches the asset list from the chain registry
 * @returns The asset list and query info
 */
const fetchAssetList = async (): Promise<AssetList> => {
  try {
    const response = await axios.get(ASSET_ENDPOINT);

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching asset list:", error);
    throw error;
  }
};

/**
 * Hook to fetch the asset list from the chain registry
 * @returns The asset list and query info
 */
const useAssetListQuery = () =>
  useQuery({
    queryFn: fetchAssetList,
    queryKey: ["assetList"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

/**
 * Fetches price data for assets
 * @param assets - Array of assets to fetch prices for
 * @returns Object with asset base denoms as keys and PriceData as values
 */
const fetchPrices = async (
  assets: Asset[],
): Promise<Record<string, PriceData>> => {
  const coingeckoIds = assets
    .filter((asset) => asset.coingecko_id)
    .map((asset) => asset.coingecko_id)
    .join(",");

  try {
    const response = await axios.get(
      `${COINGECKO_API_URL}?ids=${coingeckoIds}&vs_currencies=usd`,
    );

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = response;
    const prices: Record<string, PriceData> = {};

    assets.forEach((asset) => {
      if (asset.coingecko_id && data[asset.coingecko_id]) {
        prices[asset.base] = {
          last_updated: new Date().toISOString(),
          price: data[asset.coingecko_id].usd,
          source: "coingecko",
        };
      }
    });

    return prices;
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw error;
  }
};

/**
 * Hook to fetch and cache price data for assets
 * @param assets - Array of assets to fetch prices for
 * @returns Object with asset base denoms as keys and PriceData as values, along with query info
 */
const usePrices = (assets: Asset[]) =>
  useQuery({
    queryFn: () => fetchPrices(assets),
    queryKey: ["prices", assets.map((a) => a.coingecko_id).filter(Boolean)],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

/**
 * Hook to fetch and format the asset list
 * @param network - The network to fetch the asset list for; either "testnet" or "mainnet"
 * @returns The asset list and helper functions to work with the assets
 */

export const useAssetList = () => {
  const { data: assetList, ...queryInfo } = useAssetListQuery();
  const { data: priceData } = usePrices(assetList?.assets ?? []);

  const assets = useMemo(() => {
    if (!assetList) return null;

    // helper to find matching denom including IBC handling
    const getAssetByDenom = (denom: string): Asset | undefined =>
      assetList.assets.find((asset) => {
        // check base denom
        if (asset.base === denom) return true;

        // check denom units and aliases
        if (
          asset.denom_units.some(
            (unit) =>
              unit.denom === denom || (unit.aliases || []).includes(denom),
          )
        )
          return true;

        // check IBC trace if present
        if (
          asset.traces?.some((trace) => {
            if (trace.type === "ibc") {
              return trace.chain.path === denom;
            }

            return false;
          })
        )
          return true;

        return false;
      });

    const getAssetBySymbol = (symbol: string): Asset | undefined =>
      assetList.assets.find((asset) => asset.symbol === symbol);

    const getExponent = (asset: Asset, targetDenom?: string): number => {
      if (targetDenom) {
        const denomUnit = asset.denom_units.find(
          (unit) => unit.denom === targetDenom,
        );

        if (denomUnit) return denomUnit.exponent;
      }

      const displayUnit = asset.denom_units.find(
        (unit) => unit.denom === asset.display,
      );

      return displayUnit?.exponent || 6;
    };

    const getAssetImageUrl = (asset: Asset): string | undefined =>
      asset.logo_URIs?.svg ||
      asset.logo_URIs?.png ||
      asset.images?.[0]?.svg ||
      asset.images?.[0]?.png;

    const formatAsset = (
      amount: number | string,
      denom: string,
      options?: {
        decimals?: number;
        displayDenom?: string;
        includeDollarValue?: boolean;
        includeSymbol?: boolean;
      },
    ): FormattedAssetAmount | null => {
      const asset = getAssetByDenom(denom);

      if (!asset) return null;

      const exponent = getExponent(asset, options?.displayDenom);
      const value = Number(amount) / Math.pow(10, exponent);
      const displayAmount = value.toFixed(options?.decimals ?? exponent);

      const price = priceData?.[asset.base]?.price ?? 0;
      const dollarValue = value * price;

      return {
        asset,
        baseAmount: amount.toString(),
        decimals: exponent,
        display: options?.includeSymbol
          ? `${displayAmount} ${asset.symbol}`
          : displayAmount,
        displayAmount,
        dollarValue: options?.includeDollarValue ? dollarValue : undefined,
        imageUrl: getAssetImageUrl(asset),
        price,
        symbol: asset.symbol,
        value,
      };
    };

    const convertToBaseAmount = (
      amount: number | string,
      denom: string,
      fromDenom?: string,
    ): string => {
      const asset = getAssetByDenom(denom);

      if (!asset) return amount.toString();

      const exponent = getExponent(asset, fromDenom);

      return (Number(amount) * Math.pow(10, exponent)).toString();
    };

    const processBalances = (balances: Coin[]): FormattedAssetAmount[] =>
      balances
        .map((balance) => {
          const formatted = formatAsset(balance.amount, balance.denom, {
            includeDollarValue: true,
            includeSymbol: true,
          });

          return formatted;
        })
        .filter((balance): balance is FormattedAssetAmount => balance !== null);

    return {
      assets: assetList.assets,
      chainName: assetList.chain_name,
      convertToBaseAmount,
      formatAsset,
      getAssetByDenom,
      getAssetBySymbol,
      getAssetImageUrl,
      priceData,
      processBalances,
    };
  }, [assetList, priceData]);

  return {
    ...queryInfo,
    data: assets,
  };
};
