"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle } from "lucide-react";
import { useContract } from "@/contexts/contract-context";
import { Role } from "@/lib/web3";

const roleLabels = {
  [Role.None]: "No Role",
  [Role.Admin]: "Admin",
  [Role.Candidate]: "Candidate",
  [Role.Voter]: "Voter",
};

const roleColors = {
  [Role.None]: "secondary",
  [Role.Admin]: "destructive",
  [Role.Candidate]: "default",
  [Role.Voter]: "secondary",
} as const;

export function WalletConnect() {
  const { account, userRole, isConnected, loading, error, connectWallet } =
    useContract();

  console.log("isss", isConnected, userRole);

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to access the voting system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <Button
            onClick={connectWallet}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Connecting..." : "Connect MetaMask"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </span>
          <Badge variant={roleColors[userRole]}>{roleLabels[userRole]}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Account</div>
          <div className="font-mono text-sm bg-muted p-2 rounded">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
