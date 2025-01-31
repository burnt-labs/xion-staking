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

interface FormValues
  extends Omit<StoreCodeProposalValues, "description" | "wasmByteCode"> {
  // Audit Information
  auditProcessDescription: string;
  auditReportLink: string;
  // Contract Details
  contractDescription: string;
  contractName: string;
  contractSourceLink: string;
  // Developer Information
  developerDescription: string;
  developerLink: string;
  // Execution Information
  executionMessagesDescription: string;
  // Deployment Information
  testnetExplorerLink: string;
  // File Upload
  wasmByteCode: File;
}

const VALIDATION_MESSAGES = {
  AUDIT: {
    EXECUTION_REQUIRED: "Execution messages description is required",
    PROCESS_REQUIRED: "Audit process description is required",
    REPORT_REQUIRED: "Audit report link is required",
  },
  CONTRACT: {
    DESCRIPTION_REQUIRED: "Contract description is required",
    NAME_REQUIRED: "Contract name is required",
    SOURCE_REQUIRED: "Contract source link is required",
  },
  DEVELOPER: {
    DESCRIPTION_REQUIRED: "Developer description is required",
    LINK_REQUIRED: "Developer link is required",
  },
  TESTNET: {
    EXPLORER_REQUIRED: "Testnet explorer link is required",
  },
  URL_PATTERN: "Please enter a valid URL starting with http:// or https://",
  WASM_REQUIRED: "Please upload a WASM binary file",
} as const;

const URL_PATTERN = /^https?:\/\/.+/;

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
      required: VALIDATION_MESSAGES.WASM_REQUIRED,
      validate: () => {
        if (!uploadedFile) {
          return VALIDATION_MESSAGES.WASM_REQUIRED;
        }

        return true;
      },
    });
  }, [register, uploadedFile]);

  const generateDescription = (data: FormValues): string =>
    `## Developer Information\n\n### Link to Developer/Company\n${data.developerLink}\n\n### Developer Description\n${data.developerDescription}\n\n## Contract Details\n\n### Contract Name\n${data.contractName}\n\n### Contract Source Link\n${data.contractSourceLink}\n\n### Contract Description and Intended Use\n${data.contractDescription}\n\n## Audit and Execution Information\n\n### Audit Report Link\n${data.auditReportLink}\n\n### Audit Process Description\n${data.auditProcessDescription}\n\n### Execution Messages Description\n${data.executionMessagesDescription}\n\n## Deployment Information\n\n### Testnet Explorer Link\n${data.testnetExplorerLink}\n`;

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

      const formDataWithDescription = {
        ...data,
        description: generateDescription(data),
        initialDeposit: {
          ...data.initialDeposit,
          amount: microAmount,
          denom: "uxion",
        },
      };

      setFormData(formDataWithDescription);
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

      const description = generateDescription(formData);

      await submitProposal({
        ...formData,
        description,
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

        <div className="font-['Akkurat LL'] mt-6 text-2xl font-bold leading-7 text-white">
          Developer Information
        </div>

        <FormInput
          error={errors.developerLink?.message}
          id="developerLink"
          label="Link to Developer/Company"
          register={register}
          {...register("developerLink", {
            pattern: {
              message: VALIDATION_MESSAGES.URL_PATTERN,
              value: URL_PATTERN,
            },
            required: VALIDATION_MESSAGES.DEVELOPER.LINK_REQUIRED,
          })}
        />

        <FormTextArea
          error={errors.developerDescription?.message}
          height={180}
          id="developerDescription"
          label="Developer Description"
          register={register}
          required
          {...register("developerDescription", {
            required: VALIDATION_MESSAGES.DEVELOPER.DESCRIPTION_REQUIRED,
          })}
        />

        <div className="font-['Akkurat LL'] mt-6 text-2xl font-bold leading-7 text-white">
          Contract Details
        </div>

        <FormInput
          error={errors.contractName?.message}
          id="contractName"
          label="Contract Name"
          register={register}
          required
          {...register("contractName", {
            required: VALIDATION_MESSAGES.CONTRACT.NAME_REQUIRED,
          })}
        />

        <FormInput
          error={errors.contractSourceLink?.message}
          id="contractSourceLink"
          label="Contract Source Link"
          register={register}
          required
          {...register("contractSourceLink", {
            pattern: {
              message: VALIDATION_MESSAGES.URL_PATTERN,
              value: URL_PATTERN,
            },
            required: VALIDATION_MESSAGES.CONTRACT.SOURCE_REQUIRED,
          })}
        />

        <FormTextArea
          error={errors.contractDescription?.message}
          height={180}
          id="contractDescription"
          label="Contract Description and Intended Use"
          register={register}
          required
          {...register("contractDescription", {
            required: VALIDATION_MESSAGES.CONTRACT.DESCRIPTION_REQUIRED,
          })}
        />

        <div className="font-['Akkurat LL'] mt-6 text-2xl font-bold leading-7 text-white">
          Audit and Execution Information
        </div>

        <FormInput
          error={errors.auditReportLink?.message}
          id="auditReportLink"
          label="Audit Report Link"
          register={register}
          required
          {...register("auditReportLink", {
            pattern: {
              message: VALIDATION_MESSAGES.URL_PATTERN,
              value: URL_PATTERN,
            },
            required: VALIDATION_MESSAGES.AUDIT.REPORT_REQUIRED,
          })}
        />

        <FormTextArea
          error={errors.auditProcessDescription?.message}
          id="auditProcessDescription"
          label="Audit Process Description"
          register={register}
          required
          {...register("auditProcessDescription", {
            required: VALIDATION_MESSAGES.AUDIT.PROCESS_REQUIRED,
          })}
        />

        <FormTextArea
          error={errors.executionMessagesDescription?.message}
          id="executionMessagesDescription"
          label="Execution Messages Description"
          register={register}
          required
          {...register("executionMessagesDescription", {
            required: VALIDATION_MESSAGES.AUDIT.EXECUTION_REQUIRED,
          })}
        />

        <div className="font-['Akkurat LL'] mt-6 text-2xl font-bold leading-7 text-white">
          Deployment Information
        </div>

        <FormInput
          error={errors.testnetExplorerLink?.message}
          id="testnetExplorerLink"
          label="Testnet Explorer Link"
          register={register}
          required
          {...register("testnetExplorerLink", {
            pattern: {
              message: VALIDATION_MESSAGES.URL_PATTERN,
              value: URL_PATTERN,
            },
            required: VALIDATION_MESSAGES.TESTNET.EXPLORER_REQUIRED,
          })}
        />

        <FileUpload
          error={errors.wasmByteCode?.message}
          id="wasmByteCode"
          label="WASM Binary File"
          setUploadedFile={setUploadedFile}
          setValue={setValue}
          unregister={unregister}
          uploadedFile={uploadedFile}
        />

        <div className="mt-6 flex w-full flex-col">
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
