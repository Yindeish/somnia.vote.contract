import { ethers } from "ethers";
import contractAbi from "@/abi/VotingSystem.json";

// Contract ABI - extracted from the Solidity contract
export const VOTING_CONTRACT_ABI = contractAbi.abi;
export type tFunction = 'getCandidates' | 'registerAsVoter' | 'registerAsCandidate' | 'registerAsAdmin' | 'assignRole' | 'createVote' | 'contest' | 'vote' | 'endVote' | 'withdraw' | 'getCandidates';


// Role enum matching the contract
export enum Role {
  None = 0,
  Admin = 1,
  Candidate = 2,
  Voter = 3,
}

// Contract fees in ETH
export const FEES = {
  CREATE_VOTE: "0.5",
  CONTEST: "0.35",
  VOTE: "0.25",
} as const;

// Contract address - this should be set after deployment
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const contractFunction = (name: tFunction) => {
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: VOTING_CONTRACT_ABI,
    functionName: name,
  }
}

export const web3 = {CONTRACT_ADDRESS, contractFunction, contractAbi}

// Types
export interface Candidate {
  candidateAddress: string;
  name: string;
  voteCount: bigint;
}

export interface Vote {
  id: bigint;
  title: string;
  active: boolean;
  candidates?: Candidate[];
}

export interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  account: string | null;
  userRole: Role;
  isConnected: boolean;
}

// Web3 utility functions
export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async connectWallet(): Promise<{ account: string; userRole: Role }> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        this.signer
      );

      const account = await this.signer.getAddress();
      const userRole = await this.getUserRole(account);
      // this.isConnected = true;
      // const isConnected = this.isConnected;
      return { account, userRole };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  async getUserRole(address: string): Promise<Role> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const role = await this.contract.roles(address);
      return Number(role) as Role;
    } catch (error) {
      console.error("Failed to get user role:", error);
      return Role.None;
    }
  }

  async getVotes(): Promise<Vote[]> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const voteCounter = await this.contract.voteCounter();
      const votes: Vote[] = [];

      for (let i = 1; i <= Number(voteCounter); i++) {
        const vote = await this.contract.votes(i);
        const candidates = await this.contract.getCandidates(i);

        votes.push({
          id: vote.id,
          title: vote.title,
          active: vote.active,
          candidates: candidates.map((c: any) => ({
            candidateAddress: c.candidateAddress,
            name: c.name,
            voteCount: c.voteCount,
          })),
        });
      }

      return votes;
    } catch (error) {
      console.error("Failed to get votes:", error);
      throw error;
    }
  }

  async createVote(title: string): Promise<void> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.createVote(title, {
        value: ethers.parseEther(FEES.CREATE_VOTE),
      });
      await tx.wait();
    } catch (error) {
      console.error("Failed to create vote:", error);
      throw error;
    }
  }

  async contestVote(voteId: number, candidateName: string): Promise<void> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.contest(voteId, candidateName, {
        value: ethers.parseEther(FEES.CONTEST),
      });
      await tx.wait();
    } catch (error) {
      console.error("Failed to contest vote:", error);
      throw error;
    }
  }

  async castVote(voteId: number, candidateIndex: number): Promise<void> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.vote(voteId, candidateIndex, {
        value: ethers.parseEther(FEES.VOTE),
      });
      await tx.wait();
    } catch (error) {
      console.error("Failed to cast vote:", error);
      throw error;
    }
  }

  async assignRole(userAddress: string, role: Role): Promise<void> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.assignRole(userAddress, role);
      await tx.wait();
    } catch (error) {
      console.error("Failed to assign role:", error);
      throw error;
    }
  }

  async endVote(voteId: number): Promise<void> {
    if (!this.contract) throw new Error("Contract not initialized");

    try {
      const tx = await this.contract.endVote(voteId);
      await tx.wait();
    } catch (error) {
      console.error("Failed to end vote:", error);
      throw error;
    }
  }

  getContract() {
    return this.contract;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}

// Global Web3 service instance
export const web3Service = new Web3Service();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
