export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legend';

export interface RankInfo {
  tier: RankTier;
  minMmr: number;
  maxMmr: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  iconName: string;
}

export interface UserPreferences {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  pushNotifications: boolean;
  reducedMotion: boolean;
  responsiblePlay: {
    dailyDepositLimit: number;
    dailyMatchLimit: number;
    sessionLimitMinutes: number;
    selfExclusionUntil?: number | null;
  };
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number; // percentage e.g. 68.5
  accuracy: number; // percentage e.g. 91.2
  bestScore: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoUrl: string;
  rank: RankTier;
  xp: number;
  xpToNextLevel: number;
  level: number;
  mmr: number;
  vipPassId?: string | null;
  vipExpiresAt?: number | null;
  is_verified?: boolean;
  has_gold_crown?: boolean;
  status?: string;
  vip_tier?: string;
  referral_code?: string;
  referral_count?: number;
  referral_earnings?: number;
  wallet_balance?: number;
  deposit_balance?: number;
  winnings_balance?: number;
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  room_slug: string;
  is_deleted?: boolean;
  created_at: number;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  type: string;
  target?: string;
  status: string;
  created_at: number;
}

export interface SupportConfig {
  email?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  help_articles_url?: string;
}

export interface VipPlanItem {
  id: string;
  tier: string;
  name: string;
  price: number;
  duration_days: number;
  enabled: boolean;
}

export interface MaintenanceConfig {
  enabled: boolean;
  message?: string;
}

export interface Wallet {
  availableBalance: number;
  lockedBalance: number;
  totalDeposited: number;
  totalWinnings: number;
  totalWithdrawn: number;
}

export type TransactionType = 'Deposit' | 'Entry Fee' | 'Prize' | 'Withdrawal' | 'Refund' | 'Adjustment';
export type TransactionStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Approved' | 'Rejected';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: number;
  description: string;
  matchId?: string;
  paymentMethod?: string;
  withdrawalDetails?: {
    accountNumber?: string;
    upiId?: string;
    bankName?: string;
  };
}

export type GameMode = '1v1' | '2v2' | '4v4' | 'mega_tournament' | 'knockout' | 'practice';

export interface PrizeTierConfig {
  rank: number;
  rankLabel: string;
  percentage: number;
}

export interface ScheduledTournament {
  id: string;
  title: string;
  startTime: number; // Unix ms
  endTime: number; // Unix ms
  entryFee: number;
  commissionPercent: number; // e.g. 25
  prizeDistribution: PrizeTierConfig[];
  maxPlayers: number;
  registeredPlayersCount: number;
  status: 'scheduled' | 'live' | 'ended' | 'finalized';
  questionsCount: number;
  leaderboard: {
    uid: string;
    username: string;
    displayName: string;
    photoUrl: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeSpentMs: number;
    submittedAt: number;
    rank?: number;
    prizeAwarded?: number;
  }[];
  autoCredited: boolean;
}

export interface KnockoutMatch {
  id: string;
  roundIndex: number; // 0: Quarterfinals, 1: Semifinals, 2: Finals
  roundName: string;
  player1: MatchPlayer;
  player2: MatchPlayer;
  winnerUid?: string;
  player1Score?: number;
  player2Score?: number;
  status: 'pending' | 'live' | 'completed';
}

export interface KnockoutTournament {
  id: string;
  title: string;
  entryFee: number;
  totalRounds: number; // e.g. 2, 3, 4
  totalSlots: number; // 4, 8, 16
  matches: KnockoutMatch[];
  championUid?: string;
  prizePool: number;
  status: 'waiting' | 'in_progress' | 'completed';
  createdAt: number;
}

export interface VipPass {
  id: string;
  title: string;
  badge: string;
  price: number;
  validityDays: number;
  discountPercent: number; // automatic entry fee discount e.g. 15%, 25%, 50%
  dailyFreeEntries: number;
  multiplierBonus: number;
  features: string[];
}

export interface ManagedQuestion {
  id: string;
  expression: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isActive: boolean;
  createdAt: number;
}

