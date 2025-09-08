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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Plus,
  Vote,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  StopCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useContract } from "@/contexts/contract-context";
import { usePayment } from "@/hooks/use-payment"; // Added payment hook
import { Role, FEES } from "@/lib/web3";
import { RoleGuard } from "@/components/role-guard";
import { PaymentStatus } from "@/components/payment-status"; // Added payment status component
import { GasEstimator } from "@/components/gas-estimator"; // Added gas estimator component

export function AdminDashboard() {
  const { votes, createVote, endVote, loading, error, account } = useContract();
  const { withdrawFunds, contractBalance } = usePayment(); // Added payment functionality
  const [newVoteTitle, setNewVoteTitle] = useState("");
  const [createStatus, setCreateStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Calculate statistics
  const activeVotes = votes.filter((vote) => vote.active);
  const completedVotes = votes.filter((vote) => !vote.active);
  const totalCandidates = votes.reduce(
    (sum, vote) => sum + (vote.candidates?.length || 0),
    0
  );
  const totalVotesCast = votes.reduce(
    (sum, vote) =>
      sum +
      (vote.candidates?.reduce(
        (candidateSum, candidate) => candidateSum + Number(candidate.voteCount),
        0
      ) || 0),
    0
  );

  const handleCreateVote = async () => {
    if (!newVoteTitle.trim()) {
      setCreateStatus("error");
      setStatusMessage("Please enter a vote title");
      return;
    }

    try {
      setCreateStatus("idle");
      await createVote(newVoteTitle);
      setCreateStatus("success");
      setStatusMessage(`Successfully created vote: "${newVoteTitle}"`);
      setNewVoteTitle("");
    } catch (err) {
      setCreateStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to create vote"
      );
    }
  };

  const handleEndVote = async (voteId: number, title: string) => {
    try {
      await endVote(voteId);
      setCreateStatus("success");
      setStatusMessage(`Successfully ended vote: "${title}"`);
    } catch (err) {
      setCreateStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to end vote"
      );
    }
  };

  const handleWithdraw = async () => {
    try {
      setCreateStatus("idle");
      await withdrawFunds();
      setCreateStatus("success");
      setStatusMessage("Successfully withdrew contract funds");
    } catch (err) {
      setCreateStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to withdraw funds"
      );
    }
  };

  return (
    <RoleGuard allowedRoles={[Role.Admin]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage votes, monitor system activity, and oversee the voting
            process
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Votes
              </CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVotes.length}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Candidates
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCandidates}</div>
              <p className="text-xs text-muted-foreground">Across all votes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotesCast}</div>
              <p className="text-xs text-muted-foreground">
                Total participation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  votes.length * Number.parseFloat(FEES.CREATE_VOTE) +
                  totalCandidates * Number.parseFloat(FEES.CONTEST) +
                  totalVotesCast * Number.parseFloat(FEES.VOTE)
                ).toFixed(2)}{" "}
                ETH
              </div>
              <p className="text-xs text-muted-foreground">Total collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            {" "}
            {/* Updated grid to 4 columns */}
            <TabsTrigger value="create">Create Vote</TabsTrigger>
            <TabsTrigger value="manage">Manage Votes</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>{" "}
            {/* Added payments tab */}
          </TabsList>

          {/* Create Vote Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Vote
                </CardTitle>
                <CardDescription>
                  Create a new voting session. Cost: {FEES.CREATE_VOTE} ETH
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voteTitle">Vote Title</Label>
                  <Input
                    id="voteTitle"
                    placeholder="Enter vote title (e.g., 'Presidential Election 2024')"
                    value={newVoteTitle}
                    onChange={(e) => setNewVoteTitle(e.target.value)}
                  />
                </div>

                {newVoteTitle.trim() && (
                  <GasEstimator
                    action="createVote"
                    params={{ title: newVoteTitle }}
                  />
                )}

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Creating a vote requires a payment of{" "}
                    {FEES.CREATE_VOTE} ETH. Once created, candidates can contest
                    by paying {FEES.CONTEST} ETH, and voters can participate by
                    paying {FEES.VOTE} ETH.
                  </p>
                </div>

                {createStatus === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-600">
                      {statusMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {(createStatus === "error" || error) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">
                      {statusMessage || error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleCreateVote}
                  disabled={loading || !newVoteTitle.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading
                    ? "Creating Vote..."
                    : `Create Vote (${FEES.CREATE_VOTE} ETH)`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Votes Tab */}
          <TabsContent value="manage" className="space-y-4">
            <div className="grid gap-4">
              {votes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No votes created yet. Create your first vote to get
                      started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                votes.map((vote) => (
                  <Card key={vote.id.toString()}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <span>#{vote.id.toString()}</span>
                          <span>{vote.title}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={vote.active ? "default" : "secondary"}
                          >
                            {vote.active ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <StopCircle className="h-3 w-3 mr-1" />
                                Ended
                              </>
                            )}
                          </Badge>
                          {vote.active && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleEndVote(Number(vote.id), vote.title)
                              }
                              disabled={loading}
                            >
                              End Vote
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Candidates
                          </p>
                          <p className="text-2xl font-bold">
                            {vote.candidates?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Votes
                          </p>
                          <p className="text-2xl font-bold">
                            {vote.candidates?.reduce(
                              (sum, candidate) =>
                                sum + Number(candidate.voteCount),
                              0
                            ) || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Leading Candidate
                          </p>
                          <p className="font-semibold">
                            {vote.candidates && vote.candidates.length > 0
                              ? vote.candidates.reduce((prev, current) =>
                                  Number(current.voteCount) >
                                  Number(prev.voteCount)
                                    ? current
                                    : prev
                                ).name
                              : "No candidates yet"}
                          </p>
                        </div>
                      </div>

                      {vote.candidates && vote.candidates.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            Candidates:
                          </p>
                          <div className="space-y-2">
                            {vote.candidates.map((candidate, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-muted rounded"
                              >
                                <span className="font-medium">
                                  {candidate.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {candidate.candidateAddress.slice(0, 6)}...
                                    {candidate.candidateAddress.slice(-4)}
                                  </span>
                                  <Badge variant="outline">
                                    {candidate.voteCount.toString()} votes
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    System Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Votes Created
                        </p>
                        <p className="text-3xl font-bold">{votes.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Votes
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {activeVotes.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Completed Votes
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {completedVotes.length}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Candidates
                        </p>
                        <p className="text-3xl font-bold">{totalCandidates}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Votes Cast
                        </p>
                        <p className="text-3xl font-bold">{totalVotesCast}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Platform Revenue
                        </p>
                        <p className="text-3xl font-bold">
                          {(
                            votes.length * Number.parseFloat(FEES.CREATE_VOTE) +
                            totalCandidates * Number.parseFloat(FEES.CONTEST) +
                            totalVotesCast * Number.parseFloat(FEES.VOTE)
                          ).toFixed(2)}{" "}
                          ETH
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fee Structure</CardTitle>
                  <CardDescription>
                    Current platform fees for different actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Create Vote</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {FEES.CREATE_VOTE} ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        For administrators
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Contest Vote</span>
                      </div>
                      <p className="text-2xl font-bold">{FEES.CONTEST} ETH</p>
                      <p className="text-sm text-muted-foreground">
                        For candidates
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Vote className="h-4 w-4" />
                        <span className="font-medium">Cast Vote</span>
                      </div>
                      <p className="text-2xl font-bold">{FEES.VOTE} ETH</p>
                      <p className="text-sm text-muted-foreground">
                        For voters
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid gap-4">
              <PaymentStatus />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Contract Management
                  </CardTitle>
                  <CardDescription>
                    Manage contract funds and withdrawals. Current balance:{" "}
                    {Number.parseFloat(contractBalance).toFixed(4)} ETH
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Withdraw Funds</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Withdraw all accumulated fees from the contract to the
                      owner's wallet.
                    </p>
                    <Button
                      onClick={handleWithdraw}
                      disabled={
                        loading || Number.parseFloat(contractBalance) === 0
                      }
                      variant="destructive"
                    >
                      {loading ? "Withdrawing..." : "Withdraw All Funds"}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Fee Structure</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {FEES.CREATE_VOTE} ETH
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Create Vote
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{FEES.CONTEST} ETH</p>
                        <p className="text-sm text-muted-foreground">
                          Contest Vote
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{FEES.VOTE} ETH</p>
                        <p className="text-sm text-muted-foreground">
                          Cast Vote
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
