"use client"

import { useState, useCallback } from "react"
import { paymentService, type PaymentStatus } from "@/lib/payment"

export function usePayment() {
  const [balance, setBalance] = useState<string>("0")
  const [contractBalance, setContractBalance] = useState<string>("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    isPending: false,
    isSuccess: false,
    isError: false,
  })

  const checkBalance = useCallback(async (address: string) => {
    setLoading(true)
    setError(null)

    try {
      const userBalance = await paymentService.checkBalance(address)
      setBalance(userBalance)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check balance")
    } finally {
      setLoading(false)
    }
  }, [])

  const checkContractBalance = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const balance = await paymentService.getContractBalance()
      setContractBalance(balance)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check contract balance")
    } finally {
      setLoading(false)
    }
  }, [])

  const estimateGas = useCallback(
    async (
      action: "createVote" | "contest" | "vote",
      params: { title?: string; voteId?: number; candidateIndex?: number; candidateName?: string },
    ) => {
      setLoading(true)
      setError(null)

      try {
        const estimate = await paymentService.estimateGas(action, params)
        return estimate
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to estimate gas")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const trackTransaction = useCallback(async (txHash: string) => {
    setPaymentStatus({ isPending: true, isSuccess: false, isError: false })

    try {
      const receipt = await paymentService.waitForTransaction(txHash)
      const isSuccess = receipt.status === 1

      setPaymentStatus({
        isPending: false,
        isSuccess,
        isError: !isSuccess,
        error: isSuccess ? undefined : "Transaction failed",
        receipt,
      })

      return receipt
    } catch (err) {
      setPaymentStatus({
        isPending: false,
        isSuccess: false,
        isError: true,
        error: err instanceof Error ? err.message : "Transaction failed",
      })
      throw err
    }
  }, [])

  const withdrawFunds = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const txHash = await paymentService.withdrawContractBalance()
      await trackTransaction(txHash)
      await checkContractBalance() // Refresh contract balance
      return txHash
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw funds")
      throw err
    } finally {
      setLoading(false)
    }
  }, [trackTransaction, checkContractBalance])

  const getTransactionUrl = useCallback((txHash: string, network = "mainnet") => {
    return paymentService.formatTransactionUrl(txHash, network)
  }, [])

  return {
    balance,
    contractBalance,
    loading,
    error,
    paymentStatus,
    checkBalance,
    checkContractBalance,
    estimateGas,
    trackTransaction,
    withdrawFunds,
    getTransactionUrl,
  }
}
