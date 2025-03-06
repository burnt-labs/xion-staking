"use client";

import { Abstraxion, useModal } from "@burnt-labs/abstraxion";
import Link from "next/link";

import XionLogo from "@/components/XionLogo";
import { IS_MAINNET, mainNavItems } from "@/config";
import { useProMode } from "@/features/core/context/pro-mode";

import NavAccount from "./nav-account";
import NavLink from "./nav-link";

export default function BaseWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getLink, isProMode } = useProMode();
  const [, setShowAbstraxion] = useModal();

  return (
    <main className="flex min-h-screen flex-col items-center">
      <nav
        className="flex w-full flex-row"
        style={{ borderBottom: "1px solid #333" }}
      >
        <div className="page-container m-auto flex h-[80px] flex-row items-center justify-between px-[16px]">
          <div className="flex w-[200px] flex-row items-center">
            <Link
              className="flex cursor-pointer items-center"
              href={getLink("staking")}
            >
              <XionLogo height={32} width={87} />
              <span
                className={[
                  "ml-[8px] translate-y-[4px] rounded-[4px] p-[4px] text-[12px] uppercase",
                  IS_MAINNET
                    ? "bg-chain-mainnetBg text-chain-mainnetFg"
                    : "bg-chain-testnetBg text-chain-testnetFg",
                ].join(" ")}
              >
                {IS_MAINNET ? "Mainnet" : "Testnet"}
              </span>
            </Link>
          </div>
          <div className="hidden flex-1 flex-row items-center justify-center md:flex">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
          <div className="flex w-[200px] items-center justify-end">
            <NavAccount />
          </div>
        </div>
      </nav>
      {children}
      {!isProMode && (
        <Abstraxion
          onClose={() => {
            setShowAbstraxion(false);
          }}
        />
      )}
    </main>
  );
}
