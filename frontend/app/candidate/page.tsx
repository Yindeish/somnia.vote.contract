"use client";

import { CandidateDashboard } from "@/components/candidate-dashboard";
import { WalletConnect } from "@/components/wallet-connect";
import { useContract } from "@/contexts/contract-context";
import CandidateProtected from "@/secured/candidate-protected";

export default function CandidatePage() {
  const { isConnected } = useContract();

  if (!isConnected) {
    return (
      <CandidateProtected>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-balance mb-2">
                Candidate Portal
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Connect your wallet to access candidate features
              </p>
            </div>
            <WalletConnect />
          </div>
        </div>
      </CandidateProtected>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <CandidateDashboard />
      </div>
    </div>
  );
}
