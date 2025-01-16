import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  Button,
  Heading2,
  Heading8,
  HeroText,
} from "@/features/core/components/base";
import CommonModal, {
  ModalDescription,
} from "@/features/core/components/common-modal";
import { useAccountBalance } from "@/features/core/hooks/useAccountBalance";
import { loader2 } from "@/features/core/lib/icons";
import { formatCoin } from "@/features/staking/lib/formatters";

import { useDepositParams, useSubmitProposal } from "../context/hooks";
import type { StoreCodeProposalValues } from "../lib/types";

enum Step {
  Completed = "completed",
  Form = "form",
  Review = "review",
  Submitting = "submitting",
}

export const SubmitProposalForm = () => {
  const [step, setStep] = useState<Step>(Step.Form);
  const [error, setError] = useState<null | string>(null);

  const [formData, setFormData] = useState<null | StoreCodeProposalValues>(
    null,
  );

  const { data: depositParams } = useDepositParams();
  const { getBalanceByDenom } = useAccountBalance();
  const balance = getBalanceByDenom("uxion");

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<StoreCodeProposalValues>();

  const {
    error: submitError,
    isSubmitting,
    submitProposal,
  } = useSubmitProposal();

  useEffect(() => {
    if (depositParams?.params?.min_deposit?.[0]) {
      setValue("initialDeposit", depositParams.params.min_deposit[0]);
    }
  }, [depositParams, setValue]);

  useEffect(() => {
    if (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : String(submitError),
      );
    }
  }, [submitError]);

  const handleFormSubmit = async (data: StoreCodeProposalValues) => {
    try {
      const requiredAmount = new BigNumber(data.initialDeposit?.amount || "0");
      const availableBalance = new BigNumber(balance?.baseAmount || "0");
      const estimatedGas = new BigNumber("500000");

      if (availableBalance.isLessThan(requiredAmount.plus(estimatedGas))) {
        throw new Error(
          `Insufficient balance. You need at least ${formatCoin({
            amount: requiredAmount.plus(estimatedGas).toString(),
            denom: "uxion",
          })} for deposit and gas fees.`,
        );
      }

      setFormData(data);
      setStep(Step.Review);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  };

  const handleConfirm = async () => {
    if (!formData) return;

    setStep(Step.Submitting);
    setError(null);

    try {
      const reader = new FileReader();
      const file = (formData.wasmByteCode as unknown as FileList).item(0);

      if (!file) {
        throw new Error("No file selected");
      }

      reader.onload = async (e) => {
        try {
          const wasmByteCode = new Uint8Array(e.target?.result as ArrayBuffer);

          await submitProposal({
            ...formData,
            wasmByteCode,
          });

          setStep(Step.Completed);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
          setStep(Step.Review);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStep(Step.Review);
    }
  };

  const handleClose = () => {
    setStep(Step.Form);
    setError(null);
    setFormData(null);
  };

  const renderModal = () => {
    switch (step) {
      case Step.Review:
        return (
          <CommonModal isOpen onRequestClose={() => setStep(Step.Form)}>
            <div className="min-w-[90vw] md:min-w-[390px]">
              <div className="text-center">
                <div className="mb-[35px] text-center uppercase">
                  <HeroText>REVIEW PROPOSAL</HeroText>
                </div>
                <ModalDescription>
                  Please review your proposal details before submitting.
                </ModalDescription>
                {error && (
                  <div className="mt-4 text-sm text-danger">{error}</div>
                )}
              </div>
              <div className="mb-[32px] mt-[32px] flex w-full flex-col items-center justify-center gap-[12px]">
                <Heading8>Title</Heading8>
                <Heading2>{formData?.title}</Heading2>
                <Heading8>Description</Heading8>
                <p className="text-center">{formData?.description}</p>
              </div>
              <Button onClick={handleConfirm}>CONFIRM</Button>
            </div>
          </CommonModal>
        );

      case Step.Submitting:
        return (
          <CommonModal isOpen onRequestClose={() => {}}>
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
          </CommonModal>
        );

      case Step.Completed:
        return (
          <CommonModal isOpen onRequestClose={handleClose}>
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
                <Button onClick={handleClose}>CLOSE</Button>
              </div>
            </div>
          </CommonModal>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <div>
          <input
            {...register("title", { required: "Title is required" })}
            placeholder="Title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            placeholder="Description"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div>
          <input
            type="file"
            {...register("wasmByteCode", { required: "WASM file is required" })}
            accept=".wasm"
          />
          {errors.wasmByteCode && (
            <p className="text-sm text-red-500">
              {errors.wasmByteCode.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600" htmlFor="initialDeposit">
              Initial Deposit
            </label>
            {depositParams?.params?.min_deposit && (
              <span className="text-sm text-gray-500">
                Required: {formatCoin(depositParams.params.min_deposit[0])}
              </span>
            )}
          </div>
          <input
            type="number"
            {...register("initialDeposit.amount", {
              required: "Initial deposit is required",
              validate: {
                minDeposit: (value) => {
                  if (!depositParams?.params?.min_deposit?.[0]) return true;

                  const minDeposit = new BigNumber(
                    depositParams.params.min_deposit[0].amount,
                  );

                  return (
                    new BigNumber(value).gte(minDeposit) ||
                    `Minimum deposit is ${formatCoin(depositParams.params.min_deposit[0])}`
                  );
                },
                sufficientBalance: (value) => {
                  if (!balance) return true;

                  const requiredAmount = new BigNumber(value);
                  const availableBalance = new BigNumber(balance.baseAmount);
                  const estimatedGas = new BigNumber("500000");

                  return (
                    availableBalance.gte(requiredAmount.plus(estimatedGas)) ||
                    "Insufficient balance for deposit and gas fees"
                  );
                },
              },
            })}
            disabled
            placeholder="Initial Deposit Amount"
          />
          {errors.initialDeposit?.amount && (
            <p className="text-sm text-red-500">
              {errors.initialDeposit.amount.message}
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <button
          className="bg-primary hover:bg-primary-dark w-full rounded px-4 py-2 text-white disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          Submit Proposal
        </button>
      </form>

      {renderModal()}
    </>
  );
};
