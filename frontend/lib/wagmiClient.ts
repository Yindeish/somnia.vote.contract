// lib/wagmiClient.ts
import { createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { somniaTestnet } from "./somniaChain";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [somniaTestnet], // ONLY somniaTestnet allowed
  [publicProvider()] // publicProvider will use the configured RPC above
);

// createConfig enforces only configured chains
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }) // MetaMask only (you can add other connectors but they must reference `chains`)
  ],
  publicClient,
  webSocketPublicClient
});
