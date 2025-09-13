"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LoaderCircle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWriteContract } from "wagmi"
import { web3 } from "@/lib/web3"
import { toast } from "sonner"
import { useAppSelector } from "@/rtkState/hooks/useRtk"
import { RootState } from "@/rtkState/state"
import { parseEther } from "viem"

export default function CreateVotePage() {
  const router = useRouter()
  const { writeContractAsync, isPending, data, isError } = useWriteContract();
  const { address } = useAppSelector((s: RootState) => s.user)

  const [title, setTitle] = useState("")

  const handleSubmit = async () => {
    try {
      await writeContractAsync({
        ...web3.contractFunction('createVote'),
        args: [title],
        account: address as `0x${string}`,
        value: parseEther("0.5")
      });
      console.log('isPending, data, isError', isPending, data, isError)

      toast(`Successfully created ${title} vote`)
      router.push('/admin-dashboard')
    } catch (error: any) {
      console.log('error: ', error)
    }
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
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create New Vote</CardTitle>
              <CardDescription>
                Set up a new voting session for candidates to contest and voters to participate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Vote Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Student Council President Election"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <Button type="button" onClick={() => handleSubmit()} className="w-full" disabled={isPending}>
                  {isPending ? (<LoaderCircle className="animate-spin text-white" />) : 'Create Vote'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
