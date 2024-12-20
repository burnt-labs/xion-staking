import BigNumber from "bignumber.js";
import type { FormEventHandler } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  Button,
  FormError,
  Heading2,
  Heading8,
  HeroText,
  InputBox,
  OpenInput,
} from "@/features/core/components/base";
import CommonModal, {
  ModalDescription,
} from "@/features/core/components/common-modal";
import { useAccountBalance } from "@/features/core/hooks/useAccountBalance";

import { stakeValidatorAction } from "../../context/actions";
import { useStaking } from "../../context/hooks";
import { setModalOpened } from "../../context/reducer";
import { getTokensAvailableBG } from "../../context/selectors";
import { getXionCoin } from "../../lib/core/coins";
import { estimateGas } from "../../lib/core/gas";
import type { StakeAddresses } from "../../lib/core/tx";
import { formatCoin, formatXionToUSD } from "../../lib/formatters";

type Step = "completed" | "input" | "review";

const initialStep: Step = "input";

const StakingModal = () => {
  const stakingRef = useStaking();
  const { client } = stakingRef;
  const [step, setStep] = useState<Step>(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  const { getBalanceByDenom } = useAccountBalance();

  const xionBalance = getBalanceByDenom("uxion");
  const xionPrice = xionBalance?.price;

  const [amountXION, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [formError, setFormError] = useState<
    Record<string, string | undefined>
  >({ amount: undefined, memo: undefined });

  const { account, staking } = stakingRef;
  const { modal } = staking.state;
  const isOpen = modal?.type === "delegate";
  const validator = isOpen ? modal?.content?.validator : undefined;

  useEffect(
    () => () => {
      setStep(initialStep);
      setFormError({});
      setAmount("");
      setMemo("");
    },
    [isOpen],
  );

  if (!isOpen) return null;

  if (!validator) return null;

  const amountXIONParsed = new BigNumber(amountXION);

  const amountUSD = (() => {
    if (amountXIONParsed.isNaN()) return "";

    return amountXIONParsed.times(xionPrice || 0).toFixed(2);
  })();

  const hasErrors = Object.values(formError).some((v) => !!v);

  const availableTokens = getTokensAvailableBG(staking.state);

  const validateAmount = async () => {
    if (!availableTokens) {
      setFormError({
        ...formError,
        amount: "No tokens available",
      });

      return true;
    }

    if (
      !amountXIONParsed ||
      amountXIONParsed.isNaN() ||
      amountXIONParsed.lte(0)
    ) {
      setFormError({
        ...formError,
        amount: "Invalid amount",
      });

      return true;
    }

    try {
      const gasEstimate = await estimateGas({
        amount: getXionCoin(amountXIONParsed),
        delegator: account.bech32Address,
        messageType: "delegate",
        validator: validator.operatorAddress,
      });

      const totalRequired = amountXIONParsed.plus(gasEstimate);

      if (totalRequired.gt(availableTokens)) {
        setFormError({
          ...formError,
          amount: `Amount too high. Need ~${gasEstimate.toString()} XION for fees`,
        });

        return true;
      }
    } catch (error) {
      setFormError({
        ...formError,
        amount: "Failed to estimate transaction fees",
      });

      return true;
    }

    return false;
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e?.preventDefault();

    if (!client) return;

    const hasValidationError = await validateAmount();

    if (!hasValidationError) {
      setStep("review");
    }
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onRequestClose={() => {
        if (isLoading) return;

        stakingRef.staking.dispatch(setModalOpened(null));
      }}
    >
      <div className="min-w-[90vw] md:min-w-[390px]">
        {(() => {
          const getStakingSummary = () => (
            <>
              <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center gap-[12px]">
                <Heading8>Staked Amount (XION)</Heading8>
                <Heading2>{amountXIONParsed.toString()}</Heading2>
                {amountUSD && <Heading8>${amountUSD}</Heading8>}
              </div>
              {!!memo && (
                <div className="mb-[32px] text-center italic">
                  <div>{memo}</div>
                </div>
              )}
            </>
          );

          if (step === "completed") {
            return (
              <>
                <div className="text-center">
                  <div className="mb-[35px] text-center uppercase">
                    <HeroText>SUCCESS!</HeroText>
                  </div>
                  <ModalDescription>
                    You have successfully staked on{" "}
                    {validator.description.moniker}. Thank you for contributing
                    in securing the XION network.
                  </ModalDescription>
                </div>
                {getStakingSummary()}
                <Button
                  disabled={isLoading}
                  onClick={() => {
                    stakingRef.staking.dispatch(setModalOpened(null));
                  }}
                >
                  CLOSE
                </Button>
              </>
            );
          }

          if (step === "review") {
            return (
              <>
                <div className="text-center">
                  <div className="mb-[35px] text-center uppercase">
                    <HeroText>REVIEW</HeroText>
                  </div>
                  <ModalDescription>
                    Get ready to stake your XION token with{" "}
                    {validator.description.moniker}. Press 'Confirm' to proceed.
                  </ModalDescription>
                </div>
                {getStakingSummary()}
                <Button
                  isLoading={isLoading}
                  onClick={() => {
                    if (!client) return;

                    setIsLoading(true);

                    const addresses: StakeAddresses = {
                      delegator: account.bech32Address,
                      validator: validator.operatorAddress,
                    };

                    stakeValidatorAction(
                      addresses,
                      getXionCoin(amountXIONParsed),
                      memo,
                      client,
                      staking,
                    )
                      .then((fetchDataFn) => {
                        setStep("completed");

                        return fetchDataFn();
                      })
                      .catch(() => {
                        toast("Staking error", {
                          type: "error",
                        });
                      })
                      .finally(() => {
                        setIsLoading(false);
                      });
                  }}
                >
                  CONFIRM
                </Button>
              </>
            );
          }

          return (
            <>
              <div className="mb-[35px] text-center uppercase">
                <HeroText>Delegate To {validator.description.moniker}</HeroText>
              </div>
              {availableTokens &&
                (() => {
                  const availableTokensCoin = {
                    amount: availableTokens.toString(),
                    denom: "XION",
                  };

                  return (
                    <div className="mt-[40px] flex w-full flex-col items-center justify-center gap-[12px] uppercase">
                      <Heading8>Available for delegation (XION)</Heading8>
                      <Heading2>
                        {formatCoin(availableTokensCoin, undefined, true)}
                      </Heading2>
                      <Heading8>
                        {formatXionToUSD(availableTokensCoin, xionPrice || 0)}
                      </Heading8>
                    </div>
                  );
                })()}
              <div className="mt-[40px] flex w-full flex-row justify-between">
                <div>Amount</div>
                {!!amountUSD && <Heading8>= ${amountUSD}</Heading8>}
              </div>
              <form onSubmit={onSubmit}>
                <div className="mt-[8px]">
                  <InputBox
                    disabled={isLoading}
                    error={!!formError.amount}
                    onBlur={() => {
                      validateAmount();
                    }}
                    onChange={(e) => {
                      if (formError.amount) {
                        setFormError({ ...formError, amount: undefined });
                      }

                      setAmount(e.target.value);
                    }}
                    value={amountXION}
                  />
                  {formError.amount && (
                    <FormError>{formError.amount}</FormError>
                  )}
                </div>
                <div className="mt-[40px] w-full">
                  <OpenInput
                    disabled={isLoading}
                    onChange={(e) => {
                      setMemo(e.target.value);
                    }}
                    placeholder="Memo (Optional)"
                    value={memo}
                  />
                </div>
                <div className="mt-[48px] w-full">
                  <Button disabled={isLoading || hasErrors} type="submit">
                    DELEGATE NOW
                  </Button>
                </div>
              </form>
            </>
          );
        })()}
      </div>
    </CommonModal>
  );
};

export default StakingModal;
