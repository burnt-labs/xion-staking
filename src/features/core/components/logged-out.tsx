"use client";

import { useModal } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { useChain } from "@cosmos-kit/react";
import { useCallback } from "react";

import { IS_PRO_MODE, IS_TESTNET } from "@/config";

function LoggedOut() {
  const [, setShowAbstraxion] = useModal();
  const chain = useChain(IS_TESTNET ? "xion-testnet-1" : "xion-mainnet-1");

  const onViewAccount = useCallback(() => {
    if (IS_PRO_MODE) {
      chain.connect();
    } else {
      setShowAbstraxion(true);
    }
  }, [chain, setShowAbstraxion]);

  return (
    <div className="w-max">
      <Button fullWidth onClick={onViewAccount} structure="base">
        CONNECT
      </Button>
    </div>
  );
}

export default LoggedOut;
