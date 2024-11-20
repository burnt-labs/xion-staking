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
import { loader2 } from "@/features/core/lib/icons";

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
  Submitting = "submitting",
}

const ProposalVoteModal: React.FC<ProposalVoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  voteType,
}) => {
  const [step, setStep] = useState<Step>(Step.Review);
  const [error, setError] = useState<null | string>(null);
  const readableVoteType = getReadableVoteType(voteType);

  // reset step when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(Step.Review);
      setError(null);
    }
  }, [isOpen]);

  // handle confirm
  const handleConfirm = async () => {
    setStep(Step.Submitting);
    setError(null);

    try {
      await onConfirm();
      setStep(Step.Completed);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError("Failed to submit vote. Please try again.");
      setStep(Step.Review);
    }
  };

  // handle close
  const handleClose = () => {
    onClose();
    setStep(Step.Review);
  };

  const renderContent = () => {
    switch (step) {
      case Step.Review:
        return (
          <>
            <div className="text-center">
              <div className="mb-[35px] text-center uppercase">
                <HeroText>REVIEW</HeroText>
              </div>
              <ModalDescription>
                You are about to vote "{readableVoteType}" on this proposal.
                Press 'Confirm' to proceed.
              </ModalDescription>
              {error && <div className="mt-4 text-sm text-danger">{error}</div>}
            </div>
            <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center gap-[12px]">
              <Heading8>Vote Type</Heading8>
              <Heading2>{readableVoteType}</Heading2>
            </div>
            <Button onClick={handleConfirm}>CONFIRM</Button>
          </>
        );

      case Step.Submitting:
        return (
          <>
            <div className="text-center">
              <div className="mb-[35px] text-center uppercase">
                <HeroText>SUBMITTING</HeroText>
              </div>
              <ModalDescription>
                Please wait while your vote is being submitted...
              </ModalDescription>
            </div>
            <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center">
              <div className="mb-[32px] flex w-[80px] items-center justify-center">
                <span
                  className="animate-spin"
                  dangerouslySetInnerHTML={{ __html: loader2 }}
                />
              </div>
              <div className="flex w-full flex-col items-center justify-center gap-[12px]">
                <Heading8>Vote Type</Heading8>
                <Heading2>{readableVoteType}</Heading2>
              </div>
            </div>
          </>
        );

      case Step.Completed:
        return (
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
        );
    }
  };

  return (
    <CommonModal isOpen={isOpen} onRequestClose={handleClose}>
      <div className="min-w-[90vw] md:min-w-[390px]">{renderContent()}</div>
    </CommonModal>
  );
};

export default ProposalVoteModal;
