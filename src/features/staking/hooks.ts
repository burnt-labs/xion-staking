import { useQuery } from "@tanstack/react-query";

import { IS_MAINNET } from "../../config";
import { fetchValidatorLogos } from "./lib/validator-logos";

// Fallback logos with paths relative to the public directory
const fallbackLogoMap: Record<string, string | undefined> = {
  xionvaloper1mq85keggvh67m37035mnncsqjnpkmunl6s2w56: "/chains/bonus-block.png",
  xionvaloper1sprpvyqln2vxshq8c5jt3dshn480rfeelupqrj: "/chains/inf-stones.png",
  xionvaloper1t4yes7c20hhga3nhqylnyq9kn5ja8t7c6ay45c: "/chains/mech-cap.png",
  xionvaloper1ypwfnfuldmlp9u8asqzz6qx29p0utqzer5678k: "/chains/stake-lab.png",
};

const validatorLogosQueryKey = "validator-logos";

function useValidatorLogos(chainId: string) {
  return useQuery({
    queryFn: () => fetchValidatorLogos(chainId),
    queryKey: [validatorLogosQueryKey, chainId],
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

export const useValidatorLogo = (operatorAddress?: string) => {
  // todo: pull chain id from centralized store rather than ternary.
  const { data: validatorLogos } = useValidatorLogos(
    IS_MAINNET ? "xion-mainnet-1" : "xion-testnet-2",
  );

  if (!operatorAddress || !validatorLogos) return null;

  const logo = validatorLogos.validators[operatorAddress];

  if (!logo) {
    // Check fallback logos if no logo found in validator response
    const fallbackLogo = fallbackLogoMap[operatorAddress];

    return fallbackLogo ?? null;
  }

  return logo;
};
