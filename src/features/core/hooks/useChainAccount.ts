import { useAbstraxionAccount, useAbstraxionSigningClient, useModal } from "@burnt-labs/abstraxion";
// import { GasPrice } from "graz/node_modules/@cosmjs/stargate";

import { useChain } from "@cosmos-kit/react";
import { useEffect, useState } from "react";

import { IS_PRO_MODE, IS_TESTNET } from "@/config";

/**
 * A unifying interface for chain account data.
 * Provides a consistent way to access account data and signing clients across different wallet providers.
 * Handles both Abstraxion and CosmosKit wallet connections based on the IS_PRO_MODE flag.
 * 
 * @returns {Object} Account data and methods
 * @returns {Object} account - The connected account data
 * @returns {string} account.bech32Address - The account's bech32 address
 * @returns {Object} client - The signing client for transactions
 * @returns {boolean} isConnected - Whether a wallet is currently connected
 * @returns {Function} login - Method to connect a wallet
 * @returns {Function} logout - Method to disconnect the current wallet
 */
export function useChainAccount() {
  // Abstraxion
  const { data: abstraxionData, isConnected: abstraxionIsConnected } =
    useAbstraxionAccount();

  const [, setModalOpen] = useModal();

  const { client: abstraxionClient, logout: abstraxionLogout } =
    useAbstraxionSigningClient();

  // CosmosKit
  const { 
    address: cosmosKitAddress,
    connect: cosmosKitConnect,
    disconnect,
    getSigningCosmWasmClient,
    status
  } = useChain(IS_TESTNET ? "xion-testnet-1" : "xion-mainnet-1");

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
  }, [cosmosKitIsConnected, getSigningCosmWasmClient]);

  const login = async () => {
    if (IS_PRO_MODE) {
      await cosmosKitConnect();
    } else {
      setModalOpen(true);
    }
  };

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
    login,       // connect wallet
    logout,      // disconnect wallet
  };
}