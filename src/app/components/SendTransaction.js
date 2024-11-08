import React, { useState } from 'react';
import { useAccount } from '@starknet-react/core';
import { Button, Center, Box, Spinner, Text } from '@chakra-ui/react';

function SendTransaction({ amount, contractAddress, abi, buttonLabel }) {
  const { account: starknetAccount } = useAccount(); // Get the connected account
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionResult, setTransactionResult] = useState(undefined);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

  // const sendTransaction = async () => {
  //   if (starknetAccount) {
  //     try {
  //       // Make sure the contract instance and policies are in place
  //       const response = await starknetAccount.execute({
  //         contractAddress,
  //         entrypoint: "increase_balance", // Ensure this matches your method in the policy
  //         calldata: [amount.toString()], // Pass the amount as calldata
  //       });

  //       setTransactionHash(response.transaction_hash);
  //       setTransactionResult(undefined); // Show spinner while polling
  //       setIsPolling(true); // Start polling transaction status

  //       // Poll the transaction status (you can use your existing pollTransactionStatus function)
  //     } catch (err) {
  //       console.error('Transaction failed:', err);
  //       setError('Transaction failed. Please try again.');
  //     }
  //   } else {
  //     setError('No account connected. Please connect your wallet.');
  //   }
  // };

  const sendTransaction = async () => {
    if (starknetAccount) {
      try {
        // Make sure the contract instance and policies are in place
        const response = await starknetAccount.execute({
          contractAddress,
          entrypoint: "increase_balance", // Ensure this matches your method in the policy
          calldata: [amount.toString()], // Pass the amount as calldata
        });

        setTransactionHash(response.transaction_hash);
        setTransactionResult(undefined); // Show spinner while polling
        setIsPolling(true); // Start polling transaction status

        // Poll the transaction status (you can use your existing pollTransactionStatus function)
      } catch (err) {
        console.error('Transaction failed:', err);
        setError('Transaction failed. Please try again.');
      }
    } else {
      setError('No account connected. Please connect your wallet.');
    }
  };

  return (
    <>
      <Button onClick={sendTransaction}>
        {buttonLabel || `Increase Balance by ${amount}`}
      </Button>
      {error && <Text color="red">{error}</Text>}
      {transactionResult === undefined && isPolling ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        transactionHash && (
          <Box>
            <Text>Transaction Hash: {transactionHash}</Text>
            <Text>Status: {transactionResult?.status || 'Pending'}</Text>
          </Box>
        )
      )}
    </>
  );
}

export default SendTransaction;
