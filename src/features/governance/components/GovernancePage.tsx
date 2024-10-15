"use client";

import Link from "next/link";
import React, { useState } from "react";

import { LoadingBanner, Title } from "@/features/core/components/base";

import { useProposals } from "../context/hooks";
import { ProposalCard } from "./ProposalCard";

export default function GovernancePage() {
  const { data: proposals, isLoading } = useProposals();

  return (
    <>
      <div className="page-container flex flex-col gap-6 px-[12px] pb-[24px] md:px-[24px]">
        <div className="mt-[40px] flex flex-row justify-between text-left">
          <Title>Proposals</Title>
        </div>
        {isLoading ? (
          <LoadingBanner />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proposals?.map((proposal) => (
              <Link
                key={proposal.id}
                href={`/governance/proposal?proposal_id=${proposal.id}`}
                className="flex justify-center"
              >
                <ProposalCard proposal={proposal} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
