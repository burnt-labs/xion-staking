import { useMemo } from "react";

import { useAssetList } from "./useAssetList";
import { useBalances } from "./useBalances";
import { useChainAccount } from "./useChainAccount";

export function useAccountBalance() {
  const { address } = useChainAccount();

  const { data: balances, refetch: refetchBalances } = useBalances(address);
  const { data: assetList } = useAssetList();

  const { processedBalances, totalDollarValue } = useMemo(() => {
    if (!assetList || !balances)
      return { processedBalances: [], totalDollarValue: 0 };

    const processed = assetList.processBalances(balances);

    const total = processed.reduce(
      (sum, balance) => sum + (balance.dollarValue || 0),
      0,
    );

    return { processedBalances: processed, totalDollarValue: total };
  }, [assetList, balances]);

  const getBalanceByDenom = (denom: string) =>
    processedBalances.find((balance) => balance.asset.base === denom);

  return {
    assetList,
    balances: processedBalances,
    getBalanceByDenom,
    refetchBalances,
    totalDollarValue,
  };
}
