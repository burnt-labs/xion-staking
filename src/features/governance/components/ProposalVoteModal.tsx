import React, { useEffect, useState } from "react";

import {
  Button,
  Heading2,
  Heading8,
  HeroText,
} from "@/features/core/components/base";
import CommonModal, {
  ModalDescription,
} from "@/features/core/components/common-modal";

import type { VoteType } from "../lib/types";
import { getReadableVoteType } from "../lib/utils";

interface ProposalVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  voteType: VoteType;
}

enum Step {
  Completed = "completed",
  Review = "review",
}

const ProposalVoteModal: React.FC<ProposalVoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  voteType,
}) => {
  const [step, setStep] = useState<Step>(Step.Review);
  const [isLoading, setIsLoading] = useState(false);

  const readableVoteType = getReadableVoteType(voteType);

  // reset step when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(Step.Review);
    }
  }, [isOpen]);

  // handle confirm
  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      await onConfirm();
      setStep(Step.Completed);
    } catch (error) {
      console.error("Error submitting vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // handle close
  const handleClose = () => {
    onClose();
    setStep(Step.Review);
  };

  return (
    <CommonModal isOpen={isOpen} onRequestClose={handleClose}>
      <div className="min-w-[90vw] md:min-w-[390px]">
        {step === Step.Review ? (
          <>
            <div className="text-center">
              <div className="mb-[35px] text-center uppercase">
                <HeroText>REVIEW</HeroText>
              </div>
              <ModalDescription>
                You are about to vote "{readableVoteType}" on this proposal.
                Press 'Confirm' to proceed.
              </ModalDescription>
            </div>
            <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center gap-[12px]">
              <Heading8>Vote Type</Heading8>
              <Heading2>{readableVoteType}</Heading2>
            </div>
            <Button isLoading={isLoading} onClick={handleConfirm}>
              CONFIRM
            </Button>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="mb-[35px] text-center uppercase">
                <HeroText>SUCCESS!</HeroText>
              </div>
              <ModalDescription>
                You have successfully voted on this proposal. Thank you for
                participating in the governance process.
              </ModalDescription>
            </div>
            <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center gap-[12px]">
              <Heading8>Vote Type</Heading8>
              <Heading2>{readableVoteType}</Heading2>
            </div>
            <Button onClick={handleClose}>CLOSE</Button>
          </>
        )}
      </div>
    </CommonModal>
  );
};

export default ProposalVoteModal;
