import React from "react";

import type { VoteOptionType } from "../lib/types";
import { ProposalStatus } from "../lib/types";
import { formatProposalDate } from "../lib/utils";
import { ProposalStatusPill } from "./ProposalStatusPill";
import { ProposalTallyBar } from "./ProposalTallyBar";
import { VoteWidget } from "./ProposalVoteWidget";

interface ProposalOverviewProps {
  abstainPercentage: number;
  noPercentage: number;
  noWithVetoPercentage: number;
  proposalId: string;
  status: ProposalStatus;
  submittedDate: string;
  title: string;
  voteValue: undefined | VoteOptionType;
  yesPercentage: number;
}

const VoteEmptyState = () => (
  <div className="flex h-[184px] w-[303px] flex-col gap-6">
    <div className="font-['Akkurat LL'] text-sm font-bold leading-none text-white">
      Voting Period Ended
    </div>

    <div className="h-16 w-full rounded-lg border border-[#bdbdbd]  hover:cursor-not-allowed">
      <div className="font-['Akkurat LL'] flex h-full items-center justify-center text-sm font-normal uppercase leading-tight text-[#bdbdbd]">
        Yes
      </div>
    </div>

    <div className="flex gap-4">
      <div className="h-16 w-[222px] rounded-lg border border-[#bdbdbd]  hover:cursor-not-allowed">
        <div className="font-['Akkurat LL'] flex h-full items-center justify-center text-sm font-normal uppercase leading-tight text-[#bdbdbd]">
          No
        </div>
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#bdbdbd]  hover:cursor-not-allowed">
        <div className="flex flex-col gap-2">
          <div className="h-1 w-1 rounded-full bg-[#bdbdbd]" />
          <div className="h-1 w-1 rounded-full bg-[#bdbdbd]" />
          <div className="h-1 w-1 rounded-full bg-[#bdbdbd]" />
        </div>
      </div>
    </div>
  </div>
);

export const ProposalOverview: React.FC<ProposalOverviewProps> = ({
  abstainPercentage,
  noPercentage,
  noWithVetoPercentage,
  proposalId,
  status,
  submittedDate,
  title,
  voteValue,
  yesPercentage,
}) => (
  <div className="rounded-lg bg-white/10 p-6 text-white shadow-lg">
    <div className="flex flex-col lg:flex-row lg:justify-between lg:space-x-6">
      <div className="flex-grow">
        <div className="mb-4">
          <ProposalStatusPill status={status} />
          <h2 className="font-['Akkurat LL'] mb-[7px] mt-2 text-[32px] font-bold leading-9 text-white">
            {title}
          </h2>
          <p className="font-['Akkurat LL'] text-sm font-normal leading-tight text-white opacity-40">
            Proposed {formatProposalDate(submittedDate)}
          </p>
        </div>

        <div className="mt-8">
          <ProposalTallyBar
            abstainPercentage={abstainPercentage}
            noPercentage={noPercentage}
            vetoPercentage={noWithVetoPercentage}
            yesPercentage={yesPercentage}
          />
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col justify-end lg:mt-0 lg:w-[303px] lg:flex-shrink-0">
        {status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD ? (
          <VoteWidget proposalId={proposalId} userVote={voteValue} />
        ) : (
          <VoteEmptyState />
        )}
      </div>
    </div>
  </div>
);
