"use client";
import { Box, Grid, Button } from '@chakra-ui/react';
import styles from "./page.module.css";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import SendTransaction from './components/SendTransaction'; 

const contractAddress = '0x05a7ee0a287951464bcdfaa8c25194714f458106a0af16339723ce0a2ab36fad';

const contractAbi = [
  {
    "name": "HelloStarknetImpl",
    "type": "impl",
    "interface_name": "hello_cairo::IHelloStarknet"
  },
  {
    "name": "hello_cairo::IHelloStarknet",
    "type": "interface",
    "items": [
      {
        "name": "increase_balance",
        "type": "function",
        "inputs": [
          {
            "name": "amount",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_balance",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "hello_cairo::HelloStarknet::AudioParams",
    "type": "event",
    "members": [
      {
        "kind": "key",
        "name": "synthid",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "value",
        "type": "core::felt252"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "hello_cairo::HelloStarknet::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "AudioParams",
        "type": "hello_cairo::HelloStarknet::AudioParams"
      }
    ]
  }
];

function Home() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  const connectWallet = async () => {
    const { starknetkitConnectModal } = useStarknetkitConnectModal({
      connectors: connectors,
    });

    const { connector } = await starknetkitConnectModal();
    await connect({ connector });
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div className={styles.logoContainer}>
          
          <span>Autonomous Audio</span>
        </div>
        {isConnected ? (
          <button className={styles.connectbtn} onDoubleClick={disconnect}>
            {address.slice(0, 5)}...{address.slice(60, 66)}
          </button>
        ) : (
          <button onClick={connectWallet} className={styles.connectbtn}>
            Connect
          </button>
        )}
      </div>

      <div className={styles.center}>
        
      </div>

      {/* Buttons Grid Section */}
      <Box bg="gray.100" color="black" borderWidth="1px" borderRadius="md" paddingBottom="3px">
        <Grid templateColumns="repeat(3, 1fr)" 
  gap={4} 
  mt={4} 
  p={4} 
  bg="gray.300" 
  borderRadius="md">
          <Box className={styles.card}>
            <SendTransaction amount={1} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={2} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={3} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={4} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={5} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={6} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={7} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={8} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
          <Box className={styles.card}>
            <SendTransaction amount={9} contractAddress={contractAddress} abi={contractAbi} />
          </Box>
        </Grid>
      </Box>
    </main>
  );
}

export default Home;
