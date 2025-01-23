"use client";

import { AbstraxionProvider } from "@burnt-labs/abstraxion";
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { GrazProvider } from "graz";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FAUCET_CONTRACT_ADDRESS, IS_TESTNET } from "@/config";
import { REST_URL, RPC_URL } from "@/constants";
import BaseWrapper from "@/features/core/components/base-wrapper";
import { CoreProvider } from "@/features/core/context/provider";
import { StakingProvider } from "@/features/staking/context/provider";

import "./globals.css";

const abstraxionConfig = {
  contracts: [FAUCET_CONTRACT_ADDRESS],
  restUrl: REST_URL,
  rpcUrl: RPC_URL,
  stake: true,
};

const grazChainConfig = {
  // bech32Config: {
  //   bech32PrefixAccAddr: "xion",
  //   bech32PrefixAccPub: "xionpub",
  //   bech32PrefixConsAddr: "xionvalcons",
  //   bech32PrefixConsPub: "xionvalconspub",
  //   bech32PrefixValAddr: "xionvaloper",
  //   bech32PrefixValPub: "xionvaloperpub"
  // },
  // bip44: {
  //   coinType: 118
  // },
  chainId: IS_TESTNET ? "xion-testnet-1" : "xion-mainnet-1",
  // chainName: IS_TESTNET ? "Xion Testnet" : "Xion Mainnet",
  currencies: [{
    coinDecimals: 6,
    coinDenom: "XION",
    coinMinimalDenom: "uxion",
    gasPriceStep: {
      average: 0.025,
      high: 0.03,
      low: 0.01
    }
  }],
  // features: ["cosmwasm"],
  // feeCurrencies: [{
  //   coinDecimals: 6,
  //   coinDenom: "XION",
  //   coinMinimalDenom: "uxion",
  //   gasPriceStep: {
  //     average: 0.025,
  //     high: 0.03,
  //     low: 0.01
  //   }
  // }],
  gas: {
    denom: "uxion",
    price: process.env.NEXT_PUBLIC_GAS_PRICE || "0.025",
    
  },
  rest: REST_URL,
  rpc: RPC_URL,
  // stakeCurrency: {
  //   coinDecimals: 6,
  //   coinDenom: "XION",
  //   coinMinimalDenom: "uxion",
  //   gasPriceStep: {
  //     average: 0.025,
  //     high: 0.03,
  //     low: 0.01
  //   }
  // }
};

// const chainsConfig = {
//   "xion-testnet-1": {
//     gas: {
//       denom: "uxion",
//       price: process.env.NEXT_PUBLIC_GAS_PRICE || "0.025",
      
//     },
//   },
// };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <GrazProvider debug grazOptions={{ defaultChain: grazChainConfig,  }}>
            <AbstraxionProvider config={abstraxionConfig}>
              <CoreProvider>
                <StakingProvider>
                  <BaseWrapper>{children}</BaseWrapper>
                  <Analytics />
                </StakingProvider>
              </CoreProvider>
            </AbstraxionProvider>
          </GrazProvider>
        </QueryClientProvider>
        <ToastContainer closeOnClick />
      </body>
    </html>
  );
}
