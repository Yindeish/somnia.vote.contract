import { useAppSelector } from "@/rtkState/hooks/useRtk";
import { RootState } from "@/rtkState/state";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const Authenticated = ({ children }: { children: ReactNode }) => {
    const { address } = useAppSelector((s: RootState) => s.user);

    if (!address) {
        return redirect('/')
    }
    else return (
        <>
            {children}
        </>
    )
}

export default Authenticated;