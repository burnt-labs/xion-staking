import React from "react";

import { TooltipPopover } from "@/features/core/components/TooltipPopover";

import { ProposalDetailsResult } from "../lib/types";

export const TallyingProcedure = ({
  proposalDetails,
}: {
  proposalDetails: ProposalDetailsResult;
}) => {
  const { progressData, quorum, quorumReached, threshold } = proposalDetails;

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
          infoTooltip={`Minimum participation required for the proposal to be valid. Quorum %: ${quorumPercentage.toFixed(2)}%`}
          isPositive={quorumReached}
        >
          <QuorumBar percentage={quorumPercentage} quorum={quorum * 100} />
        </TallyCard>
        <TallyCard
          title="Threshold"
          value={`${yesData?.percent || "0"} Yes`}
          infoTooltip="Minimum percentage of 'Yes' votes required for the proposal to pass"
          isPositive={parseFloat(yesData?.percent || "0") > 50}
        >
          <ThresholdBar
            threshold={threshold * 100}
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
  <div className="flex flex-col space-y-2">
    {/* top line */}
    <div
      className="flex justify-between text-xs text-[#666666]"
      style={{ paddingLeft: `${quorum}%` }}
    >
      <span>{quorum.toFixed(2)}%</span>
    </div>

    {/* bar */}
    <div className="relative h-4 w-full border border-[#1C1C1C]">
      {/* percent achieved */}
      <div
        className="absolute h-full bg-white"
        style={{ width: `${percentage}%` }}
      />

      {/* delta between achieved and quorum */}
      {percentage < quorum && (
        <div
          className="absolute h-full bg-[#434040]"
          style={{
            left: `${percentage}%`,
            width: `${Math.min(quorum - percentage, 100 - percentage)}%`,
          }}
        />
      )}

      {/* quorum marker */}
      <div
        className="absolute h-full w-0.5 bg-[#666666]"
        style={{ left: `${quorum}%` }}
      />
    </div>
  </div>
);

const ThresholdBar = ({
  threshold,
  yesPercentage,
  noPercentage,
}: {
  threshold: number;
  yesPercentage: number;
  noPercentage: number;
}) => {
  return (
    <div className="flex flex-col space-y-2">
      {/* top line */}
      <div
        className="flex justify-between text-xs text-[#666666]"
        style={{ paddingLeft: `${threshold}%` }}
      >
        <span>{threshold.toFixed(2)}%</span>
      </div>

      {/* bar */}
      <div className="relative h-4 w-full border border-[#1C1C1C]">
        {/* percent yes votes */}
        <div
          className="absolute h-full bg-[#03c600]"
          style={{ width: `${yesPercentage}%` }}
        />

        {/* delta between yes votes and threshold */}
        {yesPercentage < threshold && (
          <div
            className="absolute h-full bg-success"
            style={{
              left: `${yesPercentage}%`,
              width: `${threshold - yesPercentage}%`,
            }}
          />
        )}

        {/* threshold marker */}
        <div
          className="absolute h-full w-0.5 bg-[#666666]"
          style={{ left: `${threshold}%` }}
        />

        {/* percent no votes */}
        <div
          className="absolute h-full bg-[#f00]"
          style={{ width: `${noPercentage}%` }}
        />
      </div>
    </div>
  );
};
const VotingPeriodBar = ({ percentage }: { percentage: number }) => (
  <div className="flex flex-col space-y-2">
    <div className="text-center text-xs text-[#666666]">
      <span>{percentage}%</span>
    </div>
    <div className="relative h-4 w-full border border-white/20">
      <div
        className="absolute h-full bg-[#434040]"
        style={{ width: `${percentage}%` }}
      >
        <div className="h-full bg-white" style={{ width: `${80}%` }} />
      </div>
      <div
        className="absolute h-full w-0.5 bg-[#666666]"
        style={{ left: `${percentage}%` }}
      />
    </div>
    <div className="text-xs text-[#666666]">
      End on Jul 22 2024 13:21:37 UTC-04:00
    </div>
  </div>
);
