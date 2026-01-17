import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";

interface ChainAccount {
  account: { bech32Address?: string } | undefined;
  address: string | undefined;
  client: any;
  isConnected: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

/**
 * A unifying interface for chain account data.
 * Provides a consistent way to access account data and signing clients.
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
  const {
    data: abstraxionData,
    isConnected,
    login,
    logout,
  } = useAbstraxionAccount();

  const { client } = useAbstraxionSigningClient();

  return {
    account: abstraxionData,
    address: abstraxionData?.bech32Address,
    client,
    isConnected,
    login,
    logout: logout ?? (() => {}),
  };
}
