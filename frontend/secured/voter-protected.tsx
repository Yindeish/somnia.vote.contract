import { useAppSelector } from "@/rtkState/hooks/useRtk";
import { RootState } from "@/rtkState/state";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const VoterProtected = ({ children }: { children: ReactNode }) => {
    const { role } = useAppSelector((s: RootState) => s.user);

    if (role !== 'voter') {
        return redirect('/')
    }
    else return (
        <>
            {children}
        </>
    )
}

export default VoterProtected;