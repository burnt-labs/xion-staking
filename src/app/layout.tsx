"use client";

import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/src/styles.css";
import type { Chain } from "@chain-registry/types";
import { GasPrice } from "@cosmjs/stargate";
import type { SignerOptions } from "@cosmos-kit/core";
import { wallets as metamaskWallets } from "@cosmos-kit/cosmos-extension-metamask";
import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { wallets as leapWallets } from "@cosmos-kit/leap-extension";
import { wallets as ledgerWallets } from "@cosmos-kit/ledger";
import { wallets as okxWallets } from "@cosmos-kit/okxwallet-extension";
import { ChainProvider } from "@cosmos-kit/react";
import "@interchain-ui/react/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CHAIN_ID, IS_MAINNET, REST_API_URL, RPC_URL } from "@/config";
import BaseWrapper from "@/features/core/components/base-wrapper";
import { ProModeProvider } from "@/features/core/context/pro-mode";
import { CoreProvider } from "@/features/core/context/provider";
import { StakingProvider } from "@/features/staking/context/provider";
import { assets, chains } from "@/features/staking/lib/chains/xion";

import "./globals.css";

// Abstraxion config
const abstraxionConfig = {
  chainId: CHAIN_ID,
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

    // Assuming there is only one fee token.
    if (chain?.fees?.fee_tokens.length !== 1) {
      return undefined;
    }

    // These values are optional in the type def. Will need to alter this code if we move to a dynamic gas model
    const { denom, fixed_min_gas_price } = chain?.fees?.fee_tokens[0];

    return {
      gasPrice: GasPrice.fromString(`${fixed_min_gas_price}${denom}`),
    } as any;
  },
  signingStargate: (chain: Chain | string) => {
    if (typeof chain === "string") return undefined;

    // Assuming there is only one fee token.
    if (chain?.fees?.fee_tokens.length !== 1) {
      return undefined;
    }

    // These values are optional in the type def. Will need to alter this code if we move to a dynamic gas model
    const { denom, fixed_min_gas_price } = chain?.fees?.fee_tokens[0];

    return {
      gasPrice: GasPrice.fromString(`${fixed_min_gas_price}${denom}`),
    } as any;
  },
};

const proWallets = [...keplrWallets, ...ledgerWallets];

const testnetProWallets = [...okxWallets, ...leapWallets, ...metamaskWallets];

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
                  xiontestnet2: {
                    rest: [REST_API_URL],
                    rpc: [RPC_URL],
                  },
                },
              }}
              signerOptions={signerOptions}
              throwErrors={false}
              wallets={[
                ...(IS_MAINNET ? [] : testnetProWallets),
                ...proWallets,
              ]}
            >
              <AbstraxionProvider config={abstraxionConfig}>
                <CoreProvider>
                  <StakingProvider>
                    <BaseWrapper>{children}</BaseWrapper>
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
