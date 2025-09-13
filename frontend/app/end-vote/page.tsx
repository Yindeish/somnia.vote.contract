"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, StopCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Vote } from "@/lib/web3"

export default function EndVotePage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [selectedVoteId, setSelectedVoteId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingVotes, setIsLoadingVotes] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchVotes()
  }, [])

  const fetchVotes = async () => {
    
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
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <StopCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">End Vote</CardTitle>
              <CardDescription>Close an active voting session to prevent further votes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVotes ? (
                <div className="text-center py-4">Loading votes...</div>
              ) : votes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No active votes found</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vote-select">Select Vote to End</Label>
                    <Select value={selectedVoteId} onValueChange={setSelectedVoteId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a vote to end" />
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
                  <Button type="submit" variant="destructive" className="w-full" disabled={isLoading}>
                    {isLoading ? "Ending..." : "End Vote"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
