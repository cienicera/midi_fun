import React, { useState } from "react";
import { Button, Box, Spinner, Text } from "@chakra-ui/react";
import { useAccountContext } from "../../starknet-provider";

const ETH_CONTRACT = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export default function SendTransaction({ amount, buttonLabel }) {
  const starknetAccount = useAccountContext();
  const [transactionHash, setTransactionHash] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const executeTransaction = async () => {
    if (!starknetAccount) {
      setError("No account connected. Please connect your wallet.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await starknetAccount.execute([
        {
          contractAddress: ETH_CONTRACT,
          entrypoint: "approve",
          calldata: [starknetAccount.address, amount.toString(), "0x0"],
        },
        {
          contractAddress: ETH_CONTRACT,
          entrypoint: "transfer",
          calldata: [starknetAccount.address, amount.toString(), "0x0"],
        },
      ]);

      setTransactionHash(response.transaction_hash);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError("Transaction failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={executeTransaction} disabled={isSubmitting}>
        {buttonLabel || `Transfer ${amount} ETH`}
      </Button>
      {error && <Text color="red">{error}</Text>}
      {isSubmitting ? (
        <Spinner />
      ) : (
        transactionHash && (
          <Box>
            <Text>Transaction Hash: {transactionHash}</Text>
          </Box>
        )
      )}
    </>
  );
}
