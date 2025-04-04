import React from "react";

import type { Proposal } from "../lib/types";
import {
  getProposalMessageType,
  getProposalMessageTypeName,
} from "../lib/types";
import { formatProposalDate, getProposalStatus } from "../lib/utils";
import { ProposalStatusPill } from "./ProposalStatusPill";

interface ProposalCardProps {
  proposal: Proposal;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const status = getProposalStatus(proposal.status);

  return (
    <div className="flex h-[277px] min-w-[352px] flex-col gap-5 rounded-[16px]  bg-bg-600 p-6">
      <div className="flex flex-col items-start justify-start gap-4">
        <ProposalStatusPill status={status} />
        <div className="text-2xl font-bold leading-7 text-white">
          <span
            className="block overflow-hidden text-ellipsis whitespace-nowrap"
            title={proposal.title}
          >
            {proposal.title.length > 21
              ? `${proposal.title.slice(0, 21)}...`
              : proposal.title}
          </span>
        </div>
      </div>
      <div className="h-[1px] w-full bg-white/20" />
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="text-sm font-bold leading-none text-white">ID</div>
          <div className="text-right text-sm font-normal leading-tight text-white">
            Proposal {proposal.id}
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div className="text-sm font-bold leading-none text-white">Type</div>
          <div className="text-right text-sm font-normal leading-tight text-white">
            {getProposalMessageTypeName(getProposalMessageType(proposal))}
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div className="text-sm font-bold leading-none text-white">
            {new Date(proposal.voting_end_time) > new Date()
              ? "Ends In"
              : "Ended"}
          </div>
          <div className="text-right text-sm font-normal leading-tight text-white">
            {formatProposalDate(proposal.voting_end_time)}
          </div>
        </div>
      </div>
      <div className="mt-auto text-sm font-normal leading-tight text-white opacity-40">
        Proposed {formatProposalDate(proposal.submit_time)}
      </div>
    </div>
  );
};
