"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";

/**
 * Interface defining the shape of the ProMode context.
 * This context manages the pro mode state and link generation throughout the app.
 */
interface ProModeContextType {
  /**
   * Generates a link path based on the current pro mode state.
   * If in pro mode and the path is staking-related, it will be prefixed with '/pro'.
   * @param path - The target path to generate a link for
   * @returns The final path with appropriate prefix
   */
  getLink: (path: string) => string;
  /**
   * Indicates whether the app is currently in pro mode.
   * Pro mode uses CosmosKit instead of Abstraxion for wallet connections.
   */
  isProMode: boolean;
}

const ProModeContext = createContext<ProModeContextType | undefined>(undefined);

/**
 * Provider component that manages pro mode state based on URL path.
 * Pro mode is determined by whether the current path starts with '/pro'.
 * In pro mode, staking functionality uses CosmosKit instead of Abstraxion.
 */
export function ProModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProMode = pathname?.startsWith("/pro") ?? false;

  const getLink = (path: string): string => {
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    if (isProMode) {
      return `/pro/${cleanPath}`;
    }

    return `/${cleanPath}`;
  };

  return (
    <ProModeContext.Provider value={{ getLink, isProMode }}>
      {children}
    </ProModeContext.Provider>
  );
}

/**
 * Hook to access the pro mode context.
 * Provides access to the current pro mode state and link generation utility.
 * @throws Error if used outside of ProModeProvider
 * @returns The pro mode context containing isProMode state and getLink utility
 */
export function useProMode() {
  const context = useContext(ProModeContext);

  if (context === undefined) {
    throw new Error("useProMode must be used within a ProModeProvider");
  }

  return context;
}
