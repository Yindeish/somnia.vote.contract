"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  UserPlus,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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
  [Role.Admin]: "Can create votes, assign roles, and manage the system",
  [Role.Candidate]: "Can contest in votes by paying the contest fee",
  [Role.Voter]: "Can vote for candidates by paying the vote fee",
};

export function RoleManagement() {
  const { userRole, assignRole, loading, error } = useContract();
  const [userAddress, setUserAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>(Role.Voter);
  const [assignmentStatus, setAssignmentStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Only admins can access role management
  if (userRole !== Role.Admin) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
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
              Only administrators can access role management. Your current role:{" "}
              {roleLabels[userRole]}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleAssignRole = async () => {
    if (!userAddress.trim()) {
      setAssignmentStatus("error");
      setStatusMessage("Please enter a valid wallet address");
      return;
    }

    // Basic address validation
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setAssignmentStatus("error");
      setStatusMessage("Please enter a valid Ethereum address");
      return;
    }

    try {
      setAssignmentStatus("idle");
      await assignRole(userAddress, selectedRole);
      setAssignmentStatus("success");
      setStatusMessage(
        `Successfully assigned ${
          roleLabels[selectedRole]
        } role to ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
      );
      setUserAddress("");
    } catch (err) {
      setAssignmentStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to assign role"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Assignment Form */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign User Role
          </CardTitle>
          <CardDescription>
            Assign roles to users to grant them specific permissions in the
            voting system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userAddress">User Wallet Address</Label>
            <Input
              id="userAddress"
              placeholder="0x..."
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole.toString()}
              onValueChange={(value) => setSelectedRole(Number(value) as Role)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.Admin.toString()}>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Admin</Badge>
                    <span className="text-sm text-muted-foreground">
                      Full system access
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value={Role.Candidate.toString()}>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Candidate</Badge>
                    <span className="text-sm text-muted-foreground">
                      Can contest in votes
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value={Role.Voter.toString()}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Voter</Badge>
                    <span className="text-sm text-muted-foreground">
                      Can vote for candidates
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole !== Role.None && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>{roleLabels[selectedRole]}:</strong>{" "}
                {roleDescriptions[selectedRole]}
              </p>
            </div>
          )}

          {assignmentStatus === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {(assignmentStatus === "error" || error) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive">
                {statusMessage || error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleAssignRole}
            disabled={loading || !userAddress.trim()}
            className="w-full"
          >
            {loading ? "Assigning Role..." : "Assign Role"}
          </Button>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Information
          </CardTitle>
          <CardDescription>
            Understanding the different roles in the voting system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(roleDescriptions).map(
              ([roleValue, description]) => {
                const role = Number(roleValue) as Role;
                return (
                  <div
                    key={role}
                    className="flex items-start gap-3 p-3 border rounded-md"
                  >
                    <Badge variant={roleColors[role]} className="mt-0.5">
                      {roleLabels[role]}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{description}</p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
