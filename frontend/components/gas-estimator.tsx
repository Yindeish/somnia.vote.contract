"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel } from "lucide-react"
import { usePayment } from "@/hooks/use-payment"
import { FEES } from "@/lib/web3"

interface GasEstimatorProps {
  action: "createVote" | "contest" | "vote"
  params: { title?: string; voteId?: number; candidateIndex?: number; candidateName?: string }
  onEstimate?: (estimate: { gasEstimate: bigint; gasCost: string; totalCost: string }) => void
}

export function GasEstimator({ action, params, onEstimate }: GasEstimatorProps) {
  const { estimateGas, loading } = usePayment()
  const [estimate, setEstimate] = useState<{
    gasEstimate: bigint
    gasCost: string
    totalCost: string
  } | null>(null)

  const actionFees = {
    createVote: FEES.CREATE_VOTE,
    contest: FEES.CONTEST,
    vote: FEES.VOTE,
  }

  const actionLabels = {
    createVote: "Create Vote",
    contest: "Contest Vote",
    vote: "Cast Vote",
  }

  useEffect(() => {
    const getEstimate = async () => {
      try {
        const result = await estimateGas(action, params)
        setEstimate(result)
        onEstimate?.(result)
      } catch (error) {
        console.error("Failed to estimate gas:", error)
      }
    }

    // Only estimate if we have required params
    const hasRequiredParams =
      (action === "createVote" && params.title) ||
      (action === "contest" && params.voteId && params.candidateName) ||
      (action === "vote" && params.voteId !== undefined && params.candidateIndex !== undefined)

    if (hasRequiredParams) {
      getEstimate()
    }
  }, [action, params, estimateGas, onEstimate])

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-4">
          <p className="text-sm text-muted-foreground">Estimating transaction costs...</p>
        </CardContent>
      </Card>
    )
  }

  if (!estimate) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Fuel className="h-4 w-4" />
          Transaction Cost Estimate
        </CardTitle>
        <CardDescription>{actionLabels[action]} - Cost Breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Action Fee</span>
            <Badge variant="outline">{actionFees[action]} ETH</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Gas Cost</span>
            <Badge variant="outline">{Number.parseFloat(estimate.gasCost).toFixed(6)} ETH</Badge>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Cost</span>
              <Badge variant="default" className="font-semibold">
                {Number.parseFloat(estimate.totalCost).toFixed(6)} ETH
              </Badge>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Gas Limit: {estimate.gasEstimate.toString()} units</div>
        </div>
      </CardContent>
    </Card>
  )
}
