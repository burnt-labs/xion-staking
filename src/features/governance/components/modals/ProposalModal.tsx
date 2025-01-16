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

interface ProposalModalProps {
  description?: string;
  error?: null | string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  step: "completed" | "form" | "review" | "submitting";
  title?: string;
}

export const ProposalModal = ({
  description,
  error,
  isOpen,
  onClose,
  onConfirm,
  step,
  title,
}: ProposalModalProps) => {
  const renderContent = () => {
    switch (step) {
      case "review":
        return (
          <div className="min-w-[90vw] md:min-w-[390px]">
            <div className="text-center">
              <div className="mb-[35px] text-center uppercase">
                <HeroText>REVIEW PROPOSAL</HeroText>
              </div>
              <ModalDescription>
                Please review your proposal details before submitting.
              </ModalDescription>
              {error && <div className="mt-4 text-sm text-danger">{error}</div>}
            </div>
            <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center gap-[12px]">
              <Heading8>Title</Heading8>
              <Heading2>{title}</Heading2>
              <Heading8>Description</Heading8>
              <p className="text-center">{description}</p>
            </div>
            <Button onClick={onConfirm}>CONFIRM</Button>
          </div>
        );

      case "submitting":
        return (
          <div className="min-w-[90vw] md:min-w-[390px]">
            <div className="text-center">
              <div className="mb-[35px] text-center uppercase">
                <HeroText>SUBMITTING</HeroText>
              </div>
              <ModalDescription>
                Please wait while your proposal is being submitted...
              </ModalDescription>
            </div>
            <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center">
              <div className="mb-[32px] flex w-[80px] items-center justify-center">
                <span
                  className="animate-spin"
                  dangerouslySetInnerHTML={{ __html: loader2 }}
                />
              </div>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="min-w-[90vw] md:min-w-[390px]">
            <div className="text-center">
              <div className="mb-[35px] text-center uppercase">
                <HeroText>SUCCESS!</HeroText>
              </div>
              <ModalDescription>
                Your proposal has been successfully submitted.
              </ModalDescription>
            </div>
            <div className="mb-[32px] mt-[32px]">
              <Button onClick={onClose}>CLOSE</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <CommonModal isOpen={isOpen} onRequestClose={onClose}>
      {renderContent()}
    </CommonModal>
  );
};
