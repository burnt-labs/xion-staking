import { VALIDATOR_LOGO_ENDPOINT } from "@/config";

type ValidatorLogo = {
  [operatorAddress: string]: string | undefined;
};

type ValidatorLogoResponse = {
  chainId: string;
  timestamp: string;
  validators: ValidatorLogo;
};

export async function fetchValidatorLogos(chainId: string) {
  const response = await fetch(
    `${VALIDATOR_LOGO_ENDPOINT}?chain-id=${chainId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch validator logos");
  }

  const data = (await response.json()) as ValidatorLogoResponse;

  return data;
}
