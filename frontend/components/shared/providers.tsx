'use client'

import { ContractProvider } from "@/contexts/contract-context";
import { config } from "@/wagmi/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";

const Providers = async ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient()

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ContractProvider>
                    {children}
                </ContractProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default Providers;