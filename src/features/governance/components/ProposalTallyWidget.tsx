import React from "react";

import { Title } from "@/features/core/components/base";

import { VoteType, getVoteTypeColorClass } from "../lib/types";

interface ProposalTallyWidgetProps {
  abstainPercentage: number;
  noPercentage: number;
  noWithVetoPercentage: number;
  yesPercentage: number;
}

export const ProposalTallyWidget: React.FC<ProposalTallyWidgetProps> = ({
  abstainPercentage,
  noPercentage,
  noWithVetoPercentage,
  yesPercentage,
}) => {
  const totalPercentage = [
    { label: "Yes", percentage: yesPercentage, type: VoteType.Yes },
    { label: "No", percentage: noPercentage, type: VoteType.No },
    {
      label: "Abstain",
      percentage: abstainPercentage,
      type: VoteType.Abstain,
    },
    {
      label: "No With Veto",
      percentage: noWithVetoPercentage,
      type: VoteType.NoWithVeto,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title>Voter</Title>
      </div>
      <div className="w-full rounded-lg bg-white/10 p-4 text-white shadow-lg">
        {totalPercentage.map(({ label, percentage, type }, index) => (
          <div
            className={`${
              index !== 3 ? "mb-4 " : ""
            }flex h-20 flex-col items-center justify-center rounded-2xl bg-black`}
            key={type}
          >
            <span className="text-2xl font-bold text-white">
              {percentage.toFixed(2)}%
            </span>
            <span
              className={`mt-1 text-sm font-bold ${getVoteTypeColorClass(type)}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
