import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { useAccount, useCosmWasmSigningClient, useDisconnect } from "graz";
import { GasPrice } from "graz/node_modules/@cosmjs/stargate";

import { IS_PRO_MODE } from "@/config";

/**
 * A unifying interface for chain account data.
 * Returns data from either Graz (in pro mode) or Abstraxion (in regular mode).
 */
export function useChainAccount() {
  // Abstraxion data:
  const { data: abstraxionData, isConnected: abstraxionIsConnected } =
    useAbstraxionAccount();

  const { client: abstraxionClient, logout: abstraxionLogout } =
    useAbstraxionSigningClient();

  // Graz data:
  const { data: grazData, isConnected: grazIsConnected } = useAccount();

  const { data: grazClient } = useCosmWasmSigningClient({
    opts: {
      gasPrice: GasPrice.fromString(process.env.NEXT_PUBLIC_GAS_PRICE || "0.025"),
      },
    },
  );

  const { disconnect: grazLogout } = useDisconnect();

  const isProMode = IS_PRO_MODE;

  const isConnected = isProMode ? grazIsConnected : abstraxionIsConnected;

  const account = isProMode ? grazData : abstraxionData;

  const address = isProMode 
    ? grazData?.bech32Address 
    : abstraxionData?.bech32Address;

  const client = isProMode ? grazClient : abstraxionClient;

  const logout = () => {
    if (isProMode) {
      grazLogout();
    } else {
      abstraxionLogout?.();
    }
  };

  return {
    account,     // same structure as Abstraxion's "data"
    address,     // bech32 address
    client,      // signing client
    isConnected,
    logout,
  };
}