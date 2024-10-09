"use client";

import { Abstraxion, useModal } from "@burnt-labs/abstraxion";
import Link from "next/link";

import { BASE_PATH, IS_TESTNET } from "@/config";

import NavAccount from "./nav-account";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setShowAbstraxion] = useModal();

  return (
    <main className="flex min-h-screen flex-col items-center">
      <nav
        className="flex w-full flex-row"
        style={{ borderBottom: "1px solid #333" }}
      >
        <div className="page-container m-auto flex h-[80px] flex-row items-center justify-between px-[16px]">
          <div className="flex w-[200px] flex-row items-center">
            <Link className="flex cursor-pointer items-center" href="/">
              <img alt="Xion Logo" src={`${BASE_PATH}/xion-logo.svg`} />
              <span
                className={[
                  "ml-[8px] translate-y-[4px] rounded-[4px] p-[4px] text-[12px] uppercase",
                  IS_TESTNET
                    ? "bg-chain-testnetBg text-chain-testnetFg"
                    : "bg-chain-mainnetBg text-chain-mainnetFg",
                ].join(" ")}
              >
                {IS_TESTNET ? "Testnet" : "Mainnet"}
              </span>
            </Link>
          </div>
          <div className="hidden flex-1 flex-row items-center justify-center md:flex">
            <Link href="/" className="mx-4">
              Staking
            </Link>
            <Link href="/governance" className="mx-4">
              Governance
            </Link>
          </div>
          <div className="flex w-[200px] items-center justify-end">
            <NavAccount />
          </div>
        </div>
      </nav>
      {children}
      <Abstraxion
        onClose={() => {
          setShowAbstraxion(false);
        }}
      />
    </main>
  );
}
