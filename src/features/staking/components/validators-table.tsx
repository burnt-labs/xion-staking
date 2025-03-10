"use client";

import BigNumber from "bignumber.js";
import { BondStatus } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { memo, useState } from "react";

import {
  ButtonPill,
  LoadingBanner,
  NavLink,
  SearchInput,
  TabButton,
  Title,
} from "@/features/core/components/base";
import {
  HeaderTitleBase,
  ValidatorLogo,
} from "@/features/core/components/table";
import { useProMode } from "@/features/core/context/pro-mode";
import { sortUtil } from "@/features/core/utils";

import { useStaking } from "../context/hooks";
import { setModalOpened } from "../context/reducer";
import {
  getHasStakedInValidator,
  getVotingPowerPerc,
} from "../context/selectors";
import type { StakingContextType, StakingState } from "../context/state";
import { useValidatorLogo } from "../hooks";
import { getXionCoinFromUXion } from "../lib/core/coins";
import {
  formatCoin,
  formatCommission,
  formatVotingPowerPerc,
} from "../lib/formatters";
import AddressShort from "./address-short";
import { DivisorHorizontal } from "./divisor";
import TokenColors from "./token-colors";

const minGridWidth = 1000;

const commonGridClasses =
  "grid-cols-[150px_repeat(3,1fr)_80px_100px] md:grid-cols-[350px_repeat(3,1fr)_80px_100px]";

const gridStyle = {
  gap: "16px",
  minWidth: minGridWidth,
};

type ValidatorItemProps = {
  disabled?: boolean;
  onStake: (() => void) | null;
  staking: StakingContextType;
  validator: NonNullable<StakingState["validators"]["bonded"]>["items"][number];
};

