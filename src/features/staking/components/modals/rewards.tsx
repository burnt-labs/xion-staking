import { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { Button, HeroText } from "@/features/core/components/base";
import CommonModal from "@/features/core/components/common-modal";

import { fetchUserDataAction } from "../../context/actions";
import { useStaking } from "../../context/hooks";
import { setModalOpened } from "../../context/reducer";
import { claimRewards } from "../../lib/core/tx";

type Step = "completed" | "loading";

const initialStep: Step = "loading";

const claimRewardsLoop = async (
  stakingRef: ReturnType<typeof useStaking>,
  setStep: (step: Step) => void,
) => {
  const { client, staking } = stakingRef;
  const { modal } = staking.state;

  const { delegations } = modal?.content || {};

  if (!client || !delegations?.length) return;

  const delegatorAddress = stakingRef.account.bech32Address;

  delegations
    .reduce(async (promise, delegation) => {
      await promise;

      const addresses = {
        delegator: delegatorAddress,
        validator: delegation.validatorAddress,
      };

      await claimRewards(addresses, client);
    }, Promise.resolve())
    .then(() => fetchUserDataAction(delegatorAddress, staking))
    .then(() => {
      setStep("completed");
    })
    .catch(() => {
      toast(
        "There was an unexpected error claiming your rewards. Please try again later.",
        {
          type: "error",
        },
      );
    });
};

const RewardsModal = () => {
  const stakingRef = useStaking();
  const [currentStep, setStep] = useState<Step>(initialStep);
  const requested = useRef(false);

  const { staking } = stakingRef;
  const { modal } = staking.state;

  const isOpen = modal?.type === "rewards";

  useEffect(() => {
    if (isOpen) {
      if (requested.current) return;

      requested.current = true;
      claimRewardsLoop(stakingRef, setStep);
    }
  }, [isOpen, stakingRef]);

  if (!isOpen) return null;

  const content = (() => {
    if (currentStep === "loading") {
      return (
        <div className="w-full text-center">
          <div className="mb-[16px] uppercase">
            <HeroText>CLAIMING</HeroText>
          </div>
          <div className="mb-[16px] text-typo-100">
            Wait until your rewards are withdrawn.
          </div>
          <Button isLoading />
        </div>
      );
    }

    return (
      <>
        <div className="text-center">
          <div className="mb-[16px] uppercase">
            <HeroText>Success!</HeroText>
          </div>
          <div className="mb-[16px] text-typo-100">
            You have claimed your staking rewards successfully.
          </div>
        </div>
        <Button
          onClick={() => {
            stakingRef.staking.dispatch(setModalOpened(null));
          }}
        >
          CLOSE
        </Button>
      </>
    );
  })();

  return (
    <CommonModal
      isOpen={isOpen}
      onRequestClose={() => {
        if (currentStep === "loading") return;

        stakingRef.staking.dispatch(setModalOpened(null));
      }}
    >
      <div className="min-w-[390px]">{content}</div>
    </CommonModal>
  );
};

export default memo(RewardsModal);
