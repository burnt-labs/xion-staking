import React, { useEffect, useRef, useState } from "react";

import { useGovernanceTx } from "../context/hooks";
import { VoteType } from "../lib/types";
import ProposalVoteModal from "./ProposalVoteModal";

const VotePopover: React.FC<{
  onVote: (voteType: VoteType) => void;
}> = ({ onVote }) => (
  <div className="absolute right-0 top-full mt-2 w-[148px] rounded-2xl bg-[#1a1a1a] shadow">
    <div className="p-4">
      <button
        className="mb-4 w-full text-left text-sm font-bold leading-tight text-white"
        onClick={() => onVote(VoteType.Abstain)}
      >
        Abstain
      </button>
      <div className="mb-4 h-[1px] w-full border-t border-white/20" />
      <button
        className="w-full text-left text-sm font-bold leading-tight text-white"
        onClick={() => onVote(VoteType.NoWithVeto)}
      >
        No with Veto
      </button>
    </div>
  </div>
);

interface VoteWidgetProps {
  proposalId: string;
  userVote: undefined | VoteType;
}

export const VoteWidget: React.FC<VoteWidgetProps> = ({
  proposalId,
  userVote,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState<null | VoteType>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { address, client, submitVote } = useGovernanceTx();

  // listen for clicks outside the popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // handle vote click
  const handleVote = (voteType: VoteType) => {
    setSelectedVote(voteType);
    setShowModal(true);
    setShowPopover(false);
  };

  // handle confirming vote
  const handleConfirmVote = async () => {
    if (selectedVote && proposalId) {
      const voteOption = {
        [VoteType.Abstain]: 2,
        [VoteType.No]: 3,
        [VoteType.NoWithVeto]: 4,
        [VoteType.Yes]: 1,
      }[selectedVote];

      try {
        await submitVote({
          client: client!,
          option: voteOption,
          proposalId,
          voter: address!,
        });

        setShowModal(false);
      } catch (error) {
        console.error("Error submitting vote:", error);
      }
    }
  };

  return (
    <div className="w-full">
      <p className="font-['Akkurat LL'] mb-4 text-sm font-bold leading-none text-white">
        {userVote ? `You voted {voteValue}` : `Vote for`}
      </p>
      <button
        className="font-['Akkurat LL'] mb-4 h-16 w-full rounded-lg border border-[#03c600] bg-[#03c600]/5 text-sm font-normal uppercase leading-tight text-[#03c600]"
        onClick={() => handleVote(VoteType.Yes)}
      >
        YES
      </button>
      <div className="flex justify-between">
        <button
          className="font-['Akkurat LL'] h-16 w-[calc(100%-72px)] rounded-lg border border-[#d64406] bg-[#d64406]/5 text-sm font-normal uppercase leading-tight text-[#d64406]"
          onClick={() => handleVote(VoteType.No)}
        >
          NO
        </button>
        <div className="relative" ref={popoverRef}>
          <button
            className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/20"
            onClick={() => setShowPopover(!showPopover)}
          >
            <div className="flex flex-col items-center">
              <div className="mb-2 h-1 w-1 rounded-full bg-[#6b6969]" />
              <div className="mb-2 h-1 w-1 rounded-full bg-[#6b6969]" />
              <div className="h-1 w-1 rounded-full bg-[#6b6969]" />
            </div>
          </button>
          {showPopover && <VotePopover onVote={handleVote} />}
        </div>
      </div>
      {selectedVote && (
        <ProposalVoteModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmVote}
          voteType={selectedVote}
        />
      )}
    </div>
  );
};
