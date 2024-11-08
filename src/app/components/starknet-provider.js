"use client"; // Add this line at the top

import React, { useEffect } from "react";
import {
  StarknetConfig,
  publicProvider,
  cartridgeProvider,
  voyager,
} from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import Controller from "@cartridge/controller";

// Define your policies
const policies = [
  {
    target: "0x05a7ee0a287951464bcdfaa8c25194714f458106a0af16339723ce0a2ab36fad", // Replace with your contract address
    method: "increase_balance", // Method name in your contract
    description: "Allows increasing the balance", // Description for the user
  }
];

export default function StarknetProvider({ children }) {
  const chains = [mainnet, sepolia];
  const provider = publicProvider();

  useEffect(() => {
    async function setupController() {
      const controller = new Controller(policies);
      await controller.connect();
      // Handle any additional logic, e.g., setting the connected account
    }

    setupController();
  }, []);

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      autoConnect
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}
