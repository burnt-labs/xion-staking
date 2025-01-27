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
import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { chains, assets } from "@/features/staking/lib/chains/xion";
import type { SignerOptions } from "@cosmos-kit/core";
import { GasPrice } from "@cosmjs/stargate";
import type { Chain } from "@chain-registry/types";

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
  signingCosmwasm: (chain: Chain | string) => {
    if (typeof chain === 'string') return undefined;
    
    switch (chain.chain_name) {
      case "xion-testnet-1":
      case "xion-mainnet-1":
        return {
          gasPrice: GasPrice.fromString("0.001uxion")
        };
      default:
        return undefined;
    }
  },
  signingStargate: (chain: Chain | string) => {
    if (typeof chain === 'string') return undefined;
    
    switch (chain.chain_name) {
      case "xion-testnet-1":
      case "xion-mainnet-1":
        return {
          gasPrice: GasPrice.fromString("0.001uxion")
        };
      default:
        return undefined;
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ChainProvider 
            assetLists={assets}
            chains={chains} 
            endpointOptions={{
              endpoints: {
                "xion-mainnet-1": {
                  rest: [REST_URL],
                  rpc: [RPC_URL]
                },
                "xion-testnet-1": {
                  rest: [REST_URL],
                  rpc: [RPC_URL]
                }
              }
            }}
            signerOptions={signerOptions}
            wallets={[...keplrWallets]}
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
