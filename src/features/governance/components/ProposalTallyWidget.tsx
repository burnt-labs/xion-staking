import React from "react";

import { Title } from "@/features/core/components/base";

import type { ProposalDetailsResult } from "../lib/types";

interface ProposalTallyWidgetProps {
  proposalDetails: ProposalDetailsResult;
}

export const ProposalTallyWidget: React.FC<ProposalTallyWidgetProps> = ({
  proposalDetails,
}) => {
  console.log(proposalDetails);

  return (
    <div>
      <div className="mb-6">
        <Title>Voter</Title>
      </div>
      <div className="w-full justify-center rounded-lg bg-white/10 p-4 text-white shadow-lg">
        <div className="relative h-20 w-[303px]">
          <div className="absolute left-0 top-0 h-20 w-[303px] rounded-2xl bg-black" />
          <div className="font-['Akkurat LL'] absolute left-[128.35px] top-[48px] w-[48.40px] text-center text-sm font-bold leading-none text-[#03c600]">
            Yes
          </div>
          <div className="font-['Akkurat LL'] absolute left-[65.23px] top-[16px] w-[168.33px] text-center text-2xl font-bold leading-7 text-white">
            72.65%
          </div>
        </div>
      </div>
    </div>
  );
};
