"use client";

import { Button } from "@burnt-labs/ui";
import { useCallback } from "react";

import { useChainAccount } from "../hooks/useChainAccount";

function LoggedOut() {
  const { login } = useChainAccount();

  const onViewAccount = useCallback(() => {
    login();
  }, [login]);

  return (
    <div className="w-max">
      <Button fullWidth onClick={onViewAccount} structure="base">
        CONNECT
      </Button>
    </div>
  );
}

export default LoggedOut;
