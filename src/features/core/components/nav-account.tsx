"use client";

import { Button, ClipboardCopy, FloatingDropdown } from "./base";
import { mainNavItems } from "@/config";
import AddressShort from "@/features/staking/components/address-short";
import { wallet } from "../lib/icons";
import NavLink from "./nav-link";
import { useChainAccount } from "@/features/core/hooks/useChainAccount";
import { useCore } from "@/features/core/context/hooks";
import { setPopupOpenId } from "@/features/core/context/reducer";

const Account = () => (
  <span className="flex flex-row items-center gap-[8px] rounded-[8px] bg-bg-600 px-[16px] py-[18px]">
    <span dangerouslySetInnerHTML={{ __html: wallet }} />
  </span>
);

function NavAccount() {
  const { core } = useCore();
  const { account, isConnected, login, logout } = useChainAccount();

  const closeDropdown = () => {
    core.dispatch(setPopupOpenId(null));
  };

  return (
    <div className="cursor-pointer">
      {isConnected ? (
        <FloatingDropdown
          Trigger={Account}
          id="nav-account"
          offset={10}
          placement="bottom-end"
        >
          <div className="flex flex-col gap-[32px] rounded-[16px] bg-bg-600 p-[24px]">
            <div className="flex flex-col gap-[12px]">
              <div className="text-[14px]">XION Address</div>
              <div className="flex min-w-[250px] flex-row justify-between rounded-[8px] bg-[#000] px-[16px] py-[20px] text-[#fff]">
                {account?.bech32Address && (
                  <AddressShort
                    address={account.bech32Address}
                    className="text-[16px] text-[#fff]"
                  />
                )}
                {account?.bech32Address && (
                  <ClipboardCopy textToCopy={account.bech32Address} />
                )}
              </div>
            </div>
            <div className="relative inline-flex flex-col items-center gap-8 px-0">
              {mainNavItems.map((item) => (
                <NavLink key={item.href} onClick={closeDropdown} {...item} />
              ))}
            </div>
            <Button
              className="w-full flex-1 py-[8px] uppercase"
              onClick={logout}
              variant="danger-naked"
            >
              Log out
            </Button>
          </div>
        </FloatingDropdown>
      ) : (
        <Button onClick={login}>
          Log in
        </Button>
      )}
    </div>
  );
}

export default NavAccount;
