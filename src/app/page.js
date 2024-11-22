"use client";
import { Box, Grid, useBreakpointValue, Slider, SliderTrack, SliderFilledTrack, SliderThumb, VStack, Text } from "@chakra-ui/react";
import styles from "./page.module.css";
import SendTransaction from "./components/SendTransaction";
import { contractAbi } from "./contracts/contractAbi";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import connector from "./components/connector";

const contractAddress = "0x05a7ee0a287951464bcdfaa8c25194714f458106a0af16339723ce0a2ab36fad";
const sepoliaAddress = "0x07d08c25f35091012463841369755f0547bc3f3d9fb72df0112ae6461ef75073";

function Home() {
  const [controller, setController] = useState(null);
  const [account, setAccount] = useState(null);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const [username, setUsername] = useState(" ");

  // tempo in beats per minute
  const [tempo, setTempo] = useState(120);
  // note duration in seconds
  const [noteDuration, setNoteDuration] = useState(0.5);
  // transpose in semitones
  const [transpose, setTranspose] = useState(0);

  const gridColumns = useBreakpointValue({
    base: "repeat(2, 1fr)",
    sm: "repeat(2, 1fr)", 
    md: "repeat(3, 1fr)", 
    lg: "repeat(3, 1fr)"
  });

  const gridGap = useBreakpointValue({
    base: 4,
    sm: 6, 
    md: 12, 
    lg: 24 
  });

  const gridPadding = useBreakpointValue({
    base: 4, 
    sm: 6,
    md: 10,
    lg: 14 
  });

  useEffect(() => {
    if (!address) return;
    connector.username()?.then((n) => setUsername(n));
  }, [address]);

  useEffect(() => {
    const initController = async () => {
      const connectedAccount = await connector.connect();
      setController(connector);
      setAccount(connectedAccount);
    };
    initController();
  }, []);


  return (
    <main className={styles.main}>
      <Box 
        className={styles.description}
        px={4}
        w="full" 
        maxW="100vw" 
      >
        <Box className={styles.logoContainer}>
          <span>Autonomous Audio</span>
        </Box>

        <Box 
          display="flex"
          flexDir={{ base: "column", sm: "row" }}
          alignItems="center"
          gap={2}
        >
          {address && (
            <>
              <Box 
                fontSize={{ base: "sm", md: "md" }}
                textAlign="center"
                marginRight="2rem"
              >
                {/* <p>Account: {address.slice(0, 5)}...{address.slice(-4)} </p> */}
                {username && <p>{username}</p>}
              </Box>
            </>
          )}

          <button
            className={styles.connectbtn}
            onClick={() => {
              address ? disconnect() : connect({ connector });
            }}
          >
            {address ? "Disconnect" : "Connect"}
          </button>
        </Box>
      </Box>

      <Box
        className={styles.slidersContainer}
        bg="gray.100"
        color="black"
        borderWidth="1px"
        borderRadius="md"
        m={4}
        pb='6px'
        pr='3px'
        maxW="100vw"
      >
        <Grid 
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
          gap={4}
          p={4}
          bg="gray.300"
          borderRadius="md"
        >
          <VStack align="stretch">
            <Text>Tempo: {tempo}</Text>
            <Slider
              min={60}
              max={200}
              value={tempo}
              onChange={(value) => setTempo(value)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </VStack>

          <VStack align="stretch">
            <Text>Note Duration: {noteDuration.toFixed(2)}</Text>
            <Slider
              min={0.1}
              max={2}
              step={0.1}
              value={noteDuration}
              onChange={(value) => setNoteDuration(value)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </VStack>

          <VStack align="stretch">
            <Text>Transpose: {transpose}</Text>
            <Slider
              min={-12}
              max={12}
              value={transpose}
              onChange={(value) => setTranspose(value)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </VStack>
        </Grid>
      </Box>

      <Box
        className={styles.buttonsContainer}
        bg="gray.100"
        color="black"
        borderWidth="1px"
        borderRadius="md"
        paddingBottom="6px"
        mx={4}
        maxW="100vw" 
        overflow="hidden" 
      >
        <Grid
          templateColumns={gridColumns}
          gap={gridGap}
          mt={0}
          p={gridPadding}
          bg="gray.300"
          borderRadius="md"
        >
          <SendTransaction
            amount={1}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Sparkle"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={2}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Accelerandos"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={3}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Crackle"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={4}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Melody"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={5}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Boom"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={6}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Drone"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={7}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Chords"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={8}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Percussive"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
          <SendTransaction
            amount={9}
            contractAddress={sepoliaAddress}
            abi={contractAbi}
            buttonLabel="Change Chords"
            tempo={tempo}
            noteDuration={noteDuration}
            transpose={transpose}
          />
        </Grid>
      </Box>
    </main>
  );
}

export default Home;