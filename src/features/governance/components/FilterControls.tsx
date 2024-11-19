import { ProposalStatus } from "../lib/types";

export type FilterOption = "all" | ProposalStatus;

interface FilterControlsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export const FilterControls = ({
  activeFilter,
  onFilterChange,
}: FilterControlsProps) => {
  const filters: Array<{ label: string; value: FilterOption }> = [
    { label: "All Proposals", value: "all" },
    { label: "Voting", value: ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD },
    { label: "Passed", value: ProposalStatus.PROPOSAL_STATUS_PASSED },
    { label: "Rejected", value: ProposalStatus.PROPOSAL_STATUS_REJECTED },
  ];

  return (
    <div className="inline-flex h-[33px] flex-wrap items-center justify-start gap-4">
      {filters.map(({ label, value }) => (
        <div
          className={`flex items-center justify-center gap-2.5 rounded-lg p-2 hover:cursor-pointer hover:bg-white/10 ${
            activeFilter === value ? "bg-white/10" : ""
          }`}
          key={value}
          onClick={() => onFilterChange(value)}
          onKeyDown={() => {}}
          role="button"
          tabIndex={0}
        >
          <div
            className={`font-['Akkurat LL'] text-sm font-bold ${
              activeFilter === value ? "text-white" : "text-white/40"
            }`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
};
