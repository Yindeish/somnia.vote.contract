"use client";

import { WalletConnect } from "@/components/wallet-connect";
import { UserProfile } from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useContract } from "@/contexts/contract-context";
import { CONTRACT_ADDRESS, Role, VOTING_CONTRACT_ABI, web3 } from "@/lib/web3";
import { Vote, Users, Shield, ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { injected, useConnect, useAccount, useChainId, useDisconnect, useWriteContract, useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/rtkState/hooks/useRtk";
import { RootState } from "@/rtkState/state";
import { setUserState } from "@/rtkState/slices/user";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { UserCheck, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation";
import { tRole } from "@/rtkState/types/user";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const Header = () => {
    const { isConnected: _, userRole, votes } = useContract();
    const { connect, connectors, status, data, error } = useConnect();
    const { address: userAddress } = useAppSelector((s: RootState) => s.user);
    const dispatch = useAppDispatch();
    const { disconnectAsync } = useDisconnect()
    const { writeContractAsync: handleRegisterAsAdmin, isPending: registeringAsAdmin, data: adminData, error: adminErr } = useWriteContract();
    const { writeContractAsync: handleRegisterAsCandidate, isPending: registeringAsCandidate, data: candidateData, error: candidateErr } = useWriteContract();
    const { writeContractAsync: handleRegisterAsVoter, isPending: registeringAsVoter, data: voterData, error: voterErr } = useWriteContract();
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const user = useAppSelector((s: RootState) => s.user)


    const activeVotes = votes.filter((vote) => vote.active);
    const [selectedRole, setSelectedRole] = useState<string | null>(null)

    const handleRoleSelection = (role: string) => {
        setSelectedRole(role)
        router.push(`/${role}-dashboard`)
    }

    const getVotes = async () => {
        const { data: voteData, error: voteErr, isPending: gettingVotes } = useReadContract({
            ...web3.contractFunction('getCandidates')
        });
        console.log('voteData, voteErr, gettingVotes', voteData, voteErr, gettingVotes)
    };

    const updateUserRole = (role: tRole) => {
        dispatch(setUserState({ key: "role", value: role }));
        handleRoleSelection(role)
    }

    const roleAlreadySelected = (fnToRn: () => {}) => {
        if (user?.role) {
            toast("You have already selected a role before!")
            return;
        } else fnToRn()
    }

    const registerAsAdmin = async () => {
        try {
            await handleRegisterAsAdmin({
                ...web3.contractFunction('registerAsAdmin')
            });
            console.log('registeringAsAdmin, adminData, adminErr', registeringAsAdmin, adminData, adminErr)
            if (adminData) updateUserRole('admin')
        } catch (error: any) {
            console.log('error: ', error)
        }
    };

    const registerAsCandidate = async () => {
        try {
            await handleRegisterAsCandidate({
                ...web3.contractFunction('registerAsCandidate')
            });
            console.log('registeringAsCandidate, CandidateData, CandidateErr', registeringAsCandidate, candidateData, candidateErr)

            if (candidateData) updateUserRole('candidate')
        } catch (error: any) {
            console.log('error: ', error)
        }
    };

    const registerAsVoter = async () => {
        try {
            await handleRegisterAsVoter({
                ...web3.contractFunction('registerAsVoter')
            });
            console.log('registeringAsVoter, VoterData, VoterErr', registeringAsVoter, voterData, voterErr)

            if (voterData) updateUserRole('voter')
        } catch (error: any) {
            console.log('error: ', error)
        }
    };

    const signin = () => {
        dispatch(setUserState({ key: "address", value: address as `0x${string}` }));
    }

    const signout = () => {
        dispatch(setUserState({ key: "address", value: '' }));
    }

    const handleDisconnect = () => {
        disconnectAsync();
        signout();
    }


    return (
        <div className="w-full px-4 py-3 flex justify-end items-center fixed top-0 left-0 z-[1000]">

            {(isConnected && address) ? (
                <div className="w-fit flex items-center gap-3 bg-muted px-4 py-2 rounded-full shadow-sm">
                    <Menubar>
                        <MenubarMenu>
                            <MenubarTrigger>
                                <span className="font-mono text-sm">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </span>
                            </MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem>
                                    <Button className="min-w-full" onClick={() => handleDisconnect()}>Disconnect</Button>
                                </MenubarItem>
                                {/* <MenubarSeparator /> */}
                                {/* <MenubarItem>
                    <Button className="min-w-full" onClick={() => registerAsAdmin()}>Be an admin</Button>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    <Button className="min-w-full" onClick={() => registerAsCandidate()}>Be a candidate</Button>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    <Button className="min-w-full" onClick={() => registerAsVoter()}>Be a voter</Button>
                  </MenubarItem> */}
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                </div>
            ) : (
                <Button onClick={() => connect({ connector: injected() })}>Connect</Button>
            )}

        </div>
    );
}

export default Header;