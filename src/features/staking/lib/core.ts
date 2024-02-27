import type { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import type {
  Coin,
  MsgDelegateEncodeObject,
  MsgUndelegateEncodeObject,
  StdFee,
} from "@cosmjs/stargate";
import {
  QueryClient,
  StargateClient,
  setupDistributionExtension,
  setupIbcExtension,
  setupStakingExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import BigNumber from "bignumber.js";
import {
  MsgDelegate,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";

import { normaliseCoin } from "./coins";
import { rpcEndpoint } from "./constants";

export type SigningClient = NonNullable<
  ReturnType<typeof useAbstraxionSigningClient>["client"]
>;

const getStakingQueryClient = async () => {
  const cometClient = await Tendermint34Client.connect(rpcEndpoint);

  return QueryClient.withExtensions(
    cometClient,
    setupStakingExtension,
    setupDistributionExtension,
    setupIbcExtension,
  );
};

export const getValidatorsList = async () => {
  const queryClient = await getStakingQueryClient();

  return await queryClient.staking.validators("BOND_STATUS_BONDED");
};

export const getBalance = async (address: string) => {
  const client = await StargateClient.connect(rpcEndpoint);

  return await client.getBalance(address, "uxion");
};

export const getDelegations = async (address: string) => {
  const queryClient = await getStakingQueryClient();

  return await queryClient.staking.delegatorDelegations(address);
};

export const getRewards = async (address: string, validatorAddress: string) => {
  const queryClient = await getStakingQueryClient();

  const rewards = await queryClient.distribution.delegationRewards(
    address,
    validatorAddress,
  );

  const rewardsData = await Promise.all(
    rewards.rewards.map(async (reward) => {
      if (reward.denom.indexOf("ibc/") == 0) {
        const coin = await queryClient.ibc.transfer.denomTrace(
          reward.denom.substring(4),
        );

        reward.denom = coin.denomTrace?.baseDenom || reward.denom;
      }

      return reward;
    }),
  );

  return rewardsData
    .filter((reward) => reward.denom?.toUpperCase() === "UXION")
    .map((reward) => ({
      amount: new BigNumber(reward.amount)
        .div(new BigNumber(10).pow(18)) // Rewards with cosmjs have 18 decimal places
        .toString(),
      denom: reward.denom,
    }))
    .map((r) => normaliseCoin(r));
};

export type StakeAddresses = {
  delegator: string;
  validator: string;
};

export const stakeAmount = async (
  addresses: StakeAddresses,
  client: NonNullable<SigningClient>,
  amount: Coin,
) => {
  const msg = MsgDelegate.fromPartial({
    amount,
    delegatorAddress: addresses.delegator,
    validatorAddress: addresses.validator,
  });

  const msgAny: MsgDelegateEncodeObject = {
    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
    value: msg,
  };

  const fee: StdFee = {
    amount: [
      {
        amount: "1000",
        denom: "uxion",
      },
    ],
    gas: "200000",
    granter: addresses.delegator,
  };

  return await client.signAndBroadcast(addresses.delegator, [msgAny], fee);
};

export const unstakeAmount = async (
  addresses: StakeAddresses,
  client: NonNullable<SigningClient>,
  amount: Coin,
) => {
  const msg = MsgUndelegate.fromPartial({
    amount,
    delegatorAddress: addresses.delegator,
    validatorAddress: addresses.validator,
  });

  const msgAny: MsgUndelegateEncodeObject = {
    typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
    value: msg,
  };

  const fee: StdFee = {
    amount: [
      {
        amount: "1000",
        denom: "uxion",
      },
    ],
    gas: "200000",
    granter: addresses.delegator,
  };

  return await client.signAndBroadcast(addresses.delegator, [msgAny], fee);
};
