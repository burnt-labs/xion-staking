import React, { useEffect, useRef, useState } from "react";

import InfoIcon from "../../governance/components/InfoIcon";

interface TooltipPopoverProps {
  content: string;
  icon?: React.ReactNode;
}

export const TooltipPopover: React.FC<TooltipPopoverProps> = ({
  content,
  icon = <InfoIcon className="h-4 w-4 cursor-help" />,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={tooltipRef}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {icon}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-[200px] rounded-2xl bg-[#1a1a1a] shadow">
          <div className="p-4">
            <p className="text-sm text-white">{content}</p>
          </div>
        </div>
      )}
    </div>
  );
};
