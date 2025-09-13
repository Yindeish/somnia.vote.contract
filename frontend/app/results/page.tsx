"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Candidate, Vote } from "@/lib/web3"
// import type { Vote, Candidate } from "@/lib/db"

interface VoteResult {
  candidate: Candidate
  votes: number
}

export default function ResultsPage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [selectedVoteId, setSelectedVoteId] = useState<string>("")
  const [results, setResults] = useState<VoteResult[]>([])
  const [isLoadingVotes, setIsLoadingVotes] = useState(true)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchVotes()
  }, [])

  useEffect(() => {
    if (selectedVoteId) {
      fetchResults(selectedVoteId)
    } else {
      setResults([])
    }
  }, [selectedVoteId])

  const fetchVotes = async () => {
   
  }

  const fetchResults = async (voteId: string) => {
   
  }

  const totalVotes = results.reduce((sum, result) => sum + result.votes, 0)
  const selectedVote = votes.find((vote) => vote.id.toString() === selectedVoteId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vote Results</CardTitle>
              <CardDescription>View the results of voting sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vote-select">Select Vote</Label>
                  <Select value={selectedVoteId} onValueChange={setSelectedVoteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vote to view results" />
                    </SelectTrigger>
                    <SelectContent>
                      {votes.map((vote) => (
                        <SelectItem key={vote.id} value={vote.id.toString()}>
                          {vote.title} {vote.active ? "(Active)" : "(Ended)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedVoteId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {selectedVote?.title}
                </CardTitle>
                <CardDescription>
                  Total votes cast: {totalVotes} • Status: {selectedVote?.active ? "Active" : "Ended"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResults ? (
                  <div className="text-center py-8">Loading results...</div>
                ) : results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No candidates or votes yet</div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => {
                      const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
                      return (
                        <div key={result.candidate.candidateAddress} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {index === 0 && result.votes > 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                              <span className="font-medium">{result.candidate.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {result.votes} votes ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
