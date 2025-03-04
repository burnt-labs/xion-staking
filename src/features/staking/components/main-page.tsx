"use client";

import { memo, useState } from "react";

import { Title } from "@/features/core/components/base";

import { useStaking } from "../context/hooks";
import DelegationDetails, {
  DetailsTrigger,
  getCanShowDetails,
} from "./delegation-details";
import StakingModals from "./staking-modals";
import StakingOverview from "./staking-overview";
import ValidatorsTable from "./validators-table";

function StakingPage() {
  const { staking } = useStaking();
  const [isShowingDetails, setIsShowingDetails] = useState(true);

  const canShowDetail = getCanShowDetails(staking.state);

  return (
    <>
      <div className="page-container flex flex-col gap-6 px-[12px] pb-[24px] md:px-[24px]">
        <div className="mt-[40px] flex flex-row justify-between text-left">
          <Title>
            <span className="hidden md:block">Your Staking Overview</span>
            <span className="block md:hidden">Your Overview</span>
          </Title>
          {canShowDetail && (
            <DetailsTrigger
              isShowingDetails={isShowingDetails}
              setIsShowingDetails={setIsShowingDetails}
            />
          )}
        </div>
        <StakingOverview />
        {isShowingDetails && canShowDetail && <DelegationDetails />}
        <ValidatorsTable />
      </div>
      <StakingModals />
    </>
  );
}

export default memo(StakingPage);
