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
import { Role } from "@/lib/web3";
import { Vote, Users, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppKitConnectButton } from "@reown/appkit/react";
import { injected, useConnect } from "wagmi";

export default function HomePage() {
  const { isConnected, userRole, votes } = useContract();
  const { connect, connectors, status } = useConnect()

  console.log('connectors, status', connectors, status)

  const activeVotes = votes.filter((vote) => vote.active);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">
            Blockchain Voting System
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            A secure, transparent, and decentralized voting platform powered by
            Ethereum
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {!isConnected ? (
            <div
              onClick={() => connect({connector: injected()})}
              className="w-[200px] h-[50px] bg-teal-500 rounded-full flex items-center justify-center text-center">
              Connect
            </div>) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <UserProfile />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="h-5 w-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Active Votes
                      </span>
                      <span className="font-semibold">
                        {activeVotes.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Votes
                      </span>
                      <span className="font-semibold">{votes.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Your Role
                      </span>
                      <span className="font-semibold">
                        {userRole === Role.None
                          ? "No Role"
                          : userRole === Role.Admin
                            ? "Admin"
                            : userRole === Role.Candidate
                              ? "Candidate"
                              : "Voter"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Role-based Navigation */}
              <div className="grid gap-4">
                {userRole === Role.Admin && (
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <Shield className="h-5 w-5" />
                        Administrator Access
                      </CardTitle>
                      <CardDescription>
                        You have full administrative privileges. Manage votes,
                        assign roles, and oversee the system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/admin">
                        <Button className="w-full" size="lg">
                          Open Admin Panel
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {userRole === Role.Candidate && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Candidate Access
                      </CardTitle>
                      <CardDescription>
                        Contest in active votes by paying the contest fee. Build
                        your campaign and engage with voters.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/candidate">
                        <Button className="w-full" size="lg">
                          View Candidate Dashboard
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {userRole === Role.Voter && (
                  <Card className="border-secondary/20 bg-secondary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Vote className="h-5 w-5" />
                        Voter Access
                      </CardTitle>
                      <CardDescription>
                        Participate in active votes by casting your ballot. Your
                        voice matters in the democratic process.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/vote">
                        <Button className="w-full" size="lg">
                          Cast Your Vote
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {userRole === Role.None && (
                  <Card className="border-muted">
                    <CardHeader>
                      <CardTitle>No Role Assigned</CardTitle>
                      <CardDescription>
                        Contact an administrator to get a role assigned. You
                        need a role to participate in the voting system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Available roles: Admin (full access), Candidate (can
                        contest), Voter (can vote)
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
