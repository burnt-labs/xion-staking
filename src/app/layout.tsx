"use client";

import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";
import { Inter } from "next/font/google";

import { StakingProvider } from "@/features/staking/context/provider";
import { dashboardUrl } from "@/features/staking/lib/constants";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const abstraxionConfig = {
  contracts: [],
  dashboardUrl,
  stake: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AbstraxionProvider config={abstraxionConfig}>
          <StakingProvider>{children}</StakingProvider>
        </AbstraxionProvider>
      </body>
    </html>
  );
}
