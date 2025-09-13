"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Vote as VoteSVG, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// import { getSessionId } from "@/lib/session"
import { Candidate, Vote } from "@/lib/web3"
// import type { Vote as VoteType, Candidate } from "@/lib/db"

export default function VotePage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [selectedVoteId, setSelectedVoteId] = useState<string>("")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingVotes, setIsLoadingVotes] = useState(true)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchVotes()
  }, [])

  const fetchVotes = async () => {
   
  }

  const fetchCandidates = async (voteId: string) => {
   
  }

  const handleSubmit = async (e: React.FormEvent) => {
   
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                <VoteSVG className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Cast Your Vote</CardTitle>
              <CardDescription>Select a voting session and choose your preferred candidate</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVotes ? (
                <div className="text-center py-4">Loading votes...</div>
              ) : votes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No active votes available</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="vote-select">Select Vote</Label>
                    <Select value={selectedVoteId} onValueChange={setSelectedVoteId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a vote" />
                      </SelectTrigger>
                      <SelectContent>
                        {votes.map((vote) => (
                          <SelectItem key={vote.id} value={vote.id.toString()}>
                            {vote.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedVoteId && (
                    <div className="space-y-3">
                      <Label>Select Candidate</Label>
                      {isLoadingCandidates ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">Loading candidates...</div>
                      ) : candidates.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No candidates registered for this vote yet
                        </div>
                      ) : hasVoted ? (
                        <div className="flex items-center justify-center py-4 text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          You have already voted in this election
                        </div>
                      ) : (
                        <RadioGroup value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                          {candidates.map((candidate) => (
                            <div key={candidate.candidateAddress} className="flex items-center space-x-2">
                              <RadioGroupItem value={candidate.candidateAddress.toString()} id={`candidate-${candidate.candidateAddress}`} />
                              <Label htmlFor={`candidate-${candidate.candidateAddress}`} className="flex-1 cursor-pointer">
                                {candidate.name}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>
                  )}

                  {selectedVoteId && candidates.length > 0 && !hasVoted && (
                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? "Casting Vote..." : "Cast Vote"}
                    </Button>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


// "use client";

// import { VoterDashboard } from "@/components/voter-dashboard";
// import { WalletConnect } from "@/components/wallet-connect";
// import { useContract } from "@/contexts/contract-context";

// export default function VotePage() {
//   const { isConnected } = useContract();

//   if (!isConnected) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto px-4 py-8">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-balance mb-2">
//               Voter Portal
//             </h1>
//             <p className="text-lg text-muted-foreground text-pretty">
//               Connect your wallet to participate in voting
//             </p>
//           </div>
//           <WalletConnect />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8">
//         <VoterDashboard />
//       </div>
//     </div>
//   );
// }
