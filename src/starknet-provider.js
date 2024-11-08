"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { StarknetConfig, useAccount } from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import ControllerConnector from "@cartridge/connector";

// Create context to manage the account state
const AccountContext = createContext(null);

export function useAccountContext() {
  return useContext(AccountContext);
}

export default function StarknetProvider({ children }) {
  const [starknetAccount, setStarknetAccount] = useState(null);
  const connector = new ControllerConnector({
    policies: [
      {
        target: "0x07d08c25f35091012463841369755f0547bc3f3d9fb72df0112ae6461ef75073",
        method: "increase_balance",
        description: "Allows increasing the balance",
      },
    ],
    rpc: "https://api.cartridge.gg/x/starknet/sepolia",
  });

  useEffect(() => {
    async function connectController() {
      try {
        const account = await connector.connect();
        setStarknetAccount(account);
      } catch (error) {
        console.error("Failed to connect to the Cartridge controller:", error);
      }
    }

    connectController();
  }, []);

  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={[connector]}
    >
      <AccountContext.Provider value={starknetAccount}>
        {children}
      </AccountContext.Provider>
    </StarknetConfig>
  );
}
