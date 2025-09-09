import ContextProvider from "@/context";
import { ContractProvider } from "@/contexts/contract-context";
import { headers } from "next/headers";
import { ReactNode } from "react";

const Providers = async ({ children }: { children: ReactNode }) => {
    const headersObj = await headers();
    const cookies = headersObj.get('cookie')

    return (
        <ContextProvider cookies={cookies}>
            <ContractProvider>
                {children}
            </ContractProvider>
        </ContextProvider>
    )
}

export default Providers;