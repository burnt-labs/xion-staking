"use client";

import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import React from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "react-toastify";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { chains, assets } from "@/features/staking/lib/chains/xion";
import { SignerOptions } from "@cosmos-kit/core";
import type { Chain } from "@chain-registry/types";
import { Decimal } from "@cosmjs/math";

import { FAUCET_CONTRACT_ADDRESS } from "@/config";
import { REST_URL, RPC_URL } from "@/constants";
import BaseWrapper from "@/features/core/components/base-wrapper";
import { CoreProvider } from "@/features/core/context/provider";
import { StakingProvider } from "@/features/staking/context/provider";

import "@interchain-ui/react/styles";

// Abstraxion config
const abstraxionConfig = {
  contracts: [FAUCET_CONTRACT_ADDRESS],
  restUrl: REST_URL,
  rpcUrl: RPC_URL,
  stake: true,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const signerOptions: SignerOptions = {
  signingStargate: (chain: string | Chain) => {
    console.log('signingStargate called with chain:', chain);
    console.log('NEXT_PUBLIC_GAS_PRICE:', process.env.NEXT_PUBLIC_GAS_PRICE);
    
    if (typeof chain === 'string' || !chain.chain_name.includes('xion')) {
      console.log('Skipping non-xion chain');
      return undefined;
    }

    const gasAmount = process.env.NEXT_PUBLIC_GAS_PRICE?.split('u')[0] || "0.001";
    console.log('Using gas amount:', gasAmount);

    const gasPrice = {
      amount: Decimal.fromUserInput(gasAmount, 6),
      denom: "uxion"
    };
    console.log('Configured gas price:', gasPrice);

    return { gasPrice };
  },
  signingCosmwasm: (chain: string | Chain) => {
    console.log('signingCosmwasm called with chain:', chain);
    console.log('NEXT_PUBLIC_GAS_PRICE:', process.env.NEXT_PUBLIC_GAS_PRICE);
    
    if (typeof chain === 'string' || !chain.chain_name.includes('xion')) {
      console.log('Skipping non-xion chain');
      return undefined;
    }

    const gasAmount = process.env.NEXT_PUBLIC_GAS_PRICE?.split('u')[0] || "0.001";
    console.log('Using gas amount:', gasAmount);

    const gasPrice = {
      amount: Decimal.fromUserInput(gasAmount, 6),
      denom: "uxion"
    };
    console.log('Configured gas price:', gasPrice);

    return { gasPrice };
  },
  preferredSignType: () => 'amino'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ChainProvider 
            chains={chains} 
            assetLists={assets}
            wallets={[...keplrWallets]}
            signerOptions={signerOptions}
            walletConnectOptions={{
              signClient: {
                projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
                relayUrl: "wss://relay.walletconnect.org",
                metadata: {
                  name: "Xion Staking",
                  description: "Xion Staking Interface",
                  url: "https://staking.xion.burnt.com",
                  icons: ["https://staking.xion.burnt.com/favicon.ico"]
                }
              }
            }}
          >
            <AbstraxionProvider config={abstraxionConfig}>
              <CoreProvider>
                <StakingProvider>
                  <BaseWrapper>{children}</BaseWrapper>
                  <Analytics />
                </StakingProvider>
              </CoreProvider>
            </AbstraxionProvider>
          </ChainProvider>
        </QueryClientProvider>
        <ToastContainer closeOnClick />
      </body>
    </html>
  );
}
