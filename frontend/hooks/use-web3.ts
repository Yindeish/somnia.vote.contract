"use client"

import { useState, useEffect, useCallback } from "react"
import { web3Service, Role, type Web3State, type Vote } from "@/lib/web3"

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    contract: null,
    account: null,
    userRole: Role.None,
    isConnected: false,
  })

  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { account, userRole } = await web3Service.connectWallet()

      setState({
        provider: web3Service.getProvider(),
        signer: web3Service.getSigner(),
        contract: web3Service.getContract(),
        account,
        userRole,
        isConnected: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadVotes = useCallback(async () => {
    if (!state.isConnected) return

    setLoading(true)
    try {
      const votesData = await web3Service.getVotes()
      setVotes(votesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load votes")
    } finally {
      setLoading(false)
    }
  }, [state.isConnected])

  const createVote = useCallback(
    async (title: string) => {
      setLoading(true)
      setError(null)

      try {
        await web3Service.createVote(title)
        await loadVotes() // Refresh votes after creation
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create vote")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadVotes],
  )

  const contestVote = useCallback(
    async (voteId: number, candidateName: string) => {
      setLoading(true)
      setError(null)

      try {
        await web3Service.contestVote(voteId, candidateName)
        await loadVotes() // Refresh votes after contesting
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to contest vote")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadVotes],
  )

  const castVote = useCallback(
    async (voteId: number, candidateIndex: number) => {
      setLoading(true)
      setError(null)

      try {
        await web3Service.castVote(voteId, candidateIndex)
        await loadVotes() // Refresh votes after casting
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cast vote")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadVotes],
  )

  const assignRole = useCallback(async (userAddress: string, role: Role) => {
    setLoading(true)
    setError(null)

    try {
      await web3Service.assignRole(userAddress, role)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const endVote = useCallback(
    async (voteId: number) => {
      setLoading(true)
      setError(null)

      try {
        await web3Service.endVote(voteId)
        await loadVotes() // Refresh votes after ending
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to end vote")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadVotes],
  )

  // Load votes when connected
  useEffect(() => {
    if (state.isConnected) {
      loadVotes()
    }
  }, [state.isConnected, loadVotes])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setState({
            provider: null,
            signer: null,
            contract: null,
            account: null,
            userRole: Role.None,
            isConnected: false,
          })
          setVotes([])
        } else {
          // Account changed, reconnect
          connectWallet()
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [connectWallet])

  return {
    ...state,
    votes,
    loading,
    error,
    connectWallet,
    loadVotes,
    createVote,
    contestVote,
    castVote,
    assignRole,
    endVote,
  }
}
