import BigNumber from "bignumber.js";
import type { FormEventHandler } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { UNBONDING_DAYS } from "@/constants";
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

import { unstakeValidatorAction } from "../../context/actions";
import { useStaking } from "../../context/hooks";
import { setModalOpened } from "../../context/reducer";
import { getTotalDelegation } from "../../context/selectors";
import { getXionCoin } from "../../lib/core/coins";
import type { StakeAddresses } from "../../lib/core/tx";
import {
  formatCoin,
  formatToSmallDisplay,
  formatXionToUSD,
} from "../../lib/formatters";

type Step = "completed" | "input" | "review";

const initialStep: Step = "input";

const UnstakingModal = () => {
  const stakingRef = useStaking();
  const { client } = stakingRef;
  const [step, setStep] = useState<Step>(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  const { getBalanceByDenom } = useAccountBalance();

  const xionBalance = getBalanceByDenom("uxion");
  const xionPrice = xionBalance?.price;

  const [formError, setFormError] = useState<
    Record<string, string | undefined>
  >({ amount: undefined, memo: undefined });

  const [amountXION, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const { account, staking } = stakingRef;
  const { modal } = staking.state;
  const isOpen = modal?.type === "undelegate";

  useEffect(
    () => () => {
      setStep(initialStep);
      setAmount("");
      setFormError({});
      setMemo("");
    },
    [isOpen],
  );

  if (!isOpen) return null;

  const { validator } = modal?.content;

  if (!validator) return null;

  const amountXIONParsed = new BigNumber(amountXION);

  const amountUSD = (() => {
    if (amountXIONParsed.isNaN()) return "";

    return amountXIONParsed.times(xionPrice || 0).toFixed(2);
  })();

  const delegatedTokens = getTotalDelegation(
    staking.state,
    validator.operatorAddress,
  );

  const validateAmount = () => {
    if (
      !amountUSD ||
      !delegatedTokens ||
      amountXIONParsed.lte(0) ||
      amountXIONParsed.gt(new BigNumber(delegatedTokens.amount))
    ) {
      setFormError({
        ...formError,
        amount: "Invalid amount",
      });

      return true;
    }
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (validateAmount()) return;

    if (!client || !amountXIONParsed.gt(0)) return;

    setStep("review");
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
          const getUnstakingSummary = () => (
            <>
              <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center gap-[12px]">
                <Heading8>Unstaking Amount (XION)</Heading8>
                <Heading2>{formatToSmallDisplay(amountXIONParsed)}</Heading2>
                <Heading8>
                  {formatXionToUSD(
                    getXionCoin(amountXIONParsed),
                    xionPrice || 0,
                  )}
                </Heading8>
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
                    You have successfully unstaked from{" "}
                    {validator.description.moniker}. It takes {UNBONDING_DAYS}{" "}
                    days to complete the unstaking process
                  </ModalDescription>
                </div>
                {getUnstakingSummary()}
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
                    Unstaking your XION Token means you'll stop earning rewards.
                    Remember, it takes {UNBONDING_DAYS} days to complete the
                    unstaking process.
                  </ModalDescription>
                </div>
                {getUnstakingSummary()}
                <Button
                  isLoading={isLoading}
                  onClick={() => {
                    if (!client) return;

                    setIsLoading(true);

                    try {
                      if (!account?.bech32Address) {
                        throw new Error("Delegator address is not defined");
                      }

                      const addresses: StakeAddresses = {
                        delegator: account.bech32Address,
                        validator: validator.operatorAddress,
                      };

                      unstakeValidatorAction(
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
                    } catch (error) {
                      toast("Staking error", {
                        type: "error",
                      });
                    }
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
                <HeroText>Unbond From {validator.description.moniker}</HeroText>
              </div>
              {delegatedTokens && (
                <div className="mt-[40px] flex w-full flex-col items-center justify-center gap-[12px] uppercase">
                  <Heading8>Available amount (XION)</Heading8>
                  <Heading2>
                    {formatCoin(delegatedTokens, undefined, true)}
                  </Heading2>
                  <Heading8>
                    {formatXionToUSD(delegatedTokens, xionPrice || 0)}
                  </Heading8>
                </div>
              )}
              <div className="mt-[40px] flex w-full flex-row justify-between">
                <div>Amount</div>
                {!!amountUSD && <Heading8>=${amountUSD}</Heading8>}
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
                  <Button disabled={isLoading} type="submit">
                    Unbond Now
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

export default UnstakingModal;
