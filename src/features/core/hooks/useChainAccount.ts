import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
// import { GasPrice } from "graz/node_modules/@cosmjs/stargate";

import { useChain } from "@cosmos-kit/react";
import { useEffect, useState } from "react";

import { IS_PRO_MODE } from "@/config";

/**
 * A unifying interface for chain account data.
 */
export function useChainAccount() {
  // Abstraxion
  const { data: abstraxionData, isConnected: abstraxionIsConnected } =
    useAbstraxionAccount();

  const { client: abstraxionClient, logout: abstraxionLogout } =
    useAbstraxionSigningClient();

  // CosmosKit
  const { address: cosmosKitAddress, status, getSigningCosmWasmClient, disconnect } =
    useChain(IS_PRO_MODE ? (process.env.NEXT_PUBLIC_IS_TESTNET
      ? "xion-testnet-1"
      : "xion-testnet-1") : "");
  const cosmosKitIsConnected = status === "Connected";

  const [cosmosKitClient, setCosmosKitClient] = useState<any>(undefined);

  useEffect(() => {
    if (!IS_PRO_MODE) return;
    async function fetchWasmClient() {
      const cosmWasmClient = await getSigningCosmWasmClient();
      setCosmosKitClient(cosmWasmClient);
    }
    if (cosmosKitIsConnected) {
      fetchWasmClient();
    }
  }, [IS_PRO_MODE, cosmosKitIsConnected, getSigningCosmWasmClient]);

  const logout = () => {
    if (IS_PRO_MODE) {
      disconnect();
    } else {
      abstraxionLogout?.();
    }
  };

  const isConnected = IS_PRO_MODE ? cosmosKitIsConnected : abstraxionIsConnected;

  const account = IS_PRO_MODE
    ? { bech32Address: cosmosKitAddress }
    : abstraxionData;
  const address = IS_PRO_MODE
    ? cosmosKitAddress
    : abstraxionData?.bech32Address;
  const client = IS_PRO_MODE ? cosmosKitClient : abstraxionClient;

  return {
    account,     
    address,     // bech32 address
    client,      // signing client
    isConnected,
    logout,
  };
}