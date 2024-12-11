import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import { useContext, useEffect, useRef, useState } from "react";

import { fetchStakingDataAction, fetchUserDataAction } from "./actions";
import { logout } from "./reducer";
import { StakingContext } from "./state";
import type { StakingContextType } from "./state";

let cachedClient: ReturnType<typeof useAbstraxionSigningClient>["client"];

export const useStaking = () => {
  const stakingRef = useRef<StakingContextType>({} as StakingContextType);
  const staking = useContext(StakingContext);

  const [isLoading, setIsLoading] = useState(true);

  stakingRef.current.state = staking.state;
  stakingRef.current.dispatch = staking.dispatch;

  const { data: account, isConnected } = useAbstraxionAccount();
  const address = account?.bech32Address;

  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false);

      return;
    }

    const hasRequiredData =
      staking.state.validators.bonded &&
      staking.state.delegations &&
      staking.state.tokens;

    setIsLoading(!hasRequiredData);
  }, [isConnected, staking.state]);

  return {
    account,
    address,
    client: isConnected ? cachedClient : undefined,
    isConnected,
    isLoading,
    staking: stakingRef.current,
  };
};

export const useStakingSync = () => {
  const { client } = useAbstraxionSigningClient();

  const { address, isConnected, staking } = useStaking();

  cachedClient = isConnected ? client : undefined;

  useEffect(() => {
    fetchStakingDataAction(staking);
  }, [staking]);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserDataAction(address, staking);

      return () => {
        staking.dispatch(logout());
      };
    }
  }, [isConnected, address, staking]);
};
