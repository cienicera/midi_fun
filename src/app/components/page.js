// src/app/page.js

import React from "react";
import StarknetProvider from "../../starknet-provider";  // Adjusted path
import ConnectWallet from "../ConnectWallet";
import SendTransaction from "../SendTransaction";

function App() {
  return (
    <StarknetProvider>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Cartridge Controller Integration</h1>
        <ConnectWallet />
        <SendTransaction amount={1} buttonLabel="Transfer 1 ETH" />
      </div>
    </StarknetProvider>
  );
}

export default App;