export interface AdminAppConfig {
  progressiveFormula: {
    entryFee: number;
    divisor: number; // e.g. 60
    totalQuestions: number; // e.g. 12 or 10
    targetCorrectForEntryFee: number; // e.g. 6 out of 12 (half questions)
  };
  knockoutRoundsConfig: {
    defaultRounds: number; // e.g. 3 (8 players)
    botFillTimeoutSeconds: number; // 15
    enabled: boolean;
  };
  aiSettings: {
    primaryProvider: string;
    backupProvider: string;
    defaultCategory: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    filterPuzzlesText: boolean;
  };
  payoutGateway: {
    provider: 'RazorpayX' | 'Cashfree';
    instantPayoutEnabled: boolean;
    accountNumberMasked: string;
    mode: 'Live' | 'Test';
    minWithdrawal: number;
  };
  policies: {
    termsAndConditions: string;
    refundPolicy: string;
    privacyPolicy: string;
    antiCheatingPolicy: string;
  };
}

export interface EntryFeeConfig {
  fee: number;
  estimatedPrize: number;
  playersRequired: number;
  questionsCount: number;
  timePerQuestion: number;
  mode: GameMode;
}

export interface MatchPlayer {
  uid: string;
  username: string;
  displayName: string;
  photoUrl: string;
  rank: RankTier;
  mmr: number;
  team?: 'A' | 'B';
  score: number;
  correctCount: number;
  currentQuestionIndex: number;
  isConnected: boolean;
  lastResponseTimeMs?: number;
  isBot?: boolean;
}

export interface PublicQuestion {
  id: string;
  index: number;
  total: number;
  expression: string;
  options: string[];
  timeLimitSeconds: number;
  serverDeadlineTimestamp: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  responseTimeMs: number;
  currentScore: number;
  streakBonus: number;
  correctOptionIndex: number;
  explanation: string;
}

export interface MatchResultData {
  matchId: string;
  gameMode: GameMode;
  entryFee: number;
  userScore: number;
  userRankPosition: number;
  totalPlayers: number;
  opponent?: MatchPlayer;
  teamAScore?: number;
  teamBScore?: number;
  winningTeam?: 'A' | 'B';
  isWinner: boolean;
  prizeAmount: number;
  xpGained: number;
  mmrChange: number;
  accuracy: number;
  avgResponseTimeMs: number;
  totalQuestions: number;
  correctAnswers: number;
  timestamp: number;
  settlementStatus: 'Settled' | 'Refunded';
}

export interface MatchHistoryItem {
  id: string;
  matchId: string;
  gameMode: GameMode;
  isWinner: boolean;
  userScore: number;
  opponentName: string;
  opponentScore: number;
  entryFee: number;
  prizeAmount: number;
  mmrChange: number;
  xpGained: number;
  timestamp: number;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
}

export interface TournamentHistoryItem {
  id: string;
  tournamentId: string;
  name: string;
  date: number;
  totalPlayers: number;
  finalRank: number;
  score: number;
  entryFee: number;
  prizeEarned: number;
  status: 'Completed' | 'Eliminated';
}

export interface TournamentLobby {
  id: string;
  name: string;
  entryFee: number;
  totalPrizePool: number;
  playersJoined: number;
  minPlayers: number;
  maxPlayers: number;
  startsInSeconds: number;
  status: 'registering' | 'starting' | 'live' | 'completed';
  prizeDistribution: { rankRange: string; percentage: number; prize: number }[];
  isUserRegistered: boolean;
}

export type NotificationType =
  | 'match_found'
  | 'match_starting'
  | 'match_result'
  | 'tournament_starting'
  | 'prize_credited'
  | 'deposit_success'
  | 'withdrawal_update'
  | 'system_announcement'
  | 'account_update';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  username: string;
  displayName: string;
  photoUrl: string;
  rankTier: RankTier;
  mmr: number;
  xp: number;
  wins: number;
  winRate: number;
  accuracy: number;
  isCurrentUser?: boolean;
}

declare global {
  interface Window {
    ZapUPI?: {
      setPaymentCallbacks: (callbacks: {
        onSuccess: (orderId: string) => void;
        onFailed: (orderId: string) => void;
        onTimeout: (orderId: string) => void;
      }) => void;
      createOrder: (
        orderData: {
          zap_key: string;
          order_id: string;
          amount: string;
          customer_mobile?: string;
          remark?: string;
        },
        callbacks: {
          onResponse: (paymentUrl: string, orderId: string, data: any) => void;
          onError: (err: any) => void;
        }
      ) => void;
      loadPayment: (paymentUrl: string) => void;
      getOrderStatus?: (
        statusData: { zap_key: string; order_id: string },
        callbacks: {
          onResponse: (paymentUrl: string, orderId: string, data: any) => void;
          onError: (err: any) => void;
        }
      ) => void;
    };
  }
}