const ValidatorRow = ({
  disabled,
  onStake,
  staking,
  validator,
}: ValidatorItemProps) => {
  const { getLink } = useProMode();
  const { identity } = validator.description;
  const logo = useValidatorLogo(identity, validator.operatorAddress);

  const votingPowerPerc = getVotingPowerPerc(validator?.tokens, staking.state);
  const votingPowerPercStr = formatVotingPowerPerc(votingPowerPerc);

  const stakedAmountEl = (
    <TokenColors
      text={formatCoin(
        getXionCoinFromUXion(new BigNumber(validator.tokens)),
        true,
      )}
    />
  );

  const commissionEl = formatCommission(
    validator.commission.commissionRates.rate,
    2,
  );

  const detailsEl = (
    <NavLink href={getLink(`validator?address=${validator.operatorAddress}`)}>
      Details
    </NavLink>
  );

  return (
    <>
      <div
        className="hidden w-full flex-col items-center justify-between gap-0 md:flex"
        style={{
          minWidth: minGridWidth,
        }}
      >
        <div
          className={[
            "grid w-full items-center justify-between gap-2 p-4",
            commonGridClasses,
          ].join(" ")}
          style={gridStyle}
        >
          <div className="flex flex-1 flex-row justify-start gap-4">
            <ValidatorLogo logo={logo} />
            <div className="flex flex-col justify-center gap-[2px] text-left">
              <div className="max-w-[150px] overflow-hidden truncate text-[14px] font-bold leading-[20px] md:max-w-[300px]">
                {validator.description.moniker}
              </div>
              <AddressShort address={validator.operatorAddress} />
            </div>
            <div className="flex min-w-max flex-col items-center justify-center">
              {getHasStakedInValidator(
                validator.operatorAddress,
                staking.state,
              ) && (
                <div className="rounded-[2px] bg-successBg px-[8px] py-[2px] text-[11px] font-medium leading-[16px] tracking-normal text-success">
                  You staked
                </div>
              )}
            </div>
          </div>
          <div className="text-right">{stakedAmountEl}</div>
          <div className="text-right">{commissionEl}</div>
          {votingPowerPerc && (
            <div className="text-right">{votingPowerPercStr}</div>
          )}
          <div className="text-right">{detailsEl}</div>
          {onStake && (
            <div>
              <ButtonPill disabled={disabled} onClick={onStake}>
                Delegate
              </ButtonPill>
            </div>
          )}
        </div>
        <div
          className="box-content h-[1px] bg-bg-500"
          style={{ width: "calc(100% - 48px)" }}
        />
      </div>
      <div className="flex w-full flex-col items-center justify-between gap-[8px] p-[16px] md:hidden">
        <div className="flex w-full flex-row justify-start gap-4">
          <ValidatorLogo logo={logo} />
          <div className="flex flex-col justify-center gap-[2px] text-left">
            <div className="max-w-[150px] overflow-hidden truncate text-[14px] font-bold leading-[20px] md:max-w-[300px]">
              {validator.description.moniker}
            </div>
            <AddressShort address={validator.operatorAddress} />
          </div>
          <div className="flex min-w-max flex-col items-center justify-center">
            {getHasStakedInValidator(
              validator.operatorAddress,
              staking.state,
            ) && (
              <div className="rounded-[2px] bg-successBg px-[8px] py-[2px] text-[11px] font-medium leading-[16px] tracking-normal text-success">
                You staked
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full flex-row justify-between">
          <span>Staked Amount</span>
          <span>{stakedAmountEl}</span>
        </div>
        <div className="flex w-full flex-row justify-between">
          <span>Commission</span>
          <span>{commissionEl}</span>
        </div>
        {votingPowerPerc && (
          <div className="flex w-full flex-row justify-between">
            <span>Voting Power</span>
            <span>{votingPowerPercStr}</span>
          </div>
        )}
        <div className="flex w-full flex-row items-center justify-end gap-[24px]">
          {detailsEl}
          {onStake && (
            <ButtonPill disabled={disabled} onClick={onStake}>
              Delegate
            </ButtonPill>
          )}
        </div>
        <DivisorHorizontal className="&:bg-[#ffffff10] mt-[24px]" />
      </div>
    </>
  );
};

type SortMethod =
  | "commission-asc"
  | "commission-desc"
  | "name-asc"
  | "name-desc"
  | "none"
  | "staked-asc"
  | "staked-desc"
  | "voting-power-asc"
  | "voting-power-desc";

const HeaderTitle = HeaderTitleBase<SortMethod>;

const ValidatorsTable = () => {
  const { isConnected, staking } = useStaking();
  const [sortMethod, setSortMethod] = useState<SortMethod>("none");
  const [currentTab, setCurrentTab] = useState<"active" | "inactive">("active");
  const [searchValue, setSearchValue] = useState<string>("");

  const { validators: validatorsObj } = staking.state;

  const activeValidators = validatorsObj.bonded?.items || [];

  const inactiveValidators = (validatorsObj.unbonded?.items || []).concat(
    validatorsObj.unbonding?.items || [],
  );

  const isInitialLoading =
    !staking.state.validators.bonded ||
    !staking.state.validators.unbonding ||
    !staking.state.validators.bonded;

  const validators =
    currentTab === "active" ? activeValidators : inactiveValidators;

  const sortedItems = validators
    .filter(
      currentTab === "active"
        ? (v) => v.status === BondStatus.BOND_STATUS_BONDED
        : (v) =>
            v.status === BondStatus.BOND_STATUS_UNBONDED ||
            v.status === BondStatus.BOND_STATUS_UNBONDING,
    )
    .slice()
    .sort((a, b) => {
      if (sortMethod === "none") return 0;

      if (["voting-power-asc", "voting-power-desc"].includes(sortMethod)) {
        const votingPowerA = getVotingPowerPerc(a.tokens, staking.state);
        const votingPowerB = getVotingPowerPerc(b.tokens, staking.state);

        return sortUtil(
          votingPowerA,
          votingPowerB,
          sortMethod === "voting-power-asc",
        );
      }

      if (["commission-asc", "commission-desc"].includes(sortMethod)) {
        const commissionA = parseFloat(a.commission.commissionRates.rate);
        const commissionB = parseFloat(b.commission.commissionRates.rate);

        return sortUtil(
          commissionA,
          commissionB,
          sortMethod === "commission-asc",
        );
      }

      if (["name-asc", "name-desc"].includes(sortMethod)) {
        const nameA = a.description.moniker.toLowerCase();
        const nameB = b.description.moniker.toLowerCase();

        return sortUtil(nameA, nameB, sortMethod === "name-asc");
      }

      if (["staked-asc", "staked-desc"].includes(sortMethod)) {
        const aTokens = new BigNumber(a.tokens);
        const bTokens = new BigNumber(b.tokens);

        return sortUtil(aTokens, bTokens, sortMethod === "staked-asc");
      }

      return 0;
    })
    .filter((validator) => {
      if (!searchValue) return true;

      const moniker = validator.description.moniker.toLowerCase();
      const operatorAddress = validator.operatorAddress.toLowerCase();

      return (
        moniker.includes(searchValue.toLowerCase()) ||
        operatorAddress.includes(searchValue.toLowerCase())
      );
    });

  return (
    <>
      <div className="flex flex-col  md:grid md:grid-cols-3">
        <div className="mb-[16px] flex w-full flex-row justify-start gap-[12px] md:mb-[0px] md:gap-[16px]">
          <Title>Validators</Title>
          <SearchInput
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
          />
        </div>
        <div className="mt-[12px] flex flex-row items-center justify-center gap-[40px] uppercase md:mt-0">
          <TabButton
            active={currentTab === "active"}
            onClick={() => {
              setCurrentTab("active");
            }}
          >
            Active
            <span className="hidden md:inline-block">
              {" "}
              ({activeValidators.length})
            </span>
          </TabButton>
          <TabButton
            active={currentTab === "inactive"}
            onClick={() => {
              setCurrentTab("inactive");
            }}
          >
            Inactive
            <span className="ml-[4px] hidden md:inline-block">
              {" "}
              ({inactiveValidators.length})
            </span>
          </TabButton>
        </div>
      </div>
      <div className="min-h-[100px] overflow-auto rounded-[24px] bg-bg-600 pb-4 text-typo-100">
        <div
          className={[
            "hidden w-full items-center justify-between gap-2 bg-bg-500 p-4 uppercase md:grid",
            commonGridClasses,
          ].join(" ")}
          style={gridStyle}
        >
          <HeaderTitle
            mobile
            onSort={setSortMethod}
            sort={sortMethod}
            sorting={["name-asc", "name-desc"]}
          >
            Validator
          </HeaderTitle>
          <HeaderTitle
            mobile
            onSort={setSortMethod}
            rigthAlign
            sort={sortMethod}
            sorting={["staked-asc", "staked-desc"]}
          >
            <div className="text-right">Staked Amount</div>
          </HeaderTitle>
          <HeaderTitle
            mobile
            onSort={setSortMethod}
            rigthAlign
            sort={sortMethod}
            sorting={["commission-asc", "commission-desc"]}
          >
            <div className="text-right">Commission</div>
          </HeaderTitle>
          <HeaderTitle
            mobile
            onSort={setSortMethod}
            rigthAlign
            sort={sortMethod}
            sorting={["voting-power-asc", "voting-power-desc"]}
          >
            <div className="text-right">Voting Power</div>
          </HeaderTitle>
        </div>
        {isInitialLoading && <LoadingBanner />}
        {sortedItems.map((validator) => (
          <ValidatorRow
            disabled={!isConnected}
            key={validator.operatorAddress}
            onStake={
              currentTab === "active"
                ? () => {
                    staking.dispatch(
                      setModalOpened({
                        content: { validator },
                        type: "delegate",
                      }),
                    );
                  }
                : null
            }
            staking={staking}
            validator={validator}
          />
        ))}
      </div>
    </>
  );
};

export default memo(ValidatorsTable);
