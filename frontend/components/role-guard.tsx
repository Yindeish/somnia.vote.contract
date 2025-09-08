"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle } from "lucide-react";
import { useContract } from "@/contexts/contract-context";
import { Role } from "@/lib/web3";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}

const roleLabels = {
  [Role.None]: "No Role",
  [Role.Admin]: "Admin",
  [Role.Candidate]: "Candidate",
  [Role.Voter]: "Voter",
};

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
}: RoleGuardProps) {
  const { userRole, isConnected } = useContract();

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            Wallet Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your role ({roleLabels[userRole]}) does not have permission to
              access this feature. Required roles:{" "}
              {allowedRoles.map((role) => roleLabels[role]).join(", ")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
