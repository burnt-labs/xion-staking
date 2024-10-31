import React from "react";

interface ChevronIconProps {
  className?: string;
}

const ChevronIcon: React.FC<ChevronIconProps> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="icon">
      <path
        d="M14 8L10 12L14 16"
        id="Arrow"
        stroke="white"
        strokeOpacity="0.4"
        strokeWidth="2"
      />
    </g>
  </svg>
);

export default ChevronIcon;
