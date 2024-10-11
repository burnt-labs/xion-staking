import React from "react";

interface ProposalTallyBarProps {
  yesPercentage: number;
  noPercentage: number;
  abstainPercentage: number;
  vetoPercentage: number;
}

export const ProposalTallyBar: React.FC<ProposalTallyBarProps> = ({
  yesPercentage,
  noPercentage,
  abstainPercentage,
  vetoPercentage,
}) => {
  const totalPercentage =
    yesPercentage + noPercentage + abstainPercentage + vetoPercentage;

  // edge case by which percentages do not add up to 100 (e.g. all 0)
  const scale = totalPercentage === 0 ? 1 : 100 / totalPercentage;

  const scaledYes = yesPercentage * scale;
  const scaledNo = noPercentage * scale;
  const scaledAbstain = abstainPercentage * scale;
  const scaledVeto = vetoPercentage * scale;

  const allZero = totalPercentage === 0;

  return (
    <div className="relative w-full">
      {!allZero && (
        <div className="font-['Akkurat LL'] mb-2 flex text-[10px] font-normal uppercase leading-3 tracking-wider">
          {yesPercentage > 0 && <span className="text-[#03c600]">YES</span>}
          {abstainPercentage > 0 && (
            <span
              className="absolute text-[#949494]"
              style={{ left: `${scaledYes}%` }}
            >
              ABSTAIN
            </span>
          )}
          {noPercentage > 0 && (
            <span
              className="absolute text-[#d64406]"
              style={{
                left: `${scaledYes + scaledAbstain + scaledNo}%`,
                transform: "translateX(-100%)",
              }}
            >
              NO
            </span>
          )}
          {vetoPercentage > 0 && (
            <span className="absolute right-0 text-[#ff9800]">
              NO WITH VETO
            </span>
          )}
        </div>
      )}
      {!allZero && (
        <div className="font-['Akkurat LL'] mb-4 flex text-sm font-bold leading-none text-white">
          {yesPercentage > 0 && <span>{yesPercentage.toFixed(2)}%</span>}
          {abstainPercentage > 0 && (
            <span className="absolute" style={{ left: `${scaledYes}%` }}>
              {abstainPercentage.toFixed(2)}%
            </span>
          )}
          {noPercentage > 0 && (
            <span
              className="absolute"
              style={{
                left: `${scaledYes + scaledAbstain + scaledNo}%`,
                transform: "translateX(-100%)",
              }}
            >
              {noPercentage.toFixed(2)}%
            </span>
          )}
          {vetoPercentage > 0 && (
            <span className="absolute right-0">
              {vetoPercentage.toFixed(2)}%
            </span>
          )}
        </div>
      )}
      <div className="relative h-[42px] w-full bg-[#6b6969]">
        {!allZero && (
          <>
            {yesPercentage > 0 && (
              <div
                className="absolute left-0 top-0 h-full bg-[#03c600]"
                style={{ width: `${scaledYes}%` }}
              />
            )}
            {abstainPercentage > 0 && (
              <div
                className="absolute top-0 h-full bg-[#6b6969]"
                style={{ left: `${scaledYes}%`, width: `${scaledAbstain}%` }}
              />
            )}
            {noPercentage > 0 && (
              <div
                className="absolute top-0 h-full bg-[#d64406]"
                style={{
                  left: `${scaledYes + scaledAbstain}%`,
                  width: `${scaledNo}%`,
                }}
              />
            )}
            {vetoPercentage > 0 && (
              <div
                className="absolute right-0 top-0 h-full bg-[#ff9800]"
                style={{ width: `${scaledVeto}%` }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProposalTallyBar;
