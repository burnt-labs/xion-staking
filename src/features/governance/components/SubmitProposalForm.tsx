import BigNumber from "bignumber.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/features/core/components/base";
import { useAccountBalance } from "@/features/core/hooks/useAccountBalance";
import { formatCoin } from "@/features/staking/lib/formatters";

import { useDepositParams, useSubmitProposal } from "../context/hooks";
import { ProposalType, type StoreCodeProposalValues } from "../lib/types";
import { FileUpload } from "./forms/FileUpload";
import { FormInput } from "./forms/FormInput";
import { FormTextArea } from "./forms/FormTextArea";
import { ProposalModal } from "./modals/ProposalModal";

enum Step {
  Completed = "completed",
  Form = "form",
  Review = "review",
  Submitting = "submitting",
}

interface FormValues extends Omit<StoreCodeProposalValues, "wasmByteCode"> {
  wasmByteCode: File;
}

export const SubmitProposalForm = () => {
  const [step, setStep] = useState<Step>(Step.Form);
  const [error, setError] = useState<null | string>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormValues | null>(null);

  const { data: depositParams } = useDepositParams();
  const { getBalanceByDenom } = useAccountBalance();
  const balance = getBalanceByDenom("uxion");

  const {
    error: submitError,
    isSubmitting,
    submitProposal,
  } = useSubmitProposal();

  const router = useRouter();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    unregister,
  } = useForm<FormValues>({
    defaultValues: {
      description:
        "## Developer Information \n\n### Link to Developer/Company \n\n### Developer Description\n\n\n\n## Contract Details\n\n### Contract Name\n\n### Contract Source Link\n\n### Contract Description and Intended Use\n\n\n\n## Audit and Execution Information\n\n### Audit Report Link\n\n### Audit Process Description\n\n### Execution Messages Description\n\n\n\n## Deployment Information\n\n### Testnet Explorer Link\n\n",
      type: ProposalType.STORE_CODE,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (depositParams?.params?.min_deposit?.[0] && balance?.decimals) {
      const demicroAmount = new BigNumber(
        depositParams.params.min_deposit[0].amount,
      )
        .dividedBy(new BigNumber(10).pow(balance.decimals))
        .toString();

      setValue("initialDeposit", {
        ...depositParams.params.min_deposit[0],
        amount: demicroAmount,
      });
    }
  }, [depositParams, setValue, balance?.decimals]);

  useEffect(() => {
    if (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : String(submitError),
      );
    }
  }, [submitError]);

  useEffect(() => {
    register("wasmByteCode", {
      required: "Please upload a WASM binary file",
      validate: () => {
        if (!uploadedFile) {
          return "Please upload a WASM binary file";
        }

        return true;
      },
    });
  }, [register, uploadedFile]);

  const handleFormSubmit = async (data: FormValues) => {
    try {
      if (!balance?.decimals)
        throw new Error("Unable to determine token decimals");

      const microAmount = new BigNumber(data.initialDeposit?.amount || "0")
        .multipliedBy(1_000_000)
        .toString();

      const requiredAmount = new BigNumber(microAmount);
      const availableBalance = new BigNumber(balance.baseAmount || "0");
      const estimatedGas = new BigNumber("500000");

      if (availableBalance.isLessThan(requiredAmount.plus(estimatedGas))) {
        throw new Error(
          `Insufficient balance. You need at least ${formatCoin({
            amount: requiredAmount.plus(estimatedGas).toString(),
            denom: "uxion",
          })} for deposit and gas fees.`,
        );
      }

      setFormData({
        ...data,
        initialDeposit: {
          ...data.initialDeposit,
          amount: microAmount,
          denom: "uxion",
        },
      });

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
      const arrayBuffer = await formData.wasmByteCode.arrayBuffer();
      const wasmByteCode = new Uint8Array(arrayBuffer);

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

  const handleClose = () => {
    setStep(Step.Form);
    setError(null);
    setFormData(null);
    router.push("/governance");
  };

  return (
    <div className={`w-full ${step !== Step.Form ? "modal-open" : ""}`}>
      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FormInput
          error={errors.title?.message}
          id="title"
          label="Title"
          register={register}
          required
        />

        <div className="flex flex-col space-y-2">
          <FormTextArea
            error={errors.description?.message}
            id="description"
            label="Description"
            register={register}
            required
            {...register("description", {
              required: "Description is required",
              value:
                "## Developer Information \n\n### Link to Developer/Company \n\n### Developer Description\n\n\n\n## Contract Details\n\n### Contract Name\n\n### Contract Source Link\n\n### Contract Description and Intended Use\n\n\n\n## Audit and Execution Information\n\n### Audit Report Link\n\n### Audit Process Description\n\n### Execution Messages Description\n\n\n\n## Deployment Information\n\n### Testnet Explorer Link\n\n",
            })}
          />
          {errors.description && (
            <span className="text-sm text-red-500">
              {errors.description.message}
            </span>
          )}
        </div>

        <FileUpload
          error={errors.wasmByteCode?.message}
          id="wasmByteCode"
          label="Deployment Information"
          setUploadedFile={setUploadedFile}
          setValue={setValue}
          unregister={unregister}
          uploadedFile={uploadedFile}
        />

        <div className="flex w-full flex-col">
          <div className="font-['Akkurat LL'] text-2xl font-bold leading-7 text-white">
            Deposit
          </div>
          <div className="font-['Akkurat LL'] text-base font-normal leading-normal text-[#6b6969]">
            For the proposal to pass to the voting stage, it must have{" "}
            {new BigNumber(
              depositParams?.params?.min_deposit?.[0]?.amount || "0",
            )
              .dividedBy(new BigNumber(10).pow(balance?.decimals || 6))
              .toString()}{" "}
            XION deposited.
          </div>
        </div>

        <FormInput
          error={errors.initialDeposit?.amount?.message}
          id="initialDeposit.amount"
          label="Initial Deposit"
          readOnly
          register={register}
          required
          type="number"
        />

        <Button className="mt-4 w-full" disabled={isSubmitting} type="submit">
          Submit Proposal
        </Button>
      </form>

      <ProposalModal
        error={error}
        isOpen={step !== Step.Form}
        onClose={handleClose}
        onConfirm={handleConfirm}
        step={
          step.toLowerCase() as "completed" | "form" | "review" | "submitting"
        }
        title={formData?.title}
      />
    </div>
  );
};
