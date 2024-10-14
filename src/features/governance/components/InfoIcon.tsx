import React from "react";

interface InfoIconProps {
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ className = "" }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7.10667 6.20026V12.8669H8.93333V6.20026H7.10667ZM8.01333 3.33359C7.36 3.33359 6.92 3.78693 6.92 4.44026C6.92 5.09359 7.36 5.53359 8.01333 5.53359C8.66667 5.53359 9.12 5.09359 9.12 4.44026C9.12 3.78693 8.66667 3.33359 8.01333 3.33359Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default InfoIcon;
