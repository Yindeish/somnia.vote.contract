'use client'

import { ContractProvider } from "@/contexts/contract-context";
import { config } from "@/wagmi/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import state, { persistor } from "@/rtkState/state";
import { Toaster } from "@/components/ui/sonner"

const Providers = ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient()

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <Provider store={state}>
                    <PersistGate loading={null} persistor={persistor}>
                        <ContractProvider>
                            <Toaster />
                            {children}
                        </ContractProvider>
                    </PersistGate>
                </Provider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default Providers;