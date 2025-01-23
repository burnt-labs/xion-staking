import { useContext, useEffect, useRef, useState } from "react";
import { StakingContext } from "./state";
import type { StakingContextType } from "./state";
import { fetchStakingDataAction, fetchUserDataAction } from "./actions";
import { logout } from "./reducer";
import { useChainAccount } from "@/features/core/hooks/useChainAccount";

export const useStaking = () => {
  const stakingRef = useRef<StakingContextType>({} as StakingContextType);
  const staking = useContext(StakingContext);

  const [isLoading, setIsLoading] = useState(true);

  stakingRef.current.state = staking.state;
  stakingRef.current.dispatch = staking.dispatch;

  const { account, address, client, isConnected } = useChainAccount();

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
    client,
    isConnected,
    isLoading,
    staking: stakingRef.current,
  };
};

export const useStakingSync = () => {
  const { address, isConnected, staking } = useStaking();

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
