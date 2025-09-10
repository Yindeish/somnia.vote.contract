// lib/somniaChain.ts
import type { Chain } from "wagmi";

export const somniaTestnet: Chain = {
  id: 50312,
  name: "Somnia Shannon Testnet",
  network: "somnia-shannon",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network/"] },
    public: { http: ["https://dream-rpc.somnia.network/"] }
  },
  blockExplorers: {
    default: { name: "Somnia Shannon Explorer", url: "https://shannon-explorer.somnia.network/" }
  },
  testnet: true
};
