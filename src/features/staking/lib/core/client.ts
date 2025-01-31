import type { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import type {
  DistributionExtension,
  IbcExtension,
  MintExtension,
  StakingExtension,
} from "@cosmjs/stargate";
import {
  QueryClient,
  StargateClient,
  setupDistributionExtension,
  setupIbcExtension,
  setupMintExtension,
  setupStakingExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import { RPC_URL } from "@/config";

export type AbstraxionSigningClient = NonNullable<
  ReturnType<typeof useAbstraxionSigningClient>["client"]
>;

let stakingQueryClientPromise:
  | Promise<
      QueryClient &
        StakingExtension &
        DistributionExtension &
        IbcExtension &
        MintExtension
    >
  | undefined = undefined;

export const getStakingQueryClient = () => {
  if (!stakingQueryClientPromise) {
    stakingQueryClientPromise = (async () => {
      const cometClient = await Tendermint34Client.connect(RPC_URL);

      return QueryClient.withExtensions(
        cometClient,
        setupStakingExtension,
        setupDistributionExtension,
        setupMintExtension,
        setupIbcExtension,
      );
    })();
  }

  return stakingQueryClientPromise;
};

let stargateClientPromise: Promise<StargateClient> | undefined = undefined;

export const getStargateClient = () => {
  if (!stargateClientPromise) {
    stargateClientPromise = (async () => {
      const client = await StargateClient.connect(RPC_URL);

      return client;
    })();
  }

  return stargateClientPromise;
};
