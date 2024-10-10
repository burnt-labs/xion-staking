"use client";

import { Title } from "@/features/core/components/base";

/*
 * DATA:
 * https://api.xion-testnet-1.burnt.com/cosmos/gov/v1beta1/proposals?pagination.key=AAAAAAAAADM%3D&pagination.limit=15
 *
 * use pagination limit of 10, and page using pagination.key while result.pagination.next_key is set.
 */

export default function GovernancePage() {
  return (
    <>
      <div className="page-container flex flex-col gap-6 px-[12px] pb-[24px] md:px-[24px]">
        <div className="mt-[40px] flex flex-row justify-between text-left">
          <Title>Proposals</Title>
        </div>
      </div>
    </>
  );
}
