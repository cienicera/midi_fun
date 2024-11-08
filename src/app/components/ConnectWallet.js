import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector";

export default function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const connector = connectors.find(
    (connector) => connector instanceof ControllerConnector
  );

  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!address || !connector) return;
    connector.username()?.then((name) => setUsername(name));
  }, [address, connector]);

  return (
    <div>
      {address ? (
        <>
          <p>Account: {address}</p>
          {username && <p>Username: {username}</p>}
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={() => connect({ connector })}>Connect</button>
      )}
    </div>
  );
}
