"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import StarknetProvider from "./components/starknet-provider";
import { ChakraProvider } from '@chakra-ui/react'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
        <StarknetProvider>
          {children}
        </StarknetProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
