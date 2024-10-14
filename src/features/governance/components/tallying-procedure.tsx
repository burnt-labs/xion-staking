import React from "react";

import { TooltipPopover } from "@/features/core/components/TooltipPopover";

import { ProposalDetailsResult } from "../lib/types";

export const TallyingProcedure = ({
  proposalDetails,
}: {
  proposalDetails: ProposalDetailsResult;
}) => {
  const { progressData, quorum, quorumReached } = proposalDetails;

  const quorumData = progressData.find((data) => data.type === "quorum");
  const yesData = progressData.find((data) => data.type === "yes");
  const noData = progressData.find((data) => data.type === "no");

  const quorumPercentage = parseFloat(quorumData?.percent || "0");
  const quorumValue = quorumReached
    ? `Reached ${quorumPercentage.toFixed(2)}%`
    : `${quorumPercentage.toFixed(2)}%`;

  return (
    <div className="w-full max-w-[1119px] rounded-lg bg-white/10 p-4 text-white shadow-lg">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TallyCard
          title="Quorum"
          value={quorumValue}
          infoTooltip="Minimum participation required for the proposal to be valid"
          isPositive={quorumReached}
        >
          <QuorumBar percentage={quorumPercentage} quorum={quorum * 100} />
        </TallyCard>
        <TallyCard
          title="Threshold"
          value={`${yesData?.percent || "0"}% Yes`}
          infoTooltip="Minimum percentage of 'Yes' votes required for the proposal to pass"
          isPositive={parseFloat(yesData?.percent || "0") > 50}
        >
          <ThresholdBar
            yesPercentage={parseFloat(yesData?.percent || "0")}
            noPercentage={parseFloat(noData?.percent || "0")}
          />
        </TallyCard>
        <TallyCard
          title="Voting Period"
          value="3 Days Left"
          infoTooltip="Time remaining for voting on this proposal"
          isPositive={true}
        >
          <VotingPeriodBar percentage={30} />
        </TallyCard>
      </div>
    </div>
  );
};

const TallyCard = ({
  title,
  value,
  infoTooltip,
  isPositive,
  children,
}: {
  title: string;
  value: string;
  infoTooltip: string;
  isPositive: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex-1 rounded-lg bg-[#000] p-4 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">{title}</div>
          <TooltipPopover content={infoTooltip} />
        </div>
        <div
          className={`text-sm font-medium ${
            isPositive ? "text-white" : "text-[#434040]"
          }`}
        >
          {value}
        </div>
      </div>
      {children}
    </div>
  );
};

const QuorumBar = ({
  percentage,
  quorum,
}: {
  percentage: number;
  quorum: number;
}) => (
  <div className="relative h-[57px] w-[314px]">
    {/* Quorum text */}
    <div
      className="absolute top-[21px] text-xs text-[#666666]"
      style={{ left: `${quorum}%` }}
    >
      <span>{quorum.toFixed(2)}%</span>
    </div>

    {/* Background bar - transparent */}
    <div className="absolute left-0 top-[41px] h-4 w-[314px] border border-[#1C1C1C]" />

    {/* Quorum line */}
    <div
      className="absolute top-[41px] h-4 w-[2px] bg-[#666666]"
      style={{ left: `${quorum}%` }}
    />

    {/* Progress bar (white for achieved quorum) */}
    <div
      className="absolute left-0 top-[41px] h-4 bg-white"
      style={{ width: `${Math.min(percentage, quorum)}%` }}
    />

    {/* Light grey for delta between achieved and required quorum */}
    {percentage < quorum && (
      <div
        className="absolute top-[41px] h-4 bg-[#434040]"
        style={{
          left: `${percentage}%`,
          width: `${Math.min(quorum - percentage, 100 - percentage)}%`,
        }}
      />
    )}
  </div>
);

const ThresholdBar = ({
  yesPercentage,
  noPercentage,
}: {
  yesPercentage: number;
  noPercentage: number;
}) => (
  <div className="relative h-[57px] w-[314px]">
    <div className="absolute left-0 top-[41px] h-4 w-[314px] border border-white/20" />
    <div
      className="absolute left-0 top-[41px] h-4 bg-[#00FF00]"
      style={{ width: `${yesPercentage}%` }}
    />
    <div
      className="absolute right-0 top-[41px] h-4 bg-[#FF4500]"
      style={{ width: `${noPercentage}%` }}
    />
    <div className="absolute left-[50%] top-[57px] h-[0px] w-[57px] origin-top-left -rotate-90 border border-[#666666]"></div>
    <div className="absolute left-0 top-0 w-full text-center text-xs text-[#666666]">
      <span>50%</span>
    </div>
  </div>
);

const VotingPeriodBar = ({ percentage }: { percentage: number }) => (
  <div className="relative h-[57px] w-[314px]">
    <div className="absolute left-0 top-[41px] h-4 w-[314px] border border-white/20" />
    <div
      className="absolute left-0 top-[41px] h-4 bg-[#434040]"
      style={{ width: `${percentage}%` }}
    />
    <div
      className="absolute left-0 top-[41px] h-4 bg-white"
      style={{ width: `${percentage * 0.8}%` }}
    />
    <div
      className="absolute top-[57px] h-[0px] w-[57px] origin-top-left -rotate-90 border border-[#666666]"
      style={{ left: `${percentage}%` }}
    ></div>
    <div className="absolute left-0 top-0 w-full text-center text-xs text-[#666666]">
      <span>{percentage}%</span>
    </div>
    <div className="mt-6 text-xs text-[#666666]">
      End on Jul 22 2024 13:21:37 UTC-04:00
    </div>
  </div>
);
