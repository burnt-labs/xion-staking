"use client";

import BigNumber from "bignumber.js";
import { BondStatus } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BodyMedium,
  Button,
  ClipboardCopy,
  Heading2,
  Heading8,
  LoadingBanner,
  NavLink,
} from "@/features/core/components/base";
import { useProMode } from "@/features/core/context/pro-mode";
import { useAccountBalance } from "@/features/core/hooks/useAccountBalance";

import { getValidatorDetailsAction } from "../context/actions";
import { useStaking } from "../context/hooks";
import { setModalOpened } from "../context/reducer";
import {
  getHasStakedInValidator,
  getTotalDelegation,
  getVotingPowerPerc,
} from "../context/selectors";
import { useValidatorLogo } from "../hooks";
import { getXionCoin, normaliseCoin } from "../lib/core/coins";
import {
  formatCommission,
  formatToSmallDisplay,
  formatVotingPowerPerc,
  formatXionToUSD,
} from "../lib/formatters";
import { parseWebsite } from "../lib/utils/misc";
import { DivisorHorizontal, DivisorVertical } from "./divisor";
import StakingModals from "./staking-modals";
import ValidatorDelegation from "./validator-delegation";

export default function ValidatorPage() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const stakingRef = useStaking();
  const { getLink } = useProMode();

  const { getBalanceByDenom } = useAccountBalance();

  const xionBalance = getBalanceByDenom("uxion");
  const xionPrice = xionBalance?.price;

  const [validatorDetails, setValidatorDetails] = useState<Awaited<
    ReturnType<typeof getValidatorDetailsAction>
  > | null>(null);

  const logo = useValidatorLogo(validatorDetails?.operatorAddress);

  useEffect(() => {
    (async () => {
      if (address) {
        const validatorDetailsResult = await getValidatorDetailsAction(
          address,
          stakingRef.staking,
        );

        setValidatorDetails(validatorDetailsResult);
      }
    })();
  }, [address, stakingRef]);

  if (!validatorDetails) {
    return (
      <div className="mb-[36px] w-full">
        <LoadingBanner />
      </div>
    );
  }

  const votingPowerPerc = getVotingPowerPerc(
    validatorDetails.tokens,
    stakingRef.staking.state,
  );

  const votingPowerPercStr = formatVotingPowerPerc(votingPowerPerc);

  const totalStakeBN = new BigNumber(validatorDetails.tokens).div(
    new BigNumber(10).pow(6),
  );

  const myDelegationToValidator = getTotalDelegation(
    stakingRef.staking.state,
    validatorDetails.operatorAddress,
  );

  const hasStakedInValidator = getHasStakedInValidator(
    validatorDetails.operatorAddress,
    stakingRef.staking.state,
  );

  const validatorWebsite = parseWebsite(validatorDetails.description.website);

  return (
    <>
      <div className="page-container flex w-full flex-col gap-[16px] px-[16px] pb-[32px]">
        <div className="mb-[32px] mt-[40px]">
          <NavLink href={getLink("staking")}>STAKING</NavLink> {"> "}
          <span className="uppercase">
            {validatorDetails.description.moniker}
          </span>
        </div>
        <div
          className="flex flex-col gap-[24px] overflow-auto p-[24px]"
          style={{
            backgroundImage: `url(/overview-bg.png)`,
            backgroundSize: "cover",
            borderRadius: 16,
          }}
        >
          <div className="flex w-full flex-col items-center gap-[16px] md:min-w-[1000px] md:flex-row">
            <div className="flex w-full flex-row justify-between gap-[16px]">
              {logo ? (
                <img
                  alt="Validator logo"
                  className="block w-[80px] rounded-full"
                  src={logo}
                />
              ) : (
                <span className="block h-[80px] w-[80px] rounded-full bg-defaultLogo" />
              )}
              <div className="flex flex-1 items-center gap-[16px]">
                <div className="text-[32px] font-bold leading-[36px] text-white">
                  {validatorDetails.description.moniker || ""}
                </div>
                {hasStakedInValidator && (
                  <div className="rounded-[4px] bg-successBg px-[8px] py-[4px] text-[11px] text-success">
                    You staked
                  </div>
                )}
              </div>
            </div>
            {validatorDetails.status === BondStatus.BOND_STATUS_BONDED && (
              <div className="flex w-full md:w-[unset]">
                <Button
                  className="w-full md:w-max"
                  disabled={!stakingRef.isConnected}
                  onClick={() => {
                    stakingRef.staking.dispatch(
                      setModalOpened({
                        content: { validator: validatorDetails },
                        type: "delegate",
                      }),
                    );
                  }}
                >
                  DELEGATE NOW
                </Button>
              </div>
            )}
          </div>
          <DivisorHorizontal className="md:min-w-[1000px]" />
          <div className="grid grid-cols-2 md:min-w-[1000px] md:grid-cols-4">
            <div className="relative">
              <Heading8>Total Stake (XION)</Heading8>
              <div className="mb-[8px] mt-[12px]">
                <Heading2 responsive>
                  {formatToSmallDisplay(totalStakeBN)}
                </Heading2>
              </div>
              <BodyMedium>
                {formatXionToUSD(getXionCoin(totalStakeBN), xionPrice || 0)}
              </BodyMedium>
              <div className="absolute bottom-0 right-[20px] top-0">
                <DivisorVertical />
              </div>
            </div>
            <div className="relative">
              <Heading8>Commission Rate</Heading8>
              <div className="mb-[8px] mt-[12px]">
                <Heading2 responsive>
                  {formatCommission(
                    validatorDetails.commission.commissionRates.rate,
                    2,
                  )}
                </Heading2>
              </div>
              <div className="absolute bottom-0 right-[20px] top-0 hidden md:block">
                <DivisorVertical />
              </div>
            </div>
            <div className="col-span-2 h-1 py-4 md:hidden">
              <DivisorHorizontal className="md:min-w-[1000px]" />
            </div>
            <div className="relative">
              <Heading8>Voting Power</Heading8>
              <div className="mb-[8px] mt-[12px]">
                <Heading2 responsive>{votingPowerPercStr}</Heading2>
              </div>
              <div className="absolute bottom-0 right-[20px] top-0">
                <DivisorVertical />
              </div>
            </div>
            <div className="relative">
              <Heading8>My Delegation (XION)</Heading8>
              <div className="mb-[8px] mt-[12px]">
                <Heading2 responsive>
                  {myDelegationToValidator
                    ? formatToSmallDisplay(
                        new BigNumber(
                          normaliseCoin(myDelegationToValidator).amount,
                        ),
                      )
                    : "-"}
                </Heading2>
              </div>
              <BodyMedium>
                {formatXionToUSD(myDelegationToValidator, xionPrice || 0)}
              </BodyMedium>
            </div>
          </div>
          <DivisorHorizontal className="md:min-w-[1000px]" />
          <div className="grid grid-cols-1 gap-[24px] md:min-w-[1000px] md:grid-cols-4 md:gap-0">
            <div className="flex flex-col gap-[8px] md:col-span-2">
              <Heading8 color="text-white">XION Address</Heading8>
              <div className="inline-flex flex-row gap-2 break-all">
                {validatorDetails.operatorAddress}{" "}
                <ClipboardCopy textToCopy={validatorDetails.operatorAddress} />
              </div>
            </div>
            {validatorWebsite && (
              <div className="flex flex-col gap-[8px]">
                <Heading8 color="text-white">Website</Heading8>
                <Link href={validatorWebsite} target="_blank">
                  {validatorWebsite}
                </Link>
              </div>
            )}
            {validatorDetails.description.securityContact && (
              <div className="flex flex-col gap-[8px]">
                <Heading8 color="text-white">Security Contact</Heading8>
                <Link
                  href={`mailto:${validatorDetails.description.securityContact}`}
                >
                  {validatorDetails.description.securityContact}
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-[8px]">
            <Heading8 color="text-white">Details</Heading8>
            <div>
              <div>{validatorDetails.description.details}</div>
              <div>
                Max Commission Rate:{" "}
                {formatCommission(
                  validatorDetails.commission.commissionRates.maxRate,
                  0,
                )}
              </div>
              <div>
                Max commission Change Rate:{" "}
                {formatCommission(
                  validatorDetails.commission.commissionRates.maxChangeRate,
                  0,
                )}
              </div>
            </div>
          </div>
        </div>
        <ValidatorDelegation />
      </div>
      <StakingModals />
    </>
  );
}
