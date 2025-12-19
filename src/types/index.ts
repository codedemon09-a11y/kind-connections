// Game types supported in MVP
export type GameType = 'BGMI' | 'FREE_FIRE';

// Tournament status
export type TournamentStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

// Payment status
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// Withdrawal status
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Transaction types
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'PRIZE' | 'ENTRY_FEE' | 'REFUND';

// User interface
export interface User {
  id: string; // Firebase UID
  email: string;
  phone: string;
  displayName: string;
  walletBalance: number;
  winningCredits: number;
  isBanned: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Prize tier for distribution
export interface PrizeTier {
  rankStart: number;
  rankEnd: number;
  prizeAmount: number;
}

// Tournament interface
export interface Tournament {
  id: string;
  game: GameType;
  entryFee: number;
  maxPlayers: number;
  winnerCount: number; // How many players win (e.g., 80 out of 100)
  prizeTiers: PrizeTier[]; // Custom prize distribution
  matchDateTime: Date;
  status: TournamentStatus;
  roomId: string | null;
  roomPassword: string | null;
  roomReleased: boolean;
  rules: string;
  createdAt: Date;
  createdBy: string;
  registeredCount?: number;
}

// Tournament registration
export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  oderId: string;
  userId: string;
  paymentId: string;
  paymentStatus: PaymentStatus;
  slotNumber: number;
  joinedAt: Date;
  isDisqualified: boolean;
  disqualificationReason: string | null;
}

// Tournament result
export interface TournamentResult {
  id: string;
  tournamentId: string;
  userId: string;
  position: number;
  prizeAmount: number;
  kills: number;
  createdAt: Date;
  createdBy: string;
}

// Withdrawal request
export interface WithdrawalRequest {
  id: string;
  oderId: string;
  amount: number;
  status: WithdrawalStatus;
  upiId: string;
  createdAt: Date;
  processedAt: Date | null;
  processedBy: string | null;
  rejectionReason: string | null;
  user?: User;
}

// Transaction
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string | null;
  createdAt: Date;
}

// User stats interface
export interface UserStats {
  totalMatches: number;
  totalWins: number;
  totalEarnings: number;
}

// Calculate total prize pool from tiers
export const calculateTotalPrizePool = (prizeTiers: PrizeTier[]): number => {
  return prizeTiers.reduce((total, tier) => {
    const winnersInTier = tier.rankEnd - tier.rankStart + 1;
    return total + (tier.prizeAmount * winnersInTier);
  }, 0);
};

// Get prize amount for a specific rank
export const getPrizeForRank = (rank: number, prizeTiers: PrizeTier[]): number => {
  for (const tier of prizeTiers) {
    if (rank >= tier.rankStart && rank <= tier.rankEnd) {
      return tier.prizeAmount;
    }
  }
  return 0;
};
