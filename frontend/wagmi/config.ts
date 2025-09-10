import { createConfig, http } from 'wagmi'
import { somniaTestnet } from 'wagmi/chains'

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const config = createConfig({
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(),
  },
})