import React from "react";

import { ProposalDetailsResult, ProposalStatus, VoteType } from "../lib/types";
import { formatProposalDate, getProposalStatus } from "../lib/utils";
import { ProposalStatusPill } from "./ProposalStatusPill";
import { ProposalTallyBar } from "./ProposalTallyBar";
import { VoteWidget } from "./ProposalVoteWidget";

interface ProposalOverviewProps {
  proposalDetails: ProposalDetailsResult;
}

export const ProposalOverview: React.FC<ProposalOverviewProps> = ({
  proposalDetails,
}) => {
  const { title, submittedDate, voteValue } = proposalDetails.info;
  const { progressData, proposal } = proposalDetails;
  const proposalId = proposal.id;

  const getVoteAmount = (type: VoteType): number => {
    const voteData = progressData.find((data) => data.type === type);
    return voteData ? Number(voteData.amount) : 0;
  };

  const totalVotes = progressData.reduce(
    (sum, data) => (data.type !== "quorum" ? sum + Number(data.amount) : sum),
    0,
  );

  const getVotePercentage = (type: VoteType): number => {
    const amount = getVoteAmount(type);
    return totalVotes > 0 ? (amount / totalVotes) * 100 : 0;
  };

  const yesPercentage = getVotePercentage(VoteType.Yes);
  const noPercentage = getVotePercentage(VoteType.No);
  const abstainPercentage = getVotePercentage(VoteType.Abstain);
  const noWithVetoPercentage = getVotePercentage(VoteType.NoWithVeto);

  const status = getProposalStatus(proposalDetails.info.status);

  return (
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
              yesPercentage={yesPercentage}
              noPercentage={noPercentage}
              abstainPercentage={abstainPercentage}
              vetoPercentage={noWithVetoPercentage}
            />
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col justify-end lg:mt-0 lg:w-[303px] lg:flex-shrink-0">
          {status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD && (
            <VoteWidget proposalId={proposalId} userVote={voteValue} />
          )}
        </div>
      </div>
    </div>
  );
};
