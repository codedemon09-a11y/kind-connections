import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Tournament, 
  TournamentRegistration, 
  WithdrawalRequest, 
  Transaction,
  TournamentStatus,
  User,
  PrizeTier
} from '@/types';

interface DataContextType {
  tournaments: Tournament[];
  userRegistrations: TournamentRegistration[];
  withdrawalRequests: WithdrawalRequest[];
  transactions: Transaction[];
  allUsers: User[];
  isLoading: boolean;
  fetchTournaments: () => Promise<void>;
  fetchUserRegistrations: (userId: string) => Promise<void>;
  fetchWithdrawalRequests: () => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  joinTournament: (tournamentId: string, userId: string) => Promise<{ slotNumber: number; paymentId: string }>;
  createTournament: (tournament: Omit<Tournament, 'id' | 'createdAt' | 'registeredCount'>) => Promise<void>;
  updateTournamentRoom: (tournamentId: string, roomId: string, roomPassword: string) => Promise<void>;
  updateTournamentStatus: (tournamentId: string, status: TournamentStatus) => Promise<void>;
  addTournamentResult: (tournamentId: string, userId: string, position: number, prizeAmount: number, kills: number) => Promise<void>;
  distributePrizes: (tournamentId: string, results: { userId: string; position: number; kills: number }[]) => Promise<void>;
  requestWithdrawal: (userId: string, amount: number, upiId: string) => Promise<void>;
  processWithdrawal: (requestId: string, approved: boolean, reason?: string) => Promise<void>;
  disqualifyPlayer: (registrationId: string, reason: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getTournamentRegistrations: (tournamentId: string) => Promise<TournamentRegistration[]>;
  updateUserBalance: (userId: string, winningCredits: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default prize tiers for 100 players, 80 winners
const defaultPrizeTiers: PrizeTier[] = [
  { rankStart: 1, rankEnd: 5, prizeAmount: 50 },
  { rankStart: 6, rankEnd: 20, prizeAmount: 30 },
  { rankStart: 21, rankEnd: 40, prizeAmount: 20 },
  { rankStart: 41, rankEnd: 80, prizeAmount: 10 },
];

// Mock data
const mockTournaments: Tournament[] = [
  {
    id: 'tournament-1',
    game: 'BGMI',
    entryFee: 25,
    maxPlayers: 100,
    winnerCount: 80,
    prizeTiers: defaultPrizeTiers,
    matchDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: 'UPCOMING',
    roomId: null,
    roomPassword: null,
    roomReleased: false,
    rules: 'Standard BGMI rules apply. No emulators allowed.',
    createdAt: new Date(),
    createdBy: 'admin-1',
    registeredCount: 67,
  },
  {
    id: 'tournament-2',
    game: 'FREE_FIRE',
    entryFee: 20,
    maxPlayers: 50,
    winnerCount: 40,
    prizeTiers: [
      { rankStart: 1, rankEnd: 3, prizeAmount: 60 },
      { rankStart: 4, rankEnd: 10, prizeAmount: 35 },
      { rankStart: 11, rankEnd: 25, prizeAmount: 20 },
      { rankStart: 26, rankEnd: 40, prizeAmount: 10 },
    ],
    matchDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    status: 'UPCOMING',
    roomId: null,
    roomPassword: null,
    roomReleased: false,
    rules: 'Standard Free Fire rules. Mobile devices only.',
    createdAt: new Date(),
    createdBy: 'admin-1',
    registeredCount: 23,
  },
  {
    id: 'tournament-3',
    game: 'BGMI',
    entryFee: 50,
    maxPlayers: 100,
    winnerCount: 80,
    prizeTiers: defaultPrizeTiers,
    matchDateTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'COMPLETED',
    roomId: '12345678',
    roomPassword: 'abc123',
    roomReleased: true,
    rules: 'Premium tournament with higher stakes.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdBy: 'admin-1',
    registeredCount: 100,
  },
];

const mockRegistrations: TournamentRegistration[] = [];

const mockWithdrawals: WithdrawalRequest[] = [];

const mockTransactions: Transaction[] = [];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [userRegistrations, setUserRegistrations] = useState<TournamentRegistration[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setTournaments(prev => prev.length === 0 ? mockTournaments : prev);
    setIsLoading(false);
  }, []);

  const fetchUserRegistrations = useCallback(async (userId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUserRegistrations(mockRegistrations.filter(r => r.userId === userId));
    setIsLoading(false);
  }, []);

  const fetchWithdrawalRequests = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setWithdrawalRequests(mockWithdrawals);
    setIsLoading(false);
  }, []);

  const fetchTransactions = useCallback(async (userId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setTransactions(mockTransactions.filter(t => t.userId === userId));
    setIsLoading(false);
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || '',
          phone: data.phone || '',
          displayName: data.displayName || '',
          walletBalance: data.walletBalance || 0,
          winningCredits: data.winningCredits || 0,
          isBanned: data.isBanned || false,
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinTournament = useCallback(async (tournamentId: string, userId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    const slotNumber = (tournament?.registeredCount || 0) + 1;
    const paymentId = `pay_${Date.now()}`;
    
    const newRegistration: TournamentRegistration = {
      id: `reg-${Date.now()}`,
      tournamentId,
      userId,
      paymentId,
      paymentStatus: 'COMPLETED',
      slotNumber,
      joinedAt: new Date(),
      isDisqualified: false,
      disqualificationReason: null,
      oderId: ''
    };
    
    // Add entry fee transaction
    const entryFeeTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      userId,
      type: 'ENTRY_FEE',
      amount: -(tournament?.entryFee || 0),
      description: `Entry fee for ${tournament?.game} Tournament`,
      referenceId: tournamentId,
      createdAt: new Date(),
    };
    
    setUserRegistrations(prev => [...prev, newRegistration]);
    setTransactions(prev => [entryFeeTransaction, ...prev]);
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId 
        ? { ...t, registeredCount: (t.registeredCount || 0) + 1 }
        : t
    ));
    
    return { slotNumber, paymentId };
  }, [tournaments]);

  const createTournament = useCallback(async (tournament: Omit<Tournament, 'id' | 'createdAt' | 'registeredCount'>) => {
    const newTournament: Tournament = {
      ...tournament,
      id: `tournament-${Date.now()}`,
      createdAt: new Date(),
      registeredCount: 0,
    };
    setTournaments(prev => [newTournament, ...prev]);
  }, []);

  const updateTournamentRoom = useCallback(async (tournamentId: string, roomId: string, roomPassword: string) => {
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId 
        ? { ...t, roomId, roomPassword, roomReleased: true }
        : t
    ));
  }, []);

  const updateTournamentStatus = useCallback(async (tournamentId: string, status: TournamentStatus) => {
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId ? { ...t, status } : t
    ));
  }, []);

  const addTournamentResult = useCallback(async (
    tournamentId: string, 
    userId: string, 
    position: number, 
    prizeAmount: number, 
    kills: number
  ) => {
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      userId,
      type: 'PRIZE',
      amount: prizeAmount,
      description: `Position #${position} prize`,
      referenceId: tournamentId,
      createdAt: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update user winning credits
    setAllUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, winningCredits: u.winningCredits + prizeAmount } : u
    ));
  }, []);

  const distributePrizes = useCallback(async (
    tournamentId: string, 
    results: { userId: string; position: number; kills: number }[]
  ) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    // Distribute prizes based on position and prize tiers
    for (const result of results) {
      let prizeAmount = 0;
      for (const tier of tournament.prizeTiers) {
        if (result.position >= tier.rankStart && result.position <= tier.rankEnd) {
          prizeAmount = tier.prizeAmount;
          break;
        }
      }

      if (prizeAmount > 0) {
        const newTransaction: Transaction = {
          id: `txn-${Date.now()}-${result.userId}`,
          userId: result.userId,
          type: 'PRIZE',
          amount: prizeAmount,
          description: `Position #${result.position} prize - ${tournament.game} Tournament`,
          referenceId: tournamentId,
          createdAt: new Date(),
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // Add prize to user's winning credits
        setAllUsers(prev => prev.map(u => 
          u.id === result.userId 
            ? { ...u, winningCredits: u.winningCredits + prizeAmount } 
            : u
        ));
      }
    }
  }, [tournaments]);

  const updateUserBalance = useCallback((userId: string, winningCredits: number) => {
    setAllUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, winningCredits } : u
    ));
  }, []);

  const requestWithdrawal = useCallback(async (userId: string, amount: number, upiId: string) => {
    const newRequest: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      oderId: userId,
      amount,
      status: 'PENDING',
      upiId,
      createdAt: new Date(),
      processedAt: null,
      processedBy: null,
      rejectionReason: null,
    };
    setWithdrawalRequests(prev => [newRequest, ...prev]);
  }, []);

  const processWithdrawal = useCallback(async (requestId: string, approved: boolean, reason?: string) => {
    const request = withdrawalRequests.find(r => r.id === requestId);
    
    setWithdrawalRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { 
            ...r, 
            status: approved ? 'APPROVED' : 'REJECTED',
            processedAt: new Date(),
            rejectionReason: reason || null,
          }
        : r
    ));

    // If approved, deduct from user's winning credits and add transaction
    if (approved && request) {
      setAllUsers(prev => prev.map(u => 
        u.id === request.oderId 
          ? { ...u, winningCredits: Math.max(0, u.winningCredits - request.amount) } 
          : u
      ));

      const withdrawalTransaction: Transaction = {
        id: `txn-wd-${Date.now()}`,
        userId: request.oderId,
        type: 'WITHDRAWAL',
        amount: -request.amount,
        description: `Withdrawal to UPI: ${request.upiId}`,
        referenceId: requestId,
        createdAt: new Date(),
      };
      setTransactions(prev => [withdrawalTransaction, ...prev]);
    }
  }, [withdrawalRequests]);

  const disqualifyPlayer = useCallback(async (registrationId: string, reason: string) => {
    setUserRegistrations(prev => prev.map(r => 
      r.id === registrationId 
        ? { ...r, isDisqualified: true, disqualificationReason: reason }
        : r
    ));
  }, []);

  const banUser = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isBanned: true });
      setAllUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isBanned: true } : u
      ));
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }, []);

  const getTournamentRegistrations = useCallback(async (tournamentId: string) => {
    return mockRegistrations.filter(r => r.tournamentId === tournamentId);
  }, []);

  return (
    <DataContext.Provider
      value={{
        tournaments,
        userRegistrations,
        withdrawalRequests,
        transactions,
        allUsers,
        isLoading,
        fetchTournaments,
        fetchUserRegistrations,
        fetchWithdrawalRequests,
        fetchTransactions,
        fetchAllUsers,
        joinTournament,
        createTournament,
        updateTournamentRoom,
        updateTournamentStatus,
        addTournamentResult,
        distributePrizes,
        requestWithdrawal,
        processWithdrawal,
        disqualifyPlayer,
        banUser,
        deleteUser,
        getTournamentRegistrations,
        updateUserBalance,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
