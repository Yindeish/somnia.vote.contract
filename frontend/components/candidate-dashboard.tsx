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
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Trophy,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Vote,
  Target,
  Award,
} from "lucide-react";
import { useContract } from "@/contexts/contract-context";
import { Role, FEES } from "@/lib/web3";
import { RoleGuard } from "@/components/role-guard";
import { GasEstimator } from "@/components/gas-estimator";

export function CandidateDashboard() {
  const { votes, contestVote, loading, error, account } = useContract();
  const [candidateName, setCandidateName] = useState("");
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);
  const [contestStatus, setContestStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Filter votes where user can contest (active votes)
  const availableVotes = votes.filter((vote) => vote.active);

  // Find votes where the current user is already a candidate
  const myCandidacies = votes
    .map((vote) => ({
      ...vote,
      myCandidate: vote.candidates?.find(
        (candidate) =>
          candidate.candidateAddress.toLowerCase() === account?.toLowerCase()
      ),
    }))
    .filter((vote) => vote.myCandidate);

  // Calculate statistics
  const totalVotesReceived = myCandidacies.reduce(
    (sum, vote) => sum + Number(vote.myCandidate?.voteCount || 0),
    0
  );

  const activeContests = myCandidacies.filter((vote) => vote.active).length;
  const completedContests = myCandidacies.filter((vote) => !vote.active).length;

  // Calculate win rate
  const wins = myCandidacies.filter((vote) => {
    if (!vote.active && vote.candidates && vote.candidates.length > 0) {
      const winner = vote.candidates.reduce((prev, current) =>
        Number(current.voteCount) > Number(prev.voteCount) ? current : prev
      );
      return winner.candidateAddress.toLowerCase() === account?.toLowerCase();
    }
    return false;
  }).length;

  const winRate = completedContests > 0 ? (wins / completedContests) * 100 : 0;

  const handleContestVote = async () => {
    if (!candidateName.trim()) {
      setContestStatus("error");
      setStatusMessage("Please enter your candidate name");
      return;
    }

    if (selectedVoteId === null) {
      setContestStatus("error");
      setStatusMessage("Please select a vote to contest");
      return;
    }

    try {
      setContestStatus("idle");
      await contestVote(selectedVoteId, candidateName);
      setContestStatus("success");
      setStatusMessage(
        `Successfully registered as candidate "${candidateName}" for vote #${selectedVoteId}`
      );
      setCandidateName("");
      setSelectedVoteId(null);
    } catch (err) {
      setContestStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to contest vote"
      );
    }
  };

  return (
    <RoleGuard allowedRoles={[Role.Candidate]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Candidate Dashboard</h2>
          <p className="text-muted-foreground">
            Contest in votes, track your campaigns, and engage with voters
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Contests
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContests}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotesReceived}</div>
              <p className="text-xs text-muted-foreground">Votes received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {wins} wins out of {completedContests}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  myCandidacies.length * Number.parseFloat(FEES.CONTEST)
                ).toFixed(2)}{" "}
                ETH
              </div>
              <p className="text-xs text-muted-foreground">
                Total contest fees paid
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="contest" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contest">Contest Vote</TabsTrigger>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Contest Vote Tab */}
          <TabsContent value="contest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Contest in Vote
                </CardTitle>
                <CardDescription>
                  Register as a candidate in an active vote. Cost:{" "}
                  {FEES.CONTEST} ETH
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Your Candidate Name</Label>
                  <Input
                    id="candidateName"
                    placeholder="Enter your name as it will appear to voters"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select Vote to Contest</Label>
                  <div className="grid gap-2">
                    {availableVotes.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active votes available to contest</p>
                      </div>
                    ) : (
                      availableVotes.map((vote) => {
                        const isAlreadyCandidate = vote.candidates?.some(
                          (candidate) =>
                            candidate.candidateAddress.toLowerCase() ===
                            account?.toLowerCase()
                        );

                        return (
                          <Card
                            key={vote.id.toString()}
                            className={`cursor-pointer transition-colors ${
                              selectedVoteId === Number(vote.id)
                                ? "border-primary bg-primary/5"
                                : isAlreadyCandidate
                                ? "border-muted bg-muted/20 cursor-not-allowed"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => {
                              if (!isAlreadyCandidate) {
                                setSelectedVoteId(Number(vote.id));
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    #{vote.id.toString()} {vote.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {vote.candidates?.length || 0} candidates
                                    registered
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isAlreadyCandidate ? (
                                    <Badge variant="secondary">
                                      Already Registered
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Available</Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>

                {candidateName.trim() && selectedVoteId !== null && (
                  <GasEstimator
                    action="contest"
                    params={{ voteId: selectedVoteId, candidateName }}
                  />
                )}

                {contestStatus === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-600">
                      {statusMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {(contestStatus === "error" || error) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">
                      {statusMessage || error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleContestVote}
                  disabled={
                    loading || !candidateName.trim() || selectedVoteId === null
                  }
                  className="w-full"
                  size="lg"
                >
                  {loading
                    ? "Registering..."
                    : `Contest Vote (${FEES.CONTEST} ETH)`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid gap-4">
              {myCandidacies.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      You haven't contested in any votes yet. Contest in an
                      active vote to start your campaign.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                myCandidacies.map((vote) => {
                  const totalVotes =
                    vote.candidates?.reduce(
                      (sum, candidate) => sum + Number(candidate.voteCount),
                      0
                    ) || 0;
                  const myVotes = Number(vote.myCandidate?.voteCount || 0);
                  const votePercentage =
                    totalVotes > 0 ? (myVotes / totalVotes) * 100 : 0;

                  // Determine position
                  const sortedCandidates =
                    vote.candidates?.sort(
                      (a, b) => Number(b.voteCount) - Number(a.voteCount)
                    ) || [];
                  const myPosition =
                    sortedCandidates.findIndex(
                      (candidate) =>
                        candidate.candidateAddress.toLowerCase() ===
                        account?.toLowerCase()
                    ) + 1;

                  return (
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
                              {vote.active ? "Active" : "Ended"}
                            </Badge>
                            {myPosition === 1 && !vote.active && (
                              <Badge variant="destructive">
                                <Award className="h-3 w-3 mr-1" />
                                Winner
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Your Name
                            </p>
                            <p className="font-semibold">
                              {vote.myCandidate?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Votes Received
                            </p>
                            <p className="text-2xl font-bold">{myVotes}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Vote Share
                            </p>
                            <p className="text-2xl font-bold">
                              {votePercentage.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Position
                            </p>
                            <p className="text-2xl font-bold">#{myPosition}</p>
                          </div>
                        </div>

                        {totalVotes > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Vote Progress</span>
                              <span>
                                {myVotes} / {totalVotes} votes
                              </span>
                            </div>
                            <Progress value={votePercentage} className="h-2" />
                          </div>
                        )}

                        {vote.candidates && vote.candidates.length > 1 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              All Candidates:
                            </p>
                            <div className="space-y-1">
                              {sortedCandidates.map((candidate, index) => (
                                <div
                                  key={index}
                                  className={`flex items-center justify-between p-2 rounded ${
                                    candidate.candidateAddress.toLowerCase() ===
                                    account?.toLowerCase()
                                      ? "bg-primary/10 border border-primary/20"
                                      : "bg-muted"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      #{index + 1}
                                    </span>
                                    <span className="font-medium">
                                      {candidate.name}
                                    </span>
                                    {candidate.candidateAddress.toLowerCase() ===
                                      account?.toLowerCase() && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {candidate.voteCount.toString()} votes
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      (
                                      {totalVotes > 0
                                        ? (
                                            (Number(candidate.voteCount) /
                                              totalVotes) *
                                            100
                                          ).toFixed(1)
                                        : 0}
                                      %)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Campaign Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Campaigns
                        </p>
                        <p className="text-3xl font-bold">
                          {myCandidacies.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Campaigns
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {activeContests}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Completed Campaigns
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {completedContests}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Votes Received
                        </p>
                        <p className="text-3xl font-bold">
                          {totalVotesReceived}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Wins</p>
                        <p className="text-3xl font-bold text-green-600">
                          {wins}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Win Rate
                        </p>
                        <p className="text-3xl font-bold">
                          {winRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <CardDescription>
                    Your financial commitment to campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Total Investment</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(
                          myCandidacies.length * Number.parseFloat(FEES.CONTEST)
                        ).toFixed(2)}{" "}
                        ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {myCandidacies.length} contests × {FEES.CONTEST} ETH
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4" />
                        <span className="font-medium">Cost per Win</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {wins > 0
                          ? (
                              (myCandidacies.length *
                                Number.parseFloat(FEES.CONTEST)) /
                              wins
                            ).toFixed(2)
                          : "N/A"}{" "}
                        ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Average investment per victory
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Vote className="h-4 w-4" />
                        <span className="font-medium">Cost per Vote</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {totalVotesReceived > 0
                          ? (
                              (myCandidacies.length *
                                Number.parseFloat(FEES.CONTEST)) /
                              totalVotesReceived
                            ).toFixed(3)
                          : "N/A"}{" "}
                        ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Investment per vote received
                      </p>
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
