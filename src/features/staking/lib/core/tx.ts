import type {
  Coin,
  DeliverTxResponse,
  MsgBeginRedelegateEncodeObject,
  MsgDelegateEncodeObject,
  MsgUndelegateEncodeObject,
  MsgWithdrawDelegatorRewardEncodeObject,
} from "@cosmjs/stargate";
import BigNumber from "bignumber.js";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgCancelUnbondingDelegation,
  MsgDelegate,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";

import { MIN_CLAIMABLE_XION } from "@/constants";

import type { Unbonding } from "../../context/state";
import { type SigningClient } from "./client";
import { getUXionCoinFromXion, normaliseCoin } from "./coins";

const getTxCoin = (coin: Coin) => ({
  amount: coin.amount,
  denom: ["UXION", "XION"].includes(coin.denom.toUpperCase())
    ? coin.denom.toLowerCase() // Transactions expect lower case
    : coin.denom,
});

const getUxionAmount = (coin: Coin) => {
  if (coin.denom.toUpperCase() === "UXION") {
    return getTxCoin(coin);
  }

  if (coin.denom.toUpperCase() === "XION") {
    return getTxCoin(getUXionCoinFromXion(new BigNumber(coin.amount)));
  }

  throw new Error("Invalid coin denom");
};

export const getTxVerifier =
  (eventType: string) => (result: DeliverTxResponse) => {
    // eslint-disable-next-line no-console
    console.log("debug: base.ts: result", result);

    if (!result.events.find((e) => e.type === eventType)) {
      console.error(result);
      throw new Error("Out of gas");
    }

    return result;
  };

export const handleTxError = (err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err);

  throw err;
};

export type StakeAddresses = {
  delegator: string;
  validator: string;
};

export const stakeAmount = async (
  addresses: StakeAddresses,
  client: SigningClient,
  initialAmount: Coin,
  memo: string,
) => {
  const amount = getUxionAmount(initialAmount);

  const msg = MsgDelegate.fromPartial({
    amount,
    delegatorAddress: addresses.delegator,
    validatorAddress: addresses.validator,
  });

  const messageWrapper: MsgDelegateEncodeObject = {
    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
    value: msg,
  };

  return await client
    .signAndBroadcast(addresses.delegator, [messageWrapper], "auto", memo)
    .then(getTxVerifier("delegate"))
    .catch(handleTxError);
};

export const unstakeAmount = async (
  addresses: StakeAddresses,
  client: SigningClient,
  initialAmount: Coin,
  memo: string,
) => {
  const amount = getUxionAmount(initialAmount);

  const msg = MsgUndelegate.fromPartial({
    amount,
    delegatorAddress: addresses.delegator,
    validatorAddress: addresses.validator,
  });

  const messageWrapper: MsgUndelegateEncodeObject = {
    typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
    value: msg,
  };

  return await client
    .signAndBroadcast(addresses.delegator, [messageWrapper], "auto", memo)
    .then(getTxVerifier("unbond"))
    .catch(handleTxError);
};

export type RedelegateParams = {
  amount: Coin;
  client: SigningClient;
  delegatorAddress: string;
  memo: string;
  validatorDstAddress: string;
  validatorSrcAddress: string;
};

export const redelegate = async ({
  amount: initialAmount,
  client,
  delegatorAddress,
  memo,
  validatorDstAddress,
  validatorSrcAddress,
}: RedelegateParams) => {
  const amount = getUxionAmount(initialAmount);

  const msg = MsgBeginRedelegate.fromPartial({
    amount,
    delegatorAddress,
    validatorDstAddress,
    validatorSrcAddress,
  });

  const messageWrapper: MsgBeginRedelegateEncodeObject = {
    typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
    value: msg,
  };

  return await client
    .signAndBroadcast(delegatorAddress, [messageWrapper], "auto", memo)
    .then(getTxVerifier("redelegate"))
    .catch(handleTxError);
};

export const claimRewards = async (
  addresses: StakeAddresses,
  client: SigningClient,
) => {
  const msg = MsgWithdrawDelegatorReward.fromPartial({
    delegatorAddress: addresses.delegator,
    validatorAddress: addresses.validator,
  });

  const messageWrapper = [
    {
      typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
      value: msg,
    } satisfies MsgWithdrawDelegatorRewardEncodeObject,
  ];

  return await client
    .signAndBroadcast(addresses.delegator, messageWrapper, 2.3)
    .then(getTxVerifier("withdraw_rewards"))
    .catch(handleTxError);
};

export const getCanClaimRewards = (rewards?: Coin) => {
  if (!rewards) {
    return false;
  }

  const normalised = normaliseCoin(rewards);

  return new BigNumber(normalised.amount).gte(MIN_CLAIMABLE_XION);
};

export const cancelUnbonding = async (
  addresses: StakeAddresses,
  unbonding: Unbonding,
  client: SigningClient,
) => {
  if ("registry" in client) {
    client.registry.register(
      MsgCancelUnbondingDelegation.typeUrl,
      MsgCancelUnbondingDelegation as any,
    );
  }

  const msg = MsgCancelUnbondingDelegation.fromPartial({
    amount: unbonding.balance,
    creationHeight: unbonding.creationHeight,
    delegatorAddress: addresses.delegator,
    validatorAddress: addresses.validator,
  });

  const messageWrapper = [
    {
      typeUrl: "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation",
      value: msg,
    },
  ];

  return await client
    .signAndBroadcast(addresses.delegator, messageWrapper, "auto", "")
    .then(getTxVerifier("cancel_unbonding_delegation"))
    .catch(handleTxError);
};

type BatchClaimAddresses = {
  delegator: string;
  validators: string[];
};

export const batchClaimRewards = async (
  addresses: BatchClaimAddresses,
  client: SigningClient,
) => {
  if (!addresses.validators.length) return;

  const messages = addresses.validators.map(
    (validatorAddress) =>
      ({
        typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        value: MsgWithdrawDelegatorReward.fromPartial({
          delegatorAddress: addresses.delegator,
          validatorAddress,
        }),
      }) satisfies MsgWithdrawDelegatorRewardEncodeObject,
  );

  return await client
    .signAndBroadcast(addresses.delegator, messages, 2.3)
    .then(getTxVerifier("withdraw_rewards"))
    .catch(handleTxError);
};
