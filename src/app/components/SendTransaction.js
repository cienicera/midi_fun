import React, { useCallback, useState } from "react";
import { useAccount, useExplorer } from "@starknet-react/core";
import {
  Button,
  Center,
  Box,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";

function SendTransaction({ amount, contractAddress, abi, buttonLabel }) {
  const { account: starknetAccount } = useAccount();
  const [transactionHash, setTransactionHash] = useState("");
  const explorer = useExplorer();
  const [transactionResult, setTransactionResult] = useState(undefined);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const toHex = (value) => {
    return `0x${Number(value).toString(16)}`;
  };

  const showToast = useCallback(
    (title, description, status) => {
      toast({
        title,
        description,
        status,
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "solid",
      });
    },
    [toast]
  );

  const sendTransaction = useCallback(
    async (amount) => {
      if (!starknetAccount) {
        setError("No account connected. Please connect your wallet.");
        showToast(
          "Error",
          "No account connected. Please connect your wallet.",
          "error"
        );
        return;
      }

      try {
        setIsPolling(true);
        const hexAmount = toHex(amount);

        const { transaction_hash } = await starknetAccount.execute({
          contractAddress,
          entrypoint: "increase_balance",
          calldata: [hexAmount],
        });

        setTransactionHash(transaction_hash);
        setTransactionResult({ status: "Success" });
        setIsPolling(false);

        const truncatedHash = `${transaction_hash.slice(
          0,
          6
        )}...${transaction_hash.slice(-4)}`;
        showToast(
          "Transaction Submitted",
          `Transaction Hash: ${truncatedHash}`,
          "success"
        );
      } catch (err) {
        console.error("Transaction failed:", err || undefined);
        setError("Transaction failed. Please try again.");
        setIsPolling(false);

        showToast(
          "Transaction Failed",
          err.message ||
            "An error occurred during the transaction. Please try again.",
          "error"
        );
      }
    },
    [starknetAccount, contractAddress, showToast]
  );

  return (
    <VStack
      spacing={4}
      align="stretch"
      bg="rgba(255, 255, 255, 0.05)"
      borderRadius="lg"
      border="1px solid rgba(255, 255, 255, 0.1)"
      p={4}
      transition="all 0.3s ease"
      _hover={{
        borderColor: "rgba(255, 255, 255, 0.2)",
        bg: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <Button
        onClick={() => sendTransaction(amount)}
        variant="outline"
        size="lg"
        isLoading={isPolling}
        loadingText="Submitting"
        borderColor="rgba(255, 255, 255, 0.2)"
        color="white"
        _hover={{
          bg: "rgba(255, 255, 255, 0.1)",
        }}
      >
        {buttonLabel || `Increase Balance by ${amount}`}
      </Button>

      {error && (
        <Text color="red.400" fontSize="sm">
          {error}
        </Text>
      )}

      {transactionHash && (
        <Box
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          bg="whiteAlpha.100"
        >
          <Text fontSize="sm" color="blue.300" _hover={{ color: "blue.200" }}>
            <a
              href={explorer.transaction(transactionHash)}
              target="_blank"
              rel="noreferrer"
            >
              view transaction
            </a>
          </Text>
          <Text fontSize="sm" mt={2} color="whiteAlpha.900">
            Status: {transactionResult?.status || "Pending"}
          </Text>
        </Box>
      )}

      {isPolling && !transactionResult && (
        <Center p={4}>
          <Spinner size="sm" color="white" mr={2} />
          <Text fontSize="sm" color="whiteAlpha.900">
            Processing transaction...
          </Text>
        </Center>
      )}
    </VStack>
  );
}

export default SendTransaction;
