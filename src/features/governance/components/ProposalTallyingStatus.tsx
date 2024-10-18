import React from "react";

import { TooltipPopover } from "@/features/core/components/TooltipPopover";
import { Title } from "@/features/core/components/base";

import { ProposalDetailsResult } from "../lib/types";
import {
  calculateRemainingDays,
  calculateVotingProgress,
  formatProposalDate,
} from "../lib/utils";

export const ProposalTallyingStatus = ({
  proposalDetails,
}: {
  proposalDetails: ProposalDetailsResult;
}) => {
  const { progressData, quorum, quorumReached, threshold, proposal } =
    proposalDetails;
  const votingEndTime = proposal.voting_end_time;

  const quorumData = progressData.find((data) => data.type === "quorum");
  const yesData = progressData.find((data) => data.type === "yes");
  const noData = progressData.find((data) => data.type === "no");
  const noWithVetoData = progressData.find(
    (data) => data.type === "no_with_veto",
  );

  const yesPercentage = parseFloat(yesData?.percent || "0");
  const noPercentage = parseFloat(noData?.percent || "0");
  const noWithVetoPercentage = parseFloat(noWithVetoData?.percent || "0");
  const totalVotes = yesPercentage + noPercentage + noWithVetoPercentage;
  const thresholdMetPercentage =
    totalVotes > 0 ? (yesPercentage / totalVotes) * 100 : 0;

  const quorumPercentage = parseFloat(quorumData?.percent || "0");
  const quorumValue = quorumReached
    ? `Reached ${quorumPercentage.toFixed(2)}%`
    : `${quorumPercentage.toFixed(2)}%`;

  const remainingDays = calculateRemainingDays(votingEndTime);
  const votingPeriodValue =
    remainingDays > 0 ? `${remainingDays} Days Left` : "Voting Ended";

  return (
    <div>
      <div className="mb-6">
        <Title>Proposal Tallying Status</Title>
      </div>
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
            value={`${thresholdMetPercentage.toFixed(2)}% Yes`}
            infoTooltip="Minimum percentage of 'Yes' votes required for the proposal to pass, excluding abstain."
            isPositive={thresholdMetPercentage > threshold * 100}
          >
            <ThresholdBar
              threshold={threshold * 100}
              thresholdMetPercentage={thresholdMetPercentage}
            />
          </TallyCard>
          <TallyCard
            title="Voting Period"
            value={votingPeriodValue}
            infoTooltip="Time remaining for voting on this proposal"
            isPositive={remainingDays > 0}
          >
            <VotingPeriodBar
              percentage={calculateVotingProgress(votingEndTime)}
              endDate={votingEndTime}
            />
          </TallyCard>
        </div>
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
  thresholdMetPercentage,
}: {
  threshold: number;
  thresholdMetPercentage: number;
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
        {/* percent threshold met */}
        <div
          className="absolute h-full bg-success"
          style={{ width: `${thresholdMetPercentage.toFixed(0)}%` }}
        />

        {/* threshold marker */}
        <div
          className="absolute h-full w-0.5 bg-[#666666]"
          style={{ left: `${threshold}%` }}
        />
      </div>
    </div>
  );
};

const VotingPeriodBar = ({
  percentage,
  endDate,
}: {
  percentage: number;
  endDate: string;
}) => (
  <div className="flex flex-col space-y-2">
    <div className="text-center text-xs text-[#666666]">
      <span>{percentage.toFixed(0)}%</span>
    </div>
    <div className="relative h-4 w-full border border-white/20">
      <div
        className="absolute h-full bg-white"
        style={{ width: `${percentage}%` }}
      />
    </div>
    <div className="text-xs text-[#666666]">
      End on {formatProposalDate(endDate, "utc")}
    </div>
  </div>
);
