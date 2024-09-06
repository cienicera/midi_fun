import React, { useState, useEffect } from 'react';
import { useAccount } from '@starknet-react/core';
import { Contract } from 'starknet';
import { Button, Center, Box, Spinner, Text } from '@chakra-ui/react';

function SendTransaction({ amount, contractAddress, abi, buttonLabel }) {
  const { address: account, account: starknetAccount } = useAccount(); // Get the connected account

  const [transactionHash, setTransactionHash] = useState('');
  const [transactionResult, setTransactionResult] = useState(undefined);
  const [isPolling, setIsPolling] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [error, setError] = useState(null); // Track errors

  // Create contract instance with the connected account
  const contract = starknetAccount ? new Contract(abi, contractAddress, starknetAccount) : null;
  console.log('Contract:', contract);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup polling interval on component unmount
    };
  }, [intervalId]);

  const pollTransactionStatus = async (txHash) => {
    const newIntervalId = setInterval(async () => {
      try {
        const result = await starknetAccount.provider.waitForTransaction(txHash); // Wait for the transaction result
        console.log('Transaction status updated:', result);
        setTransactionResult(result);

        if (
          result?.finality_status === 'ACCEPTED_ON_L2' ||
          result?.execution_status === 'SUCCEEDED'
        ) {
          clearInterval(newIntervalId);
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Error while polling transaction status:', error);
      }
    }, 5000);
    setIntervalId(newIntervalId); // Set the interval ID for cleanup
  };

  const sendTransaction = async () => {
    if (starknetAccount) {
      console.log('Wallet is connected:', starknetAccount);
  
      try {
        // Ensure the 'increase_balance' method exists in the contract ABI
        if (!contract.functions || !contract.functions.increase_balance) {
          throw new Error('increase_balance method not found in contract ABI');
        }
  
        console.log('Sending amount as string:', amount.toString());
  
        // Wrap contract invocation in a try-catch to handle both user rejection and any StarkNet errors
        try {
          const response = await contract.functions.increase_balance(amount.toString()).invoke({
            maxFee: '1000000000000000', // Set a maximum fee
          });
  
          console.log('Response from increase_balance:', response);
  
          if (response.transaction_hash) {
            console.log('Transaction Hash:', response.transaction_hash);
            setTransactionHash(response.transaction_hash);
            setTransactionResult(undefined); // Show spinner
            setIsPolling(true); // Start polling the transaction status
            pollTransactionStatus(response.transaction_hash);
          }
        } catch (innerError) {
          // Check for user abort error specifically
          if (innerError.message.toLowerCase().includes('user abort') || innerError.message.toLowerCase().includes('user rejected')) {
            console.log('Transaction rejected by user.');
            setError('Transaction rejected by user.');
          } else {
            // Handle all other errors
            console.error('Transaction failed:', innerError);
           // setError('Transaction failed. Please check your wallet and contract interaction.');
          }
        }
      } catch (error) {
        console.error('Unexpected error in sendTransaction:', error);
        setError('Unexpected error. Please try again.');
      }
    } else {
      console.log('No account connected');
      setError('No account connected. Please connect your wallet.');
    }
  };
  

  return (
    <>
      <Button onClick={sendTransaction}>
        {buttonLabel || `Increase Balance by ${amount}`} {/* Use the passed label or fallback to default */}
      </Button>
      {error && <Text color="red">{error}</Text>} {/* Display error */}
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
