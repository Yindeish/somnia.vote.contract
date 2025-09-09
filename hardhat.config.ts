import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    somniaTestnet: {
      chainId: 50312,
      accounts: ['e007fff1713c1a78c06e23bd6797dac238b5fc44f5da2a6bd79051aaed936b24'],
      url: 'https://dream-rpc.somnia.network'
    }
  }
};

export default config;
