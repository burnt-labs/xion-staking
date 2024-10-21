import React from "react";

import type { ProposalStatus } from "../lib/types";
import { ProposalStatusColor, toStatusLabel } from "../lib/types";

interface ProposalStatusPillProps {
  status: ProposalStatus;
}

export const ProposalStatusPill: React.FC<ProposalStatusPillProps> = ({
  status,
}) => {
  const statusColor = ProposalStatusColor[status];

  return (
    <div
      className="inline-flex items-center justify-center rounded border px-2 py-1"
      style={{
        backgroundColor: statusColor,
        borderColor: `${statusColor}20`,
      }}
    >
      <div className="font-['Akkurat LL'] text-xs font-bold uppercase leading-[14px] tracking-wide text-black">
        {toStatusLabel[status]}
      </div>
    </div>
  );
};
