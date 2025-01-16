import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/features/core/components/base";
import { useAccountBalance } from "@/features/core/hooks/useAccountBalance";
import { formatCoin } from "@/features/staking/lib/formatters";

import { useDepositParams, useSubmitProposal } from "../context/hooks";
import type { StoreCodeProposalValues } from "../lib/types";
import { ProposalType } from "../lib/types";
import { FileUpload } from "./forms/FileUpload";
import { FormInput } from "./forms/FormInput";
import { FormSelect } from "./forms/FormSelect";
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

const PERMISSION_OPTIONS = [
  { label: "Everybody", value: "Everybody" },
  { label: "Nobody", value: "Nobody" },
  { label: "Only Address", value: "OnlyAddress" },
];

export const SubmitProposalForm = () => {
  const [step, setStep] = useState<Step>(Step.Form);
  const [error, setError] = useState<null | string>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormValues | null>(null);

  const [selectedPermission, setSelectedPermission] =
    useState<string>("Everybody");

  const { data: depositParams } = useDepositParams();
  const { getBalanceByDenom } = useAccountBalance();
  const balance = getBalanceByDenom("uxion");

  const {
    error: submitError,
    isSubmitting,
    submitProposal,
  } = useSubmitProposal();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    unregister,
  } = useForm<FormValues>({
    defaultValues: {
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

  const handlePermissionChange = (value: string) => {
    setSelectedPermission(value);

    setValue(
      "instantiatePermission.permission",
      value as "Everybody" | "Nobody" | "OnlyAddress",
    );
  };

  const handleFormSubmit = async (data: FormValues) => {
    try {
      if (!balance?.decimals)
        throw new Error("Unable to determine token decimals");

      const microAmount = new BigNumber(data.initialDeposit?.amount || "0")
        .multipliedBy(new BigNumber(10).pow(balance.decimals))
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
  };

  return (
    <div className="w-full">
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

        <FormTextArea
          error={errors.description?.message}
          id="description"
          label="Contract Description and intended uses"
          register={register}
          required
        />

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
            Contract Permissions
          </div>
        </div>

        <FormSelect
          id="instantiatePermission.permission"
          label="Instantiate Permission"
          onChange={handlePermissionChange}
          options={PERMISSION_OPTIONS}
          register={register}
          value={selectedPermission}
        />

        {selectedPermission === "OnlyAddress" && (
          <FormInput
            error={errors.instantiatePermission?.address?.message}
            id="instantiatePermission.address"
            label="Authorized Address"
            register={register}
            required={selectedPermission === "OnlyAddress"}
          />
        )}

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
        description={formData?.description}
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
