import type { Coin } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";

export const normaliseCoin = (coin: Coin) => {
  if (coin.denom?.toUpperCase() === "UXION") {
    const num = new BigNumber(coin.amount);

    return {
      amount: num.div(new BigNumber(10).pow(6)).toString(),
      denom: "XION",
    };
  }

  if (coin.denom?.toUpperCase() === "XION") {
    return {
      amount: coin.amount,
      denom: "XION",
    };
  }

  return {
    ...coin,
    denom: coin.denom?.toUpperCase(),
  };
};

const getEmptyXionCoin = () => ({ amount: "0", denom: "xion" }) satisfies Coin;

export const sumAllCoins = (coins: Coin[]) =>
  coins.reduce(
    (acc, coin) => ({
      amount: new BigNumber(acc.amount)
        .plus(normaliseCoin(coin).amount)
        .toString(),
      denom: acc.denom,
    }),
    getEmptyXionCoin(),
  );