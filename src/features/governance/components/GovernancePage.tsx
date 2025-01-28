"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";

import { LoadingBanner, Title } from "@/features/core/components/base";
import { useProMode } from "@/features/core/context/pro-mode";

import { useProposals } from "../context/hooks";
import { FilterControls } from "./FilterControls";
import type { FilterOption } from "./FilterControls";
import { PaginationControls } from "./PaginationControls";
import { ProposalCard } from "./ProposalCard";

const EmptyState = () => (
  <div className="flex min-h-[300px] items-center justify-center">
    <span className="text-lg text-white/60">No proposals</span>
  </div>
);

export default function GovernancePage() {
  const { data: proposals, isLoading } = useProposals();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const { getLink } = useProMode();
  const pageSize = 9;

  const filteredProposals = useMemo(() => {
    if (!proposals) return [];

    if (activeFilter === "all") return proposals;

    return proposals.filter((proposal) => proposal.status === activeFilter);
  }, [proposals, activeFilter]);

  const totalPages = Math.ceil(filteredProposals.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProposals = filteredProposals.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="page-container flex flex-col gap-6 px-[12px] pb-[24px] md:px-[24px]">
      <div className="mt-[40px] flex w-full flex-col justify-between gap-4 text-left lg:flex-row lg:gap-0">
        <Title>Proposals</Title>
        <FilterControls
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
      {isLoading ? (
        <LoadingBanner />
      ) : (
        <div>
          {currentProposals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentProposals.map((proposal) => (
                <Link
                  className="flex justify-center"
                  href={getLink(
                    `governance/proposal?proposal_id=${proposal.id}`,
                  )}
                  key={proposal.id}
                >
                  <ProposalCard proposal={proposal} />
                </Link>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          )}
        </div>
      )}
    </div>
  );
}
