// Game types supported
export type GameType = 'BGMI' | 'FREE_FIRE' | 'COD_MOBILE';

// Team mode types
export type TeamMode = 'SOLO' | 'DUO' | 'SQUAD';

// Tournament status
export type TournamentStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

// Payment status
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// Withdrawal status
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Transaction types
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'PRIZE' | 'ENTRY_FEE' | 'REFUND' | 'REFERRAL_BONUS';

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
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
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
  teamMode: TeamMode;
  entryFee: number;
  maxPlayers: number;
  winnerCount: number;
  prizeTiers: PrizeTier[];
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

// Payment Transaction (for Razorpay payments)
export interface PaymentTransaction {
  id: string;
  oderId: string;
  amount: number;
  paymentId: string;
  orderId: string;
  method: 'razorpay' | 'wallet';
  tournamentId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: Date;
}

// User stats interface
export interface UserStats {
  totalMatches: number;
  totalWins: number;
  totalEarnings: number;
  totalKills: number;
  avgKills: number;
  kdRatio: number;
  bestPosition: number;
}

// Match Result for history display
export interface MatchResult {
  id: string;
  tournamentId: string;
  tournament?: Tournament;
  userId: string;
  position: number;
  kills: number;
  prizeAmount: number;
  createdAt: Date;
}

// Team mode labels
export const teamModeLabels: Record<TeamMode, string> = {
  SOLO: 'Solo',
  DUO: 'Duo',
  SQUAD: 'Squad',
};

// Team mode player counts
export const teamModePlayerCount: Record<TeamMode, number> = {
  SOLO: 1,
  DUO: 2,
  SQUAD: 4,
};

// Game display names
export const gameDisplayNames: Record<GameType, string> = {
  BGMI: 'BGMI',
  FREE_FIRE: 'Free Fire',
  COD_MOBILE: 'COD Mobile',
};

// Generate referral code from user id
export const generateReferralCode = (userId: string): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  let code = 'BA';
  for (let i = 0; i < 6; i++) {
    code += chars[(hash * (i + 1) + i * 7) % chars.length];
  }
  return code;
};

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
