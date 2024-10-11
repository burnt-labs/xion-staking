import React from "react";

import { Proposal, ProposalStatusColor } from "../lib/types";
import { formatProposalDate, getProposalStatus } from "../lib/utils";

interface ProposalCardProps {
  proposal: Proposal;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const status = getProposalStatus(proposal.status);
  const statusColor = ProposalStatusColor[status];

  return (
    <div className="relative h-[277px] w-[368px] rounded-[16px] bg-bg-600">
      <div className="absolute left-[24px] top-[27px] inline-flex h-[66px] flex-col items-start justify-start gap-4">
        <div
          className="inline-flex items-center justify-center gap-1 rounded border px-2 py-1"
          style={{
            backgroundColor: statusColor,
            borderColor: `${statusColor}20`,
          }}
        >
          <div className="text-xs font-bold uppercase leading-[14px] tracking-wide text-black">
            {status.replace("PROPOSAL_STATUS_", "")}
          </div>
        </div>
        <div className="text-2xl font-bold leading-7 text-white">
          <span
            title={proposal.title}
            className="block overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {proposal.title.length > 23
              ? `${proposal.title.slice(0, 23)}...`
              : proposal.title}
          </span>
        </div>
      </div>
      <div className="absolute left-[17px] top-[113px] h-[0px] w-[327px] border border-white/20"></div>
      <div className="absolute left-[24px] top-[233px] text-sm font-normal leading-tight text-white opacity-40">
        Proposed {formatProposalDate(proposal.submit_time)}
      </div>
      <div className="absolute left-[24px] top-[133px] inline-flex h-[84px] w-80 flex-col items-start justify-start gap-3">
        <div className="inline-flex items-start justify-between self-stretch">
          <div className="text-sm font-bold leading-none text-white">ID</div>
          <div className="text-right text-sm font-normal leading-tight text-white">
            Proposal {proposal.id}
          </div>
        </div>
        <div className="inline-flex items-start justify-between self-stretch">
          <div className="text-sm font-bold leading-none text-white">Type</div>
          <div className="text-right text-sm font-normal leading-tight text-white">
            {proposal.messages[0]["@type"].split(".").pop()}
          </div>
        </div>
        <div className="inline-flex items-start justify-between self-stretch">
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
    </div>
  );
};

export default ProposalCard;
