"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { web3Service, Role, type Web3State, type Vote } from "@/lib/web3";

interface Web3ContextType extends Web3State {
  votes: Vote[];
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  loadVotes: () => Promise<void>;
  createVote: (title: string) => Promise<void>;
  contestVote: (voteId: number, candidateName: string) => Promise<void>;
  castVote: (voteId: number, candidateIndex: number) => Promise<void>;
  assignRole: (userAddress: string, role: Role) => Promise<void>;
  endVote: (voteId: number) => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const ContractContext = createContext<Web3ContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    contract: null,
    account: null,
    userRole: Role.None,
    isConnected: false,
  });

  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { account, userRole } = await web3Service.connectWallet();

      setState({
        provider: web3Service.getProvider(),
        signer: web3Service.getSigner(),
        contract: web3Service.getContract(),
        account,
        userRole,
        isConnected: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVotes = useCallback(async () => {
    if (!state.isConnected) return;

    setLoading(true);
    try {
      const votesData = await web3Service.getVotes();
      setVotes(votesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load votes");
    } finally {
      setLoading(false);
    }
  }, [state.isConnected]);

  const refreshUserRole = useCallback(async () => {
    if (!state.account) return;

    try {
      const userRole = await web3Service.getUserRole(state.account);
      setState((prev) => ({ ...prev, userRole }));
    } catch (err) {
      console.error("Failed to refresh user role:", err);
    }
  }, [state.account]);

  const createVote = useCallback(
    async (title: string) => {
      setLoading(true);
      setError(null);

      try {
        await web3Service.createVote(title);
        await loadVotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create vote");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadVotes]
  );

  const contestVote = useCallback(
    async (voteId: number, candidateName: string) => {
      setLoading(true);
      setError(null);

      try {
        await web3Service.contestVote(voteId, candidateName);
        await loadVotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to contest vote");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadVotes]
  );

  const castVote = useCallback(
    async (voteId: number, candidateIndex: number) => {
      setLoading(true);
      setError(null);

      try {
        await web3Service.castVote(voteId, candidateIndex);
        await loadVotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cast vote");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadVotes]
  );

  const assignRole = useCallback(
    async (userAddress: string, role: Role) => {
      setLoading(true);
      setError(null);

      try {
        await web3Service.assignRole(userAddress, role);
        if (userAddress.toLowerCase() === state.account?.toLowerCase()) {
          await refreshUserRole();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign role");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [state.account, refreshUserRole]
  );

  const endVote = useCallback(
    async (voteId: number) => {
      setLoading(true);
      setError(null);

      try {
        await web3Service.endVote(voteId);
        await loadVotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to end vote");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadVotes]
  );

  useEffect(() => {
    if (state.isConnected) {
      loadVotes();
    }
  }, [state.isConnected, loadVotes]);

  // useEffect(() => {
  //   if (window.ethereum) {
  //     const handleAccountsChanged = (accounts: string[]) => {
  //       if (accounts.length === 0) {
  //         setState({
  //           provider: null,
  //           signer: null,
  //           contract: null,
  //           account: null,
  //           userRole: Role.None,
  //           isConnected: false,
  //         });
  //         setVotes([]);
  //       } else {
  //         // connectWallet();
  //       }
  //     };

  //     // window.ethereum.on("accountsChanged", handleAccountsChanged);

  //     return () => {
  //       window.ethereum.removeListener(
  //         "accountsChanged",
  //         handleAccountsChanged
  //       );
  //     };
  //   }
  // }, [connectWallet]);

  const value: Web3ContextType = {
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
    refreshUserRole,
  };

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
}

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
}
