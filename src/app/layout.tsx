"use client";

import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";
import type { Chain } from "@chain-registry/types";
import { GasPrice } from "@cosmjs/stargate";
import type { SignerOptions } from "@cosmos-kit/core";
import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { wallets as okxWallets } from "@cosmos-kit/okxwallet-extension";
import { wallets as leapWallets } from "@cosmos-kit/leap-extension";
import { wallets as ledgerWallets } from "@cosmos-kit/ledger";
import { wallets as metamaskWallets } from "@cosmos-kit/cosmos-extension-metamask";
import { ChainProvider } from "@cosmos-kit/react";
import "@interchain-ui/react/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FAUCET_CONTRACT_ADDRESS, REST_API_URL, RPC_URL } from "@/config";
import BaseWrapper from "@/features/core/components/base-wrapper";
import { ProModeProvider } from "@/features/core/context/pro-mode";
import { CoreProvider } from "@/features/core/context/provider";
import { StakingProvider } from "@/features/staking/context/provider";
import { assets, chains } from "@/features/staking/lib/chains/xion";

import "./globals.css";

// Abstraxion config
const abstraxionConfig = {
  contracts: [FAUCET_CONTRACT_ADDRESS],
  restUrl: REST_API_URL,
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
    if (typeof chain === "string") return undefined;

    switch (chain.chain_name) {
      case "xiontestnet":
      case "xion":
        return {
          gasPrice: GasPrice.fromString("0.001uxion"),
        };
      default:
        return undefined;
    }
  },
  signingStargate: (chain: Chain | string) => {
    if (typeof chain === "string") return undefined;

    switch (chain.chain_name) {
      case "xiontestnet":
      case "xion":
        return {
          gasPrice: GasPrice.fromString("0.001uxion"),
        };
      default:
        return undefined;
    }
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ProModeProvider>
            <ChainProvider
              assetLists={assets}
              chains={chains}
              endpointOptions={{
                endpoints: {
                  xion: {
                    rest: [REST_API_URL],
                    rpc: [RPC_URL],
                  },
                  xiontestnet: {
                    rest: [REST_API_URL],
                    rpc: [RPC_URL],
                  },
                },
              }}
              signerOptions={signerOptions}
              wallets={[...keplrWallets, ...okxWallets, ...leapWallets, ...ledgerWallets, ...metamaskWallets]}
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
          </ProModeProvider>
        </QueryClientProvider>
        <ToastContainer closeOnClick />
      </body>
    </html>
  );
}
