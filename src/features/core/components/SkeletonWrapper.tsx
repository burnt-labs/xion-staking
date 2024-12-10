import { type ReactNode } from "react";

interface SkeletonWrapperProps {
  children: ReactNode;
  height?: number | string;
  isLoading: boolean;
  width?: number | string;
}

export const SkeletonWrapper = ({
  children,
  height = "1em",
  isLoading,
  width = "auto",
}: SkeletonWrapperProps) => {
  if (isLoading) {
    return (
      <div
        className="relative animate-pulse overflow-hidden rounded bg-gradient-to-r from-[#e5e7eb] via-[#d1d5db] to-[#e5e7eb] dark:from-[#1e1e1e] dark:via-[#2d2d2d] dark:to-[#1e1e1e]"
        style={{ height, width }}
      >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );
  }

  return children;
};
