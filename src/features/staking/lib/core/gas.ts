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

function getMessageBody(params: GasEstimationParams): SimulateRequestMessage {
  const baseAmount = {
    amount: params.amount,
    delegator_address: params.delegator,
  };

  const message = (() => {
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
  })();

  return {
    type_url: message["@type"],
    value: Buffer.from(JSON.stringify(message)).toString("base64"),
  };
}

function estimateGasStatic(): BigNumber {
  const gasPrice = new BigNumber(GAS_CONFIG.price);

  return new BigNumber(GAS_CONFIG.defaultStakeEstimate)
    .multipliedBy(gasPrice)
    .multipliedBy(GAS_CONFIG.defaultMultiplier)
    .dividedBy(1e6);
}

interface SimulateRequestMessage {
  type_url: string;
  value: string;
}

interface SimulateRequest {
  tx: {
    auth_info?: {
      fee?: {
        amount?: Array<{
          amount: string;
          denom: string;
        }>;
        gas_limit?: string;
        granter?: string;
        payer?: string;
      };
      signer_infos?: Array<{
        mode_info?: {
          multi?: {
            bitarray?: {
              elems: string;
              extra_bits_stored: number;
            };
            mode_infos?: string[];
          };
          single?: {
            mode: string;
          };
        };
        public_key?: {
          type_url: string;
          value: string;
        };
        sequence?: string;
      }>;
      tip?: {
        amount?: Array<{
          amount: string;
          denom: string;
        }>;
        tipper?: string;
      };
    };
    body: {
      extension_options?: Array<{
        type_url: string;
        value: string;
      }>;
      memo?: string;
      messages: SimulateRequestMessage[];
      non_critical_extension_options?: Array<{
        type_url: string;
        value: string;
      }>;
      timeout_height?: string;
    };
    signatures?: string[];
  };
  tx_bytes?: string;
}

async function estimateGasViaRest(
  params: GasEstimationParams,
): Promise<BigNumber> {
  const body: SimulateRequest = {
    tx: {
      body: {
        messages: [getMessageBody(params)],
      },
    },
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

    const data: { gas_info?: { gas_used: string } } = await response.json();
    const gasUsed = data?.gas_info?.gas_used || GAS_CONFIG.defaultStakeEstimate;

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
