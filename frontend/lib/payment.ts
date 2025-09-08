import { ethers } from "ethers"
import { web3Service, FEES } from "./web3"

export interface TransactionReceipt {
  hash: string
  blockNumber: number
  gasUsed: bigint
  effectiveGasPrice: bigint
  status: number
  timestamp: number
}

export interface PaymentStatus {
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  error?: string
  receipt?: TransactionReceipt
}

export class PaymentService {
  async checkBalance(address: string): Promise<string> {
    const provider = web3Service.getProvider()
    if (!provider) throw new Error("Provider not initialized")

    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  async estimateGas(
    action: "createVote" | "contest" | "vote",
    params: { title?: string; voteId?: number; candidateIndex?: number; candidateName?: string },
  ): Promise<{ gasEstimate: bigint; gasCost: string; totalCost: string }> {
    const contract = web3Service.getContract()
    if (!contract) throw new Error("Contract not initialized")

    let gasEstimate: bigint
    const feeAmount = ethers.parseEther(
      action === "createVote" ? FEES.CREATE_VOTE : action === "contest" ? FEES.CONTEST : FEES.VOTE,
    )

    try {
      switch (action) {
        case "createVote":
          if (!params.title) throw new Error("Title required for createVote")
          gasEstimate = await contract.createVote.estimateGas(params.title, { value: feeAmount })
          break
        case "contest":
          if (!params.voteId || !params.candidateName) throw new Error("VoteId and candidateName required for contest")
          gasEstimate = await contract.contest.estimateGas(params.voteId, params.candidateName, { value: feeAmount })
          break
        case "vote":
          if (params.voteId === undefined || params.candidateIndex === undefined)
            throw new Error("VoteId and candidateIndex required for vote")
          gasEstimate = await contract.vote.estimateGas(params.voteId, params.candidateIndex, { value: feeAmount })
          break
        default:
          throw new Error("Invalid action")
      }

      const provider = web3Service.getProvider()
      if (!provider) throw new Error("Provider not initialized")

      const feeData = await provider.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei")
      const gasCost = ethers.formatEther(gasEstimate * gasPrice)
      const totalCost = ethers.formatEther(feeAmount + gasEstimate * gasPrice)

      return {
        gasEstimate,
        gasCost,
        totalCost,
      }
    } catch (error) {
      console.error("Gas estimation failed:", error)
      // Fallback estimates
      const fallbackGas = BigInt(100000)
      const fallbackGasPrice = ethers.parseUnits("20", "gwei")
      const gasCost = ethers.formatEther(fallbackGas * fallbackGasPrice)
      const totalCost = ethers.formatEther(feeAmount + fallbackGas * fallbackGasPrice)

      return {
        gasEstimate: fallbackGas,
        gasCost,
        totalCost,
      }
    }
  }

  async waitForTransaction(txHash: string): Promise<TransactionReceipt> {
    const provider = web3Service.getProvider()
    if (!provider) throw new Error("Provider not initialized")

    const receipt = await provider.waitForTransaction(txHash)
    if (!receipt) throw new Error("Transaction receipt not found")

    const block = await provider.getBlock(receipt.blockNumber)
    if (!block) throw new Error("Block not found")

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      effectiveGasPrice: receipt.gasPrice || BigInt(0),
      status: receipt.status || 0,
      timestamp: block.timestamp,
    }
  }

  async getTransactionStatus(txHash: string): Promise<PaymentStatus> {
    try {
      const provider = web3Service.getProvider()
      if (!provider) throw new Error("Provider not initialized")

      const tx = await provider.getTransaction(txHash)
      if (!tx) {
        return { isPending: false, isSuccess: false, isError: true, error: "Transaction not found" }
      }

      if (tx.blockNumber === null) {
        return { isPending: true, isSuccess: false, isError: false }
      }

      const receipt = await this.waitForTransaction(txHash)
      const isSuccess = receipt.status === 1

      return {
        isPending: false,
        isSuccess,
        isError: !isSuccess,
        error: isSuccess ? undefined : "Transaction failed",
        receipt,
      }
    } catch (error) {
      return {
        isPending: false,
        isSuccess: false,
        isError: true,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  formatTransactionUrl(txHash: string, network = "mainnet"): string {
    const baseUrl = network === "mainnet" ? "https://etherscan.io" : `https://${network}.etherscan.io`
    return `${baseUrl}/tx/${txHash}`
  }

  async withdrawContractBalance(): Promise<string> {
    const contract = web3Service.getContract()
    if (!contract) throw new Error("Contract not initialized")

    try {
      const tx = await contract.withdraw()
      return tx.hash
    } catch (error) {
      console.error("Withdrawal failed:", error)
      throw error
    }
  }

  async getContractBalance(): Promise<string> {
    const provider = web3Service.getProvider()
    const contract = web3Service.getContract()
    if (!provider || !contract) throw new Error("Provider or contract not initialized")

    const balance = await provider.getBalance(await contract.getAddress())
    return ethers.formatEther(balance)
  }
}

export const paymentService = new PaymentService()
