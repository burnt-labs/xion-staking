import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import { useChain } from "@cosmos-kit/react";
import { useEffect, useState } from "react";

import { IS_MAINNET } from "@/config";

import { useProMode } from "../context/pro-mode";

export interface ChainAccount {
  account: { bech32Address?: string } | undefined;
  address: string | undefined;
  client: any;
  isConnected: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

/**
 * A unifying interface for chain account data.
 * Provides a consistent way to access account data and signing clients across different wallet providers.
 * Handles both Abstraxion and CosmosKit wallet connections based on the current route.
 *
 * @returns {Object} Account data and methods
 * @returns {Object} account - The connected account data
 * @returns {string} account.bech32Address - The account's bech32 address
 * @returns {Object} client - The signing client for transactions
 * @returns {boolean} isConnected - Whether a wallet is currently connected
 * @returns {Function} login - Method to connect a wallet
 * @returns {Function} logout - Method to disconnect the current wallet
 */
export function useChainAccount(): ChainAccount {
  const { isProMode } = useProMode();

  // Standard mode hooks
  const { data: abstraxionData, isConnected: abstraxionIsConnected } =
    useAbstraxionAccount();

  const [, setModalOpen] = useModal();

  const { client: abstraxionClient, logout: abstraxionLogout } =
    useAbstraxionSigningClient();

  // Pro mode hooks
  const {
    address: cosmosKitAddress,
    connect: cosmosKitConnect,
    disconnect,
    getSigningCosmWasmClient,
    status,
  } = useChain(IS_MAINNET ? "xion" : "xiontestnet");

  const cosmosKitIsConnected = status === "Connected";

  const [cosmosKitClient, setCosmosKitClient] = useState<any>(undefined);

  useEffect(() => {
    if (!isProMode) return;

    async function fetchWasmClient() {
      const cosmWasmClient = await getSigningCosmWasmClient();

      setCosmosKitClient(cosmWasmClient);
    }

    if (cosmosKitIsConnected) {
      fetchWasmClient();
    }
  }, [cosmosKitIsConnected, isProMode, getSigningCosmWasmClient]);

  const login = async () => {
    if (isProMode) {
      await cosmosKitConnect();
    } else {
      setModalOpen(true);
    }
  };

  const logout = () => {
    if (isProMode) {
      disconnect();
    } else {
      abstraxionLogout?.();
    }
  };

  const isConnected = isProMode ? cosmosKitIsConnected : abstraxionIsConnected;

  const account = isProMode
    ? { bech32Address: cosmosKitAddress }
    : abstraxionData;

  const address = isProMode ? cosmosKitAddress : abstraxionData?.bech32Address;

  const client = isProMode ? cosmosKitClient : abstraxionClient;

  return {
    account,
    address, // bech32 address
    client, // signing client
    isConnected,
    login, // connect wallet
    logout, // disconnect wallet
  };
}
