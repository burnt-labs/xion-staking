import React from "react";

import { Proposal, ProposalStatus } from "../lib/types";
import { formatProposalDate, getProposalStatus } from "../lib/utils";
import ProposalStatusPill from "./proposal-status-pill";
import ProposalTallyBar from "./proposal-tally-bar";
import VoteWidget from "./proposal-vote-widget";

interface ProposalOverviewProps {
  proposal: Proposal;
}

export const ProposalOverview: React.FC<ProposalOverviewProps> = ({
  proposal,
}) => {
  const { title, submit_time, voting_end_time, final_tally_result } = proposal;
  const totalVotes =
    Number(final_tally_result.yes_count) +
    Number(final_tally_result.no_count) +
    Number(final_tally_result.abstain_count) +
    Number(final_tally_result.no_with_veto_count);
  const yesPercentage =
    (Number(final_tally_result.yes_count) / totalVotes) * 100;
  const noPercentage = (Number(final_tally_result.no_count) / totalVotes) * 100;
  const abstainPercentage =
    (Number(final_tally_result.abstain_count) / totalVotes) * 100;
  const noWithVetoPercentage =
    (Number(final_tally_result.no_with_veto_count) / totalVotes) * 100;

  const status = getProposalStatus(proposal.status);

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
              Proposed {formatProposalDate(submit_time)}
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
          <VoteWidget />
        </div>
      </div>
    </div>
  );
};

export default ProposalOverview;

/*
example prop:
{
    "id": "61",
    "messages": [
        {
            "@type": "/ibc.lightclients.wasm.v1.MsgStoreCode",
            "signer": "xion10d07y265gmmuvt4z0w9aw880jnsr700jctf8qc",
            "wasm_byte_code": ""
        }   
    ],
    "status": "PROPOSAL_STATUS_PASSED",
    "final_tally_result": {
        "yes_count": "37604085070878",
        "abstain_count": "0",
        "no_count": "0",
        "no_with_veto_count": "0"
    },
    "submit_time": "2024-10-10T14:49:08.675760269Z",
    "deposit_end_time": "2024-10-10T14:49:18.675760269Z",
    "total_deposit": [
        {
            "denom": "uxion",
            "amount": "1000000000"
        }
    ],
    "voting_start_time": "2024-10-10T14:49:08.675760269Z",
    "voting_end_time": "2024-10-11T14:49:08.675760269Z",
    "metadata": "",
    "title": "Upload CometBLS Wasm client",
    "summary": "Upload CometBLS Wasm client",
    "proposer": "xion14yy92ae8eq0q3ezy9nasumt65hwdgryvpkf0a4",
    "expedited": false,
    "failed_reason": ""
}
*/
