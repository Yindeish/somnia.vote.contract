"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Wallet, RefreshCw } from "lucide-react";
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

const roleDescriptions = {
  [Role.None]: "No permissions assigned",
  [Role.Admin]: "Full system access - can create votes and assign roles",
  [Role.Candidate]: "Can contest in votes by paying 0.35 ETH",
  [Role.Voter]: "Can vote for candidates by paying 0.25 ETH",
};

export function UserProfile() {
  const { account, userRole, isConnected, loading, loadVotes } = useContract();

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Wallet Address
            </span>
          </div>
          <div className="font-mono text-sm bg-muted p-2 rounded break-all">
            {account}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Role</span>
            <Badge variant={roleColors[userRole]}>{roleLabels[userRole]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {roleDescriptions[userRole]}
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadVotes}
            disabled={loading}
            className="w-full bg-transparent"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
