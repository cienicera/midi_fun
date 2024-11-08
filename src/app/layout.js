// src/app/layout.js
import StarknetProvider from "../components/starknet-provider";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <StarknetProvider>
      {/* Rest of your layout here */}
      {children}
    </StarknetProvider>
  );
}
