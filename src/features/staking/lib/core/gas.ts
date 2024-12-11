import type { Coin } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";

import { GAS_CONFIG, REST_API_URL, REST_ENDPOINTS } from "@/config";

type StakingMessageType =
  | "claim_rewards"
  | "delegate"
  | "redelegate"
  | "undelegate";

interface BaseGasEstimationParams {
  amount: Coin;
  delegator: string;
  validator: string;
}

interface RedelegateGasParams extends BaseGasEstimationParams {
  validatorDst: string;
  validatorSrc: string;
}

type GasEstimationParams = BaseGasEstimationParams & {
  messageType: StakingMessageType;
  redelegateParams?: Omit<RedelegateGasParams, keyof BaseGasEstimationParams>;
};

function getMessageBody(params: GasEstimationParams) {
  const baseAmount = {
    amount: params.amount,
    delegator_address: params.delegator,
  };

  switch (params.messageType) {
    case "delegate":
      return {
        "@type": "/cosmos.staking.v1beta1.MsgDelegate",
        ...baseAmount,
        "validator_address": params.validator,
      };

    case "redelegate":
      if (!params.redelegateParams) {
        throw new Error("Redelegate params required for redelegate message");
      }

      return {
        "@type": "/cosmos.staking.v1beta1.MsgBeginRedelegate",
        ...baseAmount,
        "validator_dst_address": params.redelegateParams.validatorDst,
        "validator_src_address": params.redelegateParams.validatorSrc,
      };

    case "undelegate":
      return {
        "@type": "/cosmos.staking.v1beta1.MsgUndelegate",
        ...baseAmount,
        "validator_address": params.validator,
      };

    case "claim_rewards":
      return {
        "@type": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        "delegator_address": params.delegator,
        "validator_address": params.validator,
      };

    default:
      throw new Error(`Unsupported message type: ${params.messageType}`);
  }
}

function estimateGasStatic(): BigNumber {
  const gasPrice = new BigNumber(GAS_CONFIG.price);

  return new BigNumber(GAS_CONFIG.defaultStakeEstimate)
    .multipliedBy(gasPrice)
    .multipliedBy(GAS_CONFIG.defaultMultiplier)
    .dividedBy(1e6);
}

async function estimateGasViaRest(
  params: GasEstimationParams,
): Promise<BigNumber> {
  const body = {
    gas_adjustment: GAS_CONFIG.defaultMultiplier.toString(),
    messages: [getMessageBody(params)],
  };

  try {
    const response = await fetch(`${REST_API_URL}${REST_ENDPOINTS.simulate}`, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to simulate transaction");
    }

    const data = await response.json();
    const gasUsed = data.gas_info?.gas_used || GAS_CONFIG.defaultStakeEstimate;

    const gasPrice = new BigNumber(GAS_CONFIG.price);

    return new BigNumber(gasUsed).multipliedBy(gasPrice).dividedBy(1e6);
  } catch (error) {
    console.warn("Gas estimation via REST failed:", error);

    return estimateGasStatic();
  }
}

export async function estimateGas(
  params: GasEstimationParams,
): Promise<BigNumber> {
  try {
    return await estimateGasViaRest(params);
  } catch (error) {
    console.warn("All gas estimation methods failed, using static fallback");

    return estimateGasStatic();
  }
}
