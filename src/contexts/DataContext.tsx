import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  collection, getDocs, doc, updateDoc, deleteDoc, getDoc, addDoc, setDoc,
  onSnapshot, query, orderBy, where, Timestamp, writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Tournament, 
  TournamentRegistration, 
  WithdrawalRequest,
  MatchResult,
  Transaction,
  TournamentStatus,
  User,
  PrizeTier,
  PaymentTransaction
} from '@/types';

interface DataContextType {
  tournaments: Tournament[];
  userRegistrations: TournamentRegistration[];
  withdrawalRequests: WithdrawalRequest[];
  transactions: Transaction[];
  paymentTransactions: PaymentTransaction[];
  allUsers: User[];
  matchResults: MatchResult[];
  isLoading: boolean;
  withdrawalListenerError: string | null;
  fetchTournaments: () => Promise<void>;
  fetchUserRegistrations: (userId: string) => Promise<void>;
  fetchWithdrawalRequests: () => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchMatchHistory: (userId: string) => Promise<void>;
  joinTournament: (tournamentId: string, userId: string, paymentId?: string) => Promise<{ slotNumber: number; paymentId: string }>;
  createTournament: (tournament: Omit<Tournament, 'id' | 'createdAt' | 'registeredCount'>) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  updateTournamentRoom: (tournamentId: string, roomId: string, roomPassword: string) => Promise<void>;
  updateTournamentStatus: (tournamentId: string, status: TournamentStatus) => Promise<void>;
  addTournamentResult: (tournamentId: string, userId: string, position: number, prizeAmount: number, kills: number) => Promise<void>;
  distributePrizes: (tournamentId: string, results: { oderId: string; displayName: string; position: number; kills: number }[]) => Promise<void>;
  requestWithdrawal: (userId: string, amount: number, upiId: string) => Promise<void>;
  processWithdrawal: (requestId: string, approved: boolean, reason?: string) => Promise<void>;
  disqualifyPlayer: (registrationId: string, reason: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getTournamentRegistrations: (tournamentId: string) => Promise<TournamentRegistration[]>;
  updateUserBalance: (userId: string, winningCredits: number) => void;
  addPaymentTransaction: (payment: Omit<PaymentTransaction, 'id' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default prize tiers for 100 players, 80 winners
const defaultPrizeTiers: PrizeTier[] = [
  { rankStart: 1, rankEnd: 5, prizeAmount: 50 },
  { rankStart: 6, rankEnd: 20, prizeAmount: 30 },
  { rankStart: 21, rankEnd: 40, prizeAmount: 20 },
  { rankStart: 41, rankEnd: 80, prizeAmount: 10 },
];

// Helper to convert Firestore timestamp to Date
const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<TournamentRegistration[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalListenerError, setWithdrawalListenerError] = useState<string | null>(null);

  // Real-time listener for tournaments from Firebase
  useEffect(() => {
    const tournamentsQuery = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      tournamentsQuery,
      (snapshot) => {
        const tournamentsData: Tournament[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            game: data.game,
            entryFee: data.entryFee,
            maxPlayers: data.maxPlayers,
            winnerCount: data.winnerCount,
            prizeTiers: data.prizeTiers || defaultPrizeTiers,
            matchDateTime: toDate(data.matchDateTime),
            status: data.status,
            roomId: data.roomId || null,
            roomPassword: data.roomPassword || null,
            roomReleased: data.roomReleased || false,
            rules: data.rules || '',
            createdAt: toDate(data.createdAt),
            createdBy: data.createdBy,
            registeredCount: data.registeredCount || 0,
          };
        });
        setTournaments(tournamentsData);
      },
      (error) => {
        console.warn('Tournament listener error:', error?.code || error?.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener for registrations
  useEffect(() => {
    if (!user?.id) return;

    const registrationsQuery = query(
      collection(db, 'registrations'),
      where('userId', '==', user.id)
    );
    
    const unsubscribe = onSnapshot(
      registrationsQuery,
      (snapshot) => {
        const registrationsData: TournamentRegistration[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            tournamentId: data.tournamentId,
            oderId: data.oderId || '',
            userId: data.userId,
            paymentId: data.paymentId,
            paymentStatus: data.paymentStatus,
            slotNumber: data.slotNumber,
            joinedAt: toDate(data.joinedAt),
            isDisqualified: data.isDisqualified || false,
            disqualificationReason: data.disqualificationReason || null,
          };
        });
        setUserRegistrations(registrationsData);
      },
      (error) => {
        console.warn('Registration listener error:', error?.code || error?.message);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Real-time listener for transactions
  useEffect(() => {
    if (!user?.id) return;

    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsData: Transaction[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            description: data.description,
            referenceId: data.referenceId || null,
            createdAt: toDate(data.createdAt),
          };
        });
        setTransactions(transactionsData);
      },
      (error) => {
        console.warn('Transaction listener error:', error?.code || error?.message);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Real-time listener for match results
  useEffect(() => {
    if (!user?.id) return;

    const resultsQuery = query(
      collection(db, 'matchResults'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      resultsQuery,
      (snapshot) => {
        const resultsData: MatchResult[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            tournamentId: data.tournamentId,
            userId: data.userId,
            position: data.position,
            kills: data.kills,
            prizeAmount: data.prizeAmount,
            createdAt: toDate(data.createdAt),
          };
        });
        setMatchResults(resultsData);
      },
      (error) => {
        console.warn('Match results listener error:', error?.code || error?.message);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Real-time listener for withdrawal requests from Firebase
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setWithdrawalListenerError(null);
      return;
    }

    const baseRef = collection(db, 'withdrawals');

    // Admin listens to all withdrawals; normal users only listen to their own
    const withdrawalsQuery = isAdmin
      ? query(baseRef, orderBy('createdAt', 'desc'))
      : query(baseRef, where('oderId', '==', user.id));

    const unsubscribe = onSnapshot(
      withdrawalsQuery,
      async (snapshot) => {
        setWithdrawalListenerError(null);

        const withdrawals: WithdrawalRequest[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();

          let userData: User | undefined;
          if (isAdmin) {
            try {
              const userDoc = await getDoc(doc(db, 'users', data.oderId));
              if (userDoc.exists()) {
                const uData = userDoc.data();
                userData = {
                  id: userDoc.id,
                  email: uData.email || '',
                  phone: uData.phone || '',
                  displayName: uData.displayName || '',
                  walletBalance: uData.walletBalance || 0,
                  winningCredits: uData.winningCredits || 0,
                  isBanned: uData.isBanned || false,
                  isAdmin: uData.isAdmin || false,
                  createdAt: toDate(uData.createdAt),
                  updatedAt: toDate(uData.updatedAt),
                };
              }
            } catch (error) {
              console.error('Error fetching user for withdrawal:', error);
            }
          }

          withdrawals.push({
            id: docSnap.id,
            oderId: data.oderId,
            amount: data.amount,
            status: data.status,
            upiId: data.upiId,
            createdAt: toDate(data.createdAt),
            processedAt: data.processedAt ? toDate(data.processedAt) : null,
            processedBy: data.processedBy || null,
            rejectionReason: data.rejectionReason || null,
            user: userData,
          });
        }

        withdrawals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setWithdrawalRequests(withdrawals);
      },
      (error: any) => {
        console.warn('Withdrawal listener error (non-blocking):', error?.code || error?.message);
        setWithdrawalListenerError(error?.code || error?.message || 'unknown');
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, isAdmin, user?.id]);

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'tournaments'), orderBy('createdAt', 'desc')));
      const data: Tournament[] = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          game: d.game,
          entryFee: d.entryFee,
          maxPlayers: d.maxPlayers,
          winnerCount: d.winnerCount,
          prizeTiers: d.prizeTiers || defaultPrizeTiers,
          matchDateTime: toDate(d.matchDateTime),
          status: d.status,
          roomId: d.roomId || null,
          roomPassword: d.roomPassword || null,
          roomReleased: d.roomReleased || false,
          rules: d.rules || '',
          createdAt: toDate(d.createdAt),
          createdBy: d.createdBy,
          registeredCount: d.registeredCount || 0,
        };
      });
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserRegistrations = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(query(
        collection(db, 'registrations'),
        where('userId', '==', userId)
      ));
      const data: TournamentRegistration[] = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          tournamentId: d.tournamentId,
          oderId: d.oderId || '',
          userId: d.userId,
          paymentId: d.paymentId,
          paymentStatus: d.paymentStatus,
          slotNumber: d.slotNumber,
          joinedAt: toDate(d.joinedAt),
          isDisqualified: d.isDisqualified || false,
          disqualificationReason: d.disqualificationReason || null,
        };
      });
      setUserRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWithdrawalRequests = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsLoading(false);
  }, []);

  const fetchTransactions = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ));
      const data: Transaction[] = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: d.userId,
          type: d.type,
          amount: d.amount,
          description: d.description,
          referenceId: d.referenceId || null,
          createdAt: toDate(d.createdAt),
        };
      });
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMatchHistory = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(query(
        collection(db, 'matchResults'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ));
      const results: MatchResult[] = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          tournamentId: d.tournamentId,
          userId: d.userId,
          position: d.position,
          kills: d.kills,
          prizeAmount: d.prizeAmount,
          createdAt: toDate(d.createdAt),
          tournament: tournaments.find(t => t.id === d.tournamentId),
        };
      });
      setMatchResults(results);
    } catch (error) {
      console.error('Error fetching match history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tournaments]);

  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = usersSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email || '',
          phone: data.phone || '',
          displayName: data.displayName || '',
          walletBalance: data.walletBalance || 0,
          winningCredits: data.winningCredits || 0,
          isBanned: data.isBanned || false,
          isAdmin: data.isAdmin || false,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
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

  const joinTournament = useCallback(async (tournamentId: string, oderId: string, paymentIdInput?: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    const slotNumber = (tournament.registeredCount || 0) + 1;
    const paymentId = paymentIdInput || `pay_${Date.now()}`;
    
    try {
      // Create registration in Firebase
      await addDoc(collection(db, 'registrations'), {
        tournamentId,
        userId: oderId,
        oderId,
        paymentId,
        paymentStatus: 'COMPLETED',
        slotNumber,
        joinedAt: Timestamp.now(),
        isDisqualified: false,
        disqualificationReason: null,
      });

      // Add entry fee transaction in Firebase
      await addDoc(collection(db, 'transactions'), {
        userId: oderId,
        type: 'ENTRY_FEE',
        amount: -(tournament.entryFee || 0),
        description: `Entry fee for ${tournament.game} Tournament`,
        referenceId: tournamentId,
        createdAt: Timestamp.now(),
      });

      // Update tournament registered count
      await updateDoc(doc(db, 'tournaments', tournamentId), {
        registeredCount: slotNumber,
      });

      return { slotNumber, paymentId };
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }, [tournaments]);

  const createTournament = useCallback(async (tournament: Omit<Tournament, 'id' | 'createdAt' | 'registeredCount'>) => {
    try {
      await addDoc(collection(db, 'tournaments'), {
        ...tournament,
        matchDateTime: Timestamp.fromDate(new Date(tournament.matchDateTime)),
        createdAt: Timestamp.now(),
        registeredCount: 0,
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }, []);

  const deleteTournament = useCallback(async (tournamentId: string) => {
    try {
      await deleteDoc(doc(db, 'tournaments', tournamentId));
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  }, []);

  const updateTournamentRoom = useCallback(async (tournamentId: string, roomId: string, roomPassword: string) => {
    try {
      await updateDoc(doc(db, 'tournaments', tournamentId), {
        roomId,
        roomPassword,
        roomReleased: true,
      });
    } catch (error) {
      console.error('Error updating tournament room:', error);
      throw error;
    }
  }, []);

  const updateTournamentStatus = useCallback(async (tournamentId: string, status: TournamentStatus) => {
    try {
      await updateDoc(doc(db, 'tournaments', tournamentId), { status });
    } catch (error) {
      console.error('Error updating tournament status:', error);
      throw error;
    }
  }, []);

  const addTournamentResult = useCallback(async (
    tournamentId: string, 
    oderId: string, 
    position: number, 
    prizeAmount: number, 
    kills: number
  ) => {
    try {
      // Add match result
      await addDoc(collection(db, 'matchResults'), {
        tournamentId,
        userId: oderId,
        position,
        kills,
        prizeAmount,
        createdAt: Timestamp.now(),
      });

      // Add prize transaction
      await addDoc(collection(db, 'transactions'), {
        userId: oderId,
        type: 'PRIZE',
        amount: prizeAmount,
        description: `Position #${position} prize`,
        referenceId: tournamentId,
        createdAt: Timestamp.now(),
      });

      // Update user winning credits
      const userDoc = await getDoc(doc(db, 'users', oderId));
      if (userDoc.exists()) {
        const currentCredits = userDoc.data().winningCredits || 0;
        await updateDoc(doc(db, 'users', oderId), {
          winningCredits: currentCredits + prizeAmount,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error adding tournament result:', error);
      throw error;
    }
  }, []);

  const distributePrizes = useCallback(async (
    tournamentId: string, 
    results: { oderId: string; displayName: string; position: number; kills: number }[]
  ) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    try {
      for (const result of results) {
        let prizeAmount = 0;
        for (const tier of tournament.prizeTiers) {
          if (result.position >= tier.rankStart && result.position <= tier.rankEnd) {
            prizeAmount = tier.prizeAmount;
            break;
          }
        }

        // Create match result in Firebase
        await addDoc(collection(db, 'matchResults'), {
          tournamentId,
          userId: result.oderId,
          position: result.position,
          kills: result.kills,
          prizeAmount,
          createdAt: Timestamp.now(),
        });

        if (prizeAmount > 0) {
          // Add prize transaction
          await addDoc(collection(db, 'transactions'), {
            userId: result.oderId,
            type: 'PRIZE',
            amount: prizeAmount,
            description: `Position #${result.position} prize - ${tournament.game} Tournament`,
            referenceId: tournamentId,
            createdAt: Timestamp.now(),
          });

          // Update user's winningCredits in Firebase
          const userDoc = await getDoc(doc(db, 'users', result.oderId));
          if (userDoc.exists()) {
            const currentCredits = userDoc.data().winningCredits || 0;
            await updateDoc(doc(db, 'users', result.oderId), { 
              winningCredits: currentCredits + prizeAmount,
              updatedAt: Timestamp.now(),
            });
          }
        }
      }

      // Mark tournament as completed
      await updateDoc(doc(db, 'tournaments', tournamentId), {
        status: 'COMPLETED',
      });

      // Refresh users to update leaderboard
      await fetchAllUsers();
    } catch (error) {
      console.error('Error distributing prizes:', error);
      throw error;
    }
  }, [tournaments, fetchAllUsers]);

  const updateUserBalance = useCallback((oderId: string, winningCredits: number) => {
    setAllUsers(prev => prev.map(u => 
      u.id === oderId ? { ...u, winningCredits } : u
    ));
  }, []);

  const addPaymentTransaction = useCallback((payment: Omit<PaymentTransaction, 'id' | 'createdAt'>) => {
    const newPayment: PaymentTransaction = {
      ...payment,
      id: `payment_${Date.now()}`,
      createdAt: new Date(),
    };
    setPaymentTransactions(prev => [newPayment, ...prev]);
    console.log('Payment transaction recorded:', newPayment);
  }, []);

  const requestWithdrawal = useCallback(async (oderId: string, amount: number, upiId: string) => {
    try {
      // First deduct from user's winning credits (optimistic update)
      const userDoc = await getDoc(doc(db, 'users', oderId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentCredits = userDoc.data().winningCredits || 0;
      if (currentCredits < amount) {
        throw new Error('Insufficient winning credits');
      }

      // Add to Firebase withdrawals collection
      await addDoc(collection(db, 'withdrawals'), {
        oderId,
        amount,
        status: 'PENDING',
        upiId,
        createdAt: Timestamp.now(),
        processedAt: null,
        processedBy: null,
        rejectionReason: null,
      });
      
      console.log('Withdrawal request created in Firebase');
    } catch (error: any) {
      console.error('Error creating withdrawal request:', error);
      throw error;
    }
  }, []);

  const processWithdrawal = useCallback(async (requestId: string, approved: boolean, reason?: string) => {
    const request = withdrawalRequests.find(r => r.id === requestId);
    if (!request) {
      console.error('Withdrawal request not found');
      return;
    }

    try {
      // Update withdrawal status in Firebase
      await updateDoc(doc(db, 'withdrawals', requestId), {
        status: approved ? 'APPROVED' : 'REJECTED',
        processedAt: Timestamp.now(),
        processedBy: user?.id || null,
        rejectionReason: reason || null,
      });
      console.log('Withdrawal status updated in Firebase');

      // If approved, deduct from user's winning credits and add transaction
      if (approved) {
        const userDoc = await getDoc(doc(db, 'users', request.oderId));
        if (userDoc.exists()) {
          const currentCredits = userDoc.data().winningCredits || 0;
          const newCredits = Math.max(0, currentCredits - request.amount);
          await updateDoc(doc(db, 'users', request.oderId), { 
            winningCredits: newCredits,
            updatedAt: Timestamp.now(),
          });
          console.log(`Deducted ₹${request.amount} from user ${request.oderId}. New balance: ₹${newCredits}`);
        }

        // Add withdrawal transaction
        await addDoc(collection(db, 'transactions'), {
          userId: request.oderId,
          type: 'WITHDRAWAL',
          amount: -request.amount,
          description: `Withdrawal to UPI: ${request.upiId}`,
          referenceId: requestId,
          createdAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw error;
    }
  }, [withdrawalRequests, user?.id]);

  const disqualifyPlayer = useCallback(async (registrationId: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        isDisqualified: true,
        disqualificationReason: reason,
      });
    } catch (error) {
      console.error('Error disqualifying player:', error);
      throw error;
    }
  }, []);

  const banUser = useCallback(async (oderId: string) => {
    try {
      await updateDoc(doc(db, 'users', oderId), { isBanned: true });
      setAllUsers(prev => prev.map(u => 
        u.id === oderId ? { ...u, isBanned: true } : u
      ));
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (oderId: string) => {
    try {
      await deleteDoc(doc(db, 'users', oderId));
      setAllUsers(prev => prev.filter(u => u.id !== oderId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }, []);

  const getTournamentRegistrations = useCallback(async (tournamentId: string) => {
    try {
      const snapshot = await getDocs(query(
        collection(db, 'registrations'),
        where('tournamentId', '==', tournamentId)
      ));
      return snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          tournamentId: d.tournamentId,
          oderId: d.oderId || '',
          userId: d.userId,
          paymentId: d.paymentId,
          paymentStatus: d.paymentStatus,
          slotNumber: d.slotNumber,
          joinedAt: toDate(d.joinedAt),
          isDisqualified: d.isDisqualified || false,
          disqualificationReason: d.disqualificationReason || null,
        } as TournamentRegistration;
      });
    } catch (error) {
      console.error('Error fetching tournament registrations:', error);
      return [];
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        tournaments,
        userRegistrations,
        withdrawalRequests,
        transactions,
        paymentTransactions,
        allUsers,
        matchResults,
        isLoading,
        withdrawalListenerError,
        fetchTournaments,
        fetchUserRegistrations,
        fetchWithdrawalRequests,
        fetchTransactions,
        fetchAllUsers,
        fetchMatchHistory,
        joinTournament,
        createTournament,
        deleteTournament,
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
        addPaymentTransaction,
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
