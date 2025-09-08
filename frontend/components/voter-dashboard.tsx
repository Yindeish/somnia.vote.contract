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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Vote,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Trophy,
  TrendingUp,
  History,
} from "lucide-react";
import { useContract } from "@/contexts/contract-context";
import { Role, FEES, type Candidate } from "@/lib/web3";
import { RoleGuard } from "@/components/role-guard";
import { GasEstimator } from "@/components/gas-estimator"; // Added gas estimator

export function VoterDashboard() {
  const { votes, castVote, loading, error, account } = useContract();
  const [selectedCandidate, setSelectedCandidate] = useState<{
    voteId: number;
    candidateIndex: number;
    candidateName: string;
  } | null>(null); // Added candidateName
  const [voteStatus, setVoteStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Filter active votes
  const activeVotes = votes.filter((vote) => vote.active);
  const completedVotes = votes.filter((vote) => !vote.active);

  // Calculate voting statistics
  const totalVotesParticipated = votes.filter((vote) => {
    // This is a simplified check - in a real implementation, you'd need to track voting history
    // For now, we'll assume participation based on vote existence
    return vote.candidates && vote.candidates.length > 0;
  }).length;

  const totalInvestment = totalVotesParticipated * Number.parseFloat(FEES.VOTE);

  const handleVoteClick = (
    voteId: number,
    candidateIndex: number,
    candidateName: string
  ) => {
    setSelectedCandidate({ voteId, candidateIndex, candidateName }); // Store candidate name
    setStatusMessage(`Vote for ${candidateName} in vote #${voteId}`);
    setShowConfirmDialog(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;

    try {
      setVoteStatus("idle");
      setShowConfirmDialog(false);
      await castVote(
        selectedCandidate.voteId,
        selectedCandidate.candidateIndex
      );
      setVoteStatus("success");
      setStatusMessage("Vote cast successfully!");
      setSelectedCandidate(null);
    } catch (err) {
      setVoteStatus("error");
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to cast vote"
      );
    }
  };

  const VoteCard = ({ vote }: { vote: any }) => {
    const totalVotes =
      vote.candidates?.reduce(
        (sum: number, candidate: Candidate) =>
          sum + Number(candidate.voteCount),
        0
      ) || 0;
    const hasVoted = false; // In a real implementation, you'd check if the user has already voted

    return (
      <Card key={vote.id.toString()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>#{vote.id.toString()}</span>
              <span>{vote.title}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={vote.active ? "default" : "secondary"}>
                {vote.active ? (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ended
                  </>
                )}
              </Badge>
              {hasVoted && <Badge variant="outline">Voted</Badge>}
            </div>
          </div>
          <CardDescription>
            {vote.candidates?.length || 0} candidates • {totalVotes} total votes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vote.candidates && vote.candidates.length > 0 ? (
            <div className="space-y-3">
              {vote.candidates
                .sort(
                  (a: Candidate, b: Candidate) =>
                    Number(b.voteCount) - Number(a.voteCount)
                )
                .map((candidate: Candidate, index: number) => {
                  const votePercentage =
                    totalVotes > 0
                      ? (Number(candidate.voteCount) / totalVotes) * 100
                      : 0;
                  const isLeading =
                    index === 0 && Number(candidate.voteCount) > 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{candidate.name}</span>
                          {isLeading && (
                            <Badge variant="destructive" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              Leading
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {candidate.voteCount.toString()} votes (
                            {votePercentage.toFixed(1)}%)
                          </span>
                          {vote.active && !hasVoted && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleVoteClick(
                                  Number(vote.id),
                                  index,
                                  candidate.name
                                )
                              }
                              disabled={loading}
                            >
                              Vote
                            </Button>
                          )}
                        </div>
                      </div>
                      {totalVotes > 0 && (
                        <Progress value={votePercentage} className="h-2" />
                      )}
                      <div className="text-xs text-muted-foreground">
                        {candidate.candidateAddress.slice(0, 6)}...
                        {candidate.candidateAddress.slice(-4)}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No candidates registered yet</p>
            </div>
          )}

          {vote.active &&
            !hasVoted &&
            vote.candidates &&
            vote.candidates.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Voting fee: {FEES.VOTE} ETH • Choose your candidate above
                </p>
              </div>
            )}
        </CardContent>
      </Card>
    );
  };

  return (
    <RoleGuard allowedRoles={[Role.Voter]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Voter Dashboard</h2>
          <p className="text-muted-foreground">
            Participate in active votes and view election results
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Votes
              </CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVotes.length}</div>
              <p className="text-xs text-muted-foreground">
                Active voting sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participation
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotesParticipated}</div>
              <p className="text-xs text-muted-foreground">
                Votes participated
              </p>
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
              <div className="text-2xl font-bold">
                {activeVotes.reduce(
                  (sum, vote) => sum + (vote.candidates?.length || 0),
                  0
                )}
              </div>
              <p className="text-xs text-muted-foreground">In active votes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalInvestment.toFixed(2)} ETH
              </div>
              <p className="text-xs text-muted-foreground">Total voting fees</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        {voteStatus === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-600">
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        {(voteStatus === "error" || error) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {statusMessage || error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Votes</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="history">My History</TabsTrigger>
          </TabsList>

          {/* Active Votes Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4">
              {activeVotes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No active votes available at the moment.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Check back later or contact an administrator to create new
                      votes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activeVotes.map((vote) => (
                  <VoteCard key={vote.id.toString()} vote={vote} />
                ))
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <div className="grid gap-4">
              {completedVotes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No completed votes to show results for.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedVotes.map((vote) => (
                  <VoteCard key={vote.id.toString()} vote={vote} />
                ))
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Voting History
                </CardTitle>
                <CardDescription>
                  Your participation in the voting system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Votes Participated
                      </p>
                      <p className="text-3xl font-bold">
                        {totalVotesParticipated}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Participations
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {
                          votes.filter(
                            (vote) =>
                              vote.active &&
                              vote.candidates &&
                              vote.candidates.length > 0
                          ).length
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completed Participations
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {
                          votes.filter(
                            (vote) =>
                              !vote.active &&
                              vote.candidates &&
                              vote.candidates.length > 0
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Investment
                      </p>
                      <p className="text-3xl font-bold">
                        {totalInvestment.toFixed(2)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Average Cost per Vote
                      </p>
                      <p className="text-3xl font-bold">{FEES.VOTE} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Participation Rate
                      </p>
                      <p className="text-3xl font-bold">
                        {votes.length > 0
                          ? (
                              (totalVotesParticipated / votes.length) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voting Guidelines</CardTitle>
                <CardDescription>
                  Important information about the voting process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Voting Fee</h4>
                    <p className="text-sm text-muted-foreground">
                      Each vote costs {FEES.VOTE} ETH. This fee helps maintain
                      the security and integrity of the voting system.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">One Vote Per Election</h4>
                    <p className="text-sm text-muted-foreground">
                      You can only vote once per election. Choose your candidate
                      carefully as votes cannot be changed.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Transparency</h4>
                    <p className="text-sm text-muted-foreground">
                      All votes are recorded on the blockchain, ensuring
                      complete transparency and immutability of results.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Vote Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Your Vote</DialogTitle>
              <DialogDescription>
                Are you sure you want to cast your vote? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  You are voting for:
                </p>
                <p className="font-semibold">{statusMessage}</p>
              </div>

              {selectedCandidate && (
                <GasEstimator
                  action="vote"
                  params={{
                    voteId: selectedCandidate.voteId,
                    candidateIndex: selectedCandidate.candidateIndex,
                  }}
                />
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmVote}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Casting Vote..." : "Confirm Vote"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
