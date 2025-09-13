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


export default function HomePage() {
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

  useEffect(() => {
    if (address && !userAddress) {
      signin()
    }
    if (!address && userAddress) {
      signout()
    }
  }, [address, userAddress]);

  useEffect(() => { getVotes() }, [])

  if (user?.role === 'admin') return redirect('/admin-dashboard')
  if (user?.role === 'candidate') return redirect('/candidate-dashboard')
  if (user?.role === 'voter') return redirect('/voter-dashboard')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ✅ Header */}
      <div className="w-full px-4 py-3 flex justify-end items-center">

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
      {/* ✅ Header */}

      {/* ✅ Main content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Democratic Voting System</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A secure and transparent platform for creating votes, registering candidates, and casting ballots. Choose
              your role to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Admin Role */}
            <Card
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <UserCheck className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Admin</CardTitle>
                <CardDescription className="text-base">
                  Create and manage voting sessions, end votes, and oversee the entire voting process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled={registeringAsAdmin || registeringAsCandidate || registeringAsVoter} onClick={() => roleAlreadySelected(registerAsAdmin)} className="w-full" size="lg">
                  {registeringAsAdmin ? (<LoaderCircle className="animate-spin text-white" />) : 'Select Admin Role'}
                </Button>
              </CardContent>
            </Card>

            {/* Candidate Role */}
            <Card
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full w-fit">
                  <Users className="h-10 w-10 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Candidate</CardTitle>
                <CardDescription className="text-base">
                  Register to contest in voting sessions and manage your candidacy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled={registeringAsAdmin || registeringAsCandidate || registeringAsVoter} onClick={() => roleAlreadySelected(registerAsCandidate)} variant="secondary" className="w-full" size="lg">
                  {registeringAsCandidate ? (<LoaderCircle className="animate-spin text-white" />) : 'Select Candidate Role'}
                </Button>
              </CardContent>
            </Card>

            {/* Voter Role */}
            <Card
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-accent/10 rounded-full w-fit">
                  <Vote className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="text-2xl">Voter</CardTitle>
                <CardDescription className="text-base">
                  Cast your vote for candidates in active voting sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  disabled={registeringAsAdmin || registeringAsCandidate || registeringAsVoter}
                  onClick={() => roleAlreadySelected(registerAsVoter)}
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                  size="lg"
                >
                  {registeringAsVoter ? (<LoaderCircle className="animate-spin text-white" />) : 'Select Voter Role'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">Secure • Transparent • Democratic</p>
          </div>
        </div>
      </div>
      {/* ✅ Main content */}
    </div>
  );
}
