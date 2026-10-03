/**
 * Client Service API layer
 * Consumes authoritative backend operations with real-time listeners
 * and handles connection state transitions (Connected, Reconnecting, Disconnected).
 */

import { serverEngine } from '../server/authoritativeEngine';
import {
  UserProfile,
  Wallet,
  Transaction,
  GameMode,
  PublicQuestion,
  AnswerResult,
  MatchResultData,
  TournamentLobby,
  AppNotification,
  LeaderboardEntry,
  MatchHistoryItem,
  TournamentHistoryItem,
  AdminAppConfig,
  ScheduledTournament,
  VipPass,
  ManagedQuestion,
  ChatMessage,
  AnnouncementItem,
  SupportConfig,
  VipPlanItem,
  MaintenanceConfig,
} from '../types';

type ConnectionStatus = 'Connected' | 'Reconnecting' | 'Disconnected';

class SpeedMathApiService {
  private connectionStatus: ConnectionStatus = 'Connected';
  private connectionListeners: Set<(s: ConnectionStatus) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setConnectionStatus('Connected'));
      window.addEventListener('offline', () => this.setConnectionStatus('Reconnecting'));
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public setConnectionStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.connectionListeners.forEach((cb) => cb(status));
  }

  public onConnectionChange(cb: (s: ConnectionStatus) => void): () => void {
    this.connectionListeners.add(cb);
    cb(this.connectionStatus);
    return () => this.connectionListeners.delete(cb);
  }

  // --- Auth API ---
  public async login(email: string, pass: string): Promise<UserProfile> {
    if (this.connectionStatus === 'Disconnected') {
      throw new Error('Connection lost. Please check your internet connection.');
    }
    return serverEngine.loginWithEmail(email, pass);
  }

  public async register(username: string, email: string, pass: string): Promise<UserProfile> {
    if (this.connectionStatus === 'Disconnected') {
      throw new Error('Connection lost. Please check your internet connection.');
    }
    return serverEngine.registerWithEmail(username, email, pass);
  }

  public async loginWithGoogle(): Promise<UserProfile> {
    return serverEngine.loginWithGoogle();
  }

  public async forgotPassword(email: string): Promise<boolean> {
    return serverEngine.requestPasswordReset(email);
  }

  public async logout(): Promise<void> {
    return serverEngine.logout();
  }

  public getCurrentUser(): UserProfile | null {
    return serverEngine.getCurrentUser();
  }

  public onAuthStateChanged(cb: (user: UserProfile | null) => void): () => void {
    return serverEngine.subscribeAuth(cb);
  }

  public async updateProfile(data: { displayName?: string; photoUrl?: string; preferences?: Partial<UserProfile['preferences']> }): Promise<UserProfile> {
    return serverEngine.updateProfile(data);
  }

  // --- Wallet API ---
  public getWallet(): Wallet {
    return serverEngine.getWallet();
  }

  public onWalletChanged(cb: (wallet: Wallet) => void): () => void {
    return serverEngine.subscribeWallet(cb);
  }

  public getTransactions(): Transaction[] {
    return serverEngine.getTransactions();
  }

  public async getZapKey(): Promise<string> {
    return serverEngine.getZapKey();
  }

  public async getZapConfig(): Promise<{ zapKey: string; minAmount: number; maxAmount: number; enabled: boolean }> {
    return serverEngine.getZapConfig();
  }

  public async updatePaymentGatewayConfig(config: { api_key: string; enabled?: boolean; min_amount?: number; max_amount?: number }): Promise<void> {
    return serverEngine.updatePaymentGatewayConfig(config);
  }

  public async deposit(amount: number, method: string): Promise<Transaction> {
    if (this.connectionStatus === 'Disconnected') {
      throw new Error('Payment service unavailable while offline.');
    }
    return serverEngine.requestDeposit(amount, method);
  }

  public async withdraw(amount: number, method: string, details: { upiId?: string; accountNumber?: string; bankName?: string }): Promise<Transaction> {
    if (this.connectionStatus === 'Disconnected') {
      throw new Error('Withdrawal service unavailable while offline.');
    }
    return serverEngine.requestWithdrawal(amount, method, details);
  }

  // --- Matchmaking & Matches API ---
  public async joinMatchmaking(gameMode: GameMode, entryFee: number) {
    if (this.connectionStatus === 'Disconnected') {
      throw new Error('Unable to join matchmaking while disconnected.');
    }
    return serverEngine.joinMatchmaking(gameMode, entryFee);
  }

  public cancelMatchmaking(matchId: string): boolean {
    return serverEngine.cancelMatchmaking(matchId);
  }

  public getQuestion(matchId: string, questionIndex: number): PublicQuestion {
    return serverEngine.getPublicQuestion(matchId, questionIndex);
  }

  public async submitAnswer(matchId: string, questionIndex: number, selectedOptionIndex: number): Promise<AnswerResult> {
    if (this.connectionStatus === 'Disconnected') {
      throw new Error('Answer could not be synchronized: Connection lost.');
    }
    return serverEngine.submitAnswer(matchId, questionIndex, selectedOptionIndex, Date.now());
  }

  public nextQuestion(matchId: string, nextIndex: number) {
    serverEngine.nextQuestion(matchId, nextIndex);
  }

  public async settleMatch(matchId: string): Promise<MatchResultData> {
    return serverEngine.settleMatch(matchId);
  }

  public onMatchUpdate(matchId: string, cb: (m: any) => void): () => void {
    return serverEngine.subscribeMatch(matchId, cb);
  }

  public getMatchHistory(): MatchHistoryItem[] {
    return serverEngine.getMatchHistory();
  }

  public async rewardKnockoutWinnings(prize: number): Promise<void> {
    return serverEngine.rewardKnockoutWinnings(prize);
  }

  // --- Admin Console & System Config API ---
  public getAdminConfig(): AdminAppConfig {
    return serverEngine.getAdminConfig();
  }

  public async updateAdminConfig(cfg: Partial<AdminAppConfig>): Promise<AdminAppConfig> {
    return serverEngine.updateAdminConfig(cfg);
  }

  public onAdminConfigChanged(cb: (c: AdminAppConfig) => void): () => void {
    return serverEngine.subscribeAdminConfig(cb);
  }

  public async updatePolicies(policies: AdminAppConfig['policies']): Promise<boolean> {
    return serverEngine.updatePolicies(policies);
  }

  // --- Scheduled Tournaments API ---
  public getScheduledTournaments(): ScheduledTournament[] {
    return serverEngine.getScheduledTournaments();
  }

  public async createScheduledTournament(data: Omit<ScheduledTournament, 'id' | 'leaderboard' | 'autoCredited'>): Promise<ScheduledTournament> {
    return serverEngine.createScheduledTournament(data);
  }

  public async finalizeScheduledTournament(id: string): Promise<ScheduledTournament> {
    return serverEngine.finalizeScheduledTournament(id);
  }

  public async deleteScheduledTournament(id: string): Promise<boolean> {
    return serverEngine.deleteScheduledTournament(id);
  }

  public async submitTournamentScore(tournId: string, score: number, correctCount: number, totalQuestions: number, timeSpentMs: number): Promise<boolean> {
    return serverEngine.submitTournamentScore(tournId, score, correctCount, totalQuestions, timeSpentMs);
  }

  public onScheduledTournamentsChanged(cb: (t: ScheduledTournament[]) => void): () => void {
    return serverEngine.subscribeScheduledTournaments(cb);
  }

  // --- VIP Passes API ---
  public getVipPasses(): VipPass[] {
    return serverEngine.getVipPasses();
  }

  public async createVipPass(pass: Omit<VipPass, 'id'>): Promise<VipPass> {
    return serverEngine.createVipPass(pass);
  }

  public async deleteVipPass(id: string): Promise<boolean> {
    return serverEngine.deleteVipPass(id);
  }

  public async purchaseVipPass(passId: string): Promise<UserProfile> {
    return serverEngine.purchaseVipPass(passId);
  }

  public onVipPassesChanged(cb: (v: VipPass[]) => void): () => void {
    return serverEngine.subscribeVipPasses(cb);
  }

  // --- Managed Questions API ---
  public getManagedQuestions(): ManagedQuestion[] {
    return serverEngine.getManagedQuestions();
  }

  public async createManagedQuestion(q: Omit<ManagedQuestion, 'id' | 'createdAt'>): Promise<ManagedQuestion> {
    return serverEngine.createManagedQuestion(q);
  }

  public async toggleQuestionStatus(id: string, isActive: boolean): Promise<boolean> {
    return serverEngine.toggleQuestionStatus(id, isActive);
  }

  public async deleteManagedQuestion(id: string): Promise<boolean> {
    return serverEngine.deleteManagedQuestion(id);
  }

  public onQuestionsChanged(cb: (q: ManagedQuestion[]) => void): () => void {
    return serverEngine.subscribeManagedQuestions(cb);
  }

  // --- Tournaments API ---
  public getTournaments(): TournamentLobby[] {
    return serverEngine.getTournamentLobbies();
  }

  public getTournamentHistory(): TournamentHistoryItem[] {
    return serverEngine.getTournamentHistory();
  }

  // --- Leaderboard API ---
  public getLeaderboard(type: 'global' | 'weekly' | 'monthly'): LeaderboardEntry[] {
    return serverEngine.getLeaderboard(type);
  }

  // --- Notifications API ---
  public getNotifications(): AppNotification[] {
    return serverEngine.getNotifications();
  }

  public onNotificationsChanged(cb: (n: AppNotification[]) => void): () => void {
    return serverEngine.subscribeNotifications(cb);
  }

  // --- Community Chat API ---
  public async sendChatMessage(room_slug: string, message: string): Promise<ChatMessage> {
    return serverEngine.sendChatMessage(room_slug, message);
  }

  public subscribeChatMessages(room_slug: string, cb: (msgs: ChatMessage[]) => void): () => void {
    return serverEngine.subscribeChatMessages(room_slug, cb);
  }

  public async checkChatBan(uid: string): Promise<{ expires_at: number } | null> {
    return serverEngine.checkChatBan(uid);
  }

  // --- Support & Maintenance & Announcements API ---
  public getSupportConfig(): SupportConfig {
    return serverEngine.getSupportConfig();
  }

  public subscribeSupportConfig(cb: (cfg: SupportConfig) => void): () => void {
    return serverEngine.subscribeSupportConfig(cb);
  }

  public getMaintenance(): MaintenanceConfig {
    return serverEngine.getMaintenance();
  }

  public subscribeMaintenance(cb: (cfg: MaintenanceConfig) => void): () => void {
    return serverEngine.subscribeMaintenance(cb);
  }

  public subscribeAnnouncements(cb: (items: AnnouncementItem[]) => void): () => void {
    return serverEngine.subscribeAnnouncements(cb);
  }

  public subscribeVipPlans(cb: (plans: VipPlanItem[]) => void): () => void {
    return serverEngine.subscribeVipPlans(cb);
  }

  public markNotificationAsRead(id: string) {
    serverEngine.markNotificationAsRead(id);
  }

  public markAllNotificationsAsRead() {
    serverEngine.markAllNotificationsAsRead();
  }
}

export const api = new SpeedMathApiService();
