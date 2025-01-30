import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";

import { REST_API_URL, REST_ENDPOINTS } from "../../../config";

const fetchBalances = async (address?: string): Promise<Coin[]> => {
  if (!address) return [];
  
  try {
    const response = await axios.get(
      `${REST_API_URL}${REST_ENDPOINTS.balances}/${address}`,
    );

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data.balances;
  } catch (error) {
    console.error("Error fetching bank balances:", error);
    throw error;
  }
};

/**
 * Hook to fetch and cache balance data for an address
 * @param address - The address to fetch balances for
 * @returns The balances and query info
 */
export const useBalances = (address?: string) =>
  useQuery({
    enabled: Boolean(address), // Only run the query when address exists
    queryFn: () => fetchBalances(address),
    queryKey: ["balances", address],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
