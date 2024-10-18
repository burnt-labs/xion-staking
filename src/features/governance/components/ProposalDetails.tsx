import { Title } from "@/features/core/components/base";

import useMarkdownParser from "../hooks/useMarkdownParser";
import { ProposalDetailsResult } from "../lib/types";
import { ProposalMessageDetails } from "./ProposalMessageDetails";

interface ProposalDetailsProps {
  proposalDetails: ProposalDetailsResult;
}

export function ProposalDetails({ proposalDetails }: ProposalDetailsProps) {
  const markdownParser = useMarkdownParser();
  const content = markdownParser(proposalDetails.proposal.summary);

  console.log({ proposalDetails });

  return (
    <div>
      <div className="mb-6">
        <Title>Proposal Details</Title>
      </div>
      <div className="w-full max-w-[1119px] rounded-lg bg-white/10 p-4 text-white shadow-lg">
        <h2 className="font-['Akkurat LL'] mb-8 mt-2 text-2xl font-bold leading-9 text-white">
          {proposalDetails.proposal.title}
        </h2>
        <div className="font-['Akkurat LL'] mb-8 flex flex-col gap-4 text-base font-normal leading-normal text-white">
          {content}
        </div>
        <div className="flex flex-col gap-4">
          <ProposalMessageDetails
            messages={proposalDetails.proposal.messages}
          />
        </div>
      </div>
    </div>
  );
}
