"use client";

import { useModal } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { useConnect } from "graz";
import { useCallback } from "react";

import { IS_PRO_MODE, IS_TESTNET } from "@/config";

function LoggedOut() {
  const [, setShowAbstraxion] = useModal();
  const { connect: grazConnect } = useConnect();

  const onViewAccount = useCallback(() => {
    if (IS_PRO_MODE) {
      grazConnect({
        chainId: IS_TESTNET ? "xion-testnet-1" : "xion-mainnet-1",
      });
    } else {
      setShowAbstraxion(true);
    }
  }, [grazConnect, setShowAbstraxion]);

  return (
    <div className="w-max">
      <Button fullWidth onClick={onViewAccount} structure="base">
        CONNECT
      </Button>
    </div>
  );
}

export default LoggedOut;
