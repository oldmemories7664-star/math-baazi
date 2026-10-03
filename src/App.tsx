import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { GameModesView } from './components/GameModesView';
import { EntryFeeModal } from './components/EntryFeeModal';
import { MatchmakingView } from './components/MatchmakingView';
import { MatchFoundView } from './components/MatchFoundView';
import { LiveQuizView } from './components/LiveQuizView';
import { MatchResultView } from './components/MatchResultView';
import { WalletView } from './components/WalletView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { MegaTournamentView } from './components/MegaTournamentView';
import { MatchHistoryView } from './components/MatchHistoryView';
import { NotificationModal } from './components/NotificationModal';
import { AuthScreen } from './components/AuthScreen';
import { KnockoutView } from './components/KnockoutView';
import { CommunityChatModal } from './components/CommunityChatModal';
import { SupportModal } from './components/SupportModal';
import { MaintenanceScreen, SuspendedScreen } from './components/MaintenanceScreen';

import { api } from './services/api';
import {
  UserProfile,
  Wallet,
  AppNotification,
  GameMode,
  MatchPlayer,
  MatchResultData,
  MatchHistoryItem,
  LeaderboardEntry,
  MaintenanceConfig,
} from './types';

export default function App() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'play' | 'leaderboard' | 'wallet' | 'profile'>('home');
  const [wallet, setWallet] = useState<Wallet>({
    availableBalance: 0,
    lockedBalance: 0,
    totalDeposited: 0,
    totalWinnings: 0,
    totalWithdrawn: 0,
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchHistoryItem[]>([]);
  const [leaderboardPreview, setLeaderboardPreview] = useState<LeaderboardEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'Connected' | 'Reconnecting' | 'Disconnected'>('Connected');
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>({ enabled: false });

  // Modals & Flows
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('1v1');
  const [selectedFee, setSelectedFee] = useState<number>(20);
  const [isDepositTabOpen, setIsDepositTabOpen] = useState(false);
  const [isTournamentViewOpen, setIsTournamentViewOpen] = useState(false);
  const [isHistoryViewOpen, setIsHistoryViewOpen] = useState(false);

  // Active Match Lifecycle
  const [matchState, setMatchState] = useState<'idle' | 'matchmaking' | 'match_found' | 'live_quiz' | 'result' | 'knockout'>('idle');
  const [activeMatchId, setActiveMatchId] = useState<string>('');
  const [matchPlayers, setMatchPlayers] = useState<MatchPlayer[]>([]);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);

  // Subscribe to real-time Firebase updates
  useEffect(() => {
    let initialLoaded = false;
    const unsubAuth = api.onAuthStateChanged((u) => {
      setUser(u);
      if (!initialLoaded) {
        initialLoaded = true;
        setIsAuthLoading(false);
      }
      if (u) {
        setRecentMatches(api.getMatchHistory());
        setLeaderboardPreview(api.getLeaderboard('global'));
      }
    });

    const unsubWallet = api.onWalletChanged((w) => {
      setWallet(w);
    });

    const unsubNotifs = api.onNotificationsChanged((n) => {
      setNotifications(n);
    });

    const unsubConn = api.onConnectionChange((s) => {
      setConnectionStatus(s);
    });

    const unsubMaint = api.subscribeMaintenance((m) => {
      setMaintenance(m);
    });

    // Safety timeout for initial auth check
    const safetyTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 1200);

    return () => {
      unsubAuth();
      unsubWallet();
      unsubNotifs();
      unsubConn();
      unsubMaint();
      clearTimeout(safetyTimer);
    };
  }, []);

  // 1. Initial Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-2xl shadow-indigo-500/30 animate-pulse mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-400 font-black text-2xl">
              ∑x
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to Firebase Auth...</span>
        </div>
      </div>
    );
  }

  // 2. MAINTENANCE SCREEN: Triggered when admin enables Maintenance
  if (maintenance.enabled) {
    return <MaintenanceScreen message={maintenance.message} onRefresh={() => window.location.reload()} />;
  }

  // 3. GATED AUTH SCREEN
  if (!user) {
    return <AuthScreen />;
  }

  // 4. SUSPENDED USER SCREEN: Triggered when admin suspends user
  if (user.status === 'suspended') {
    return (
      <SuspendedScreen
        onLogout={async () => {
          await api.logout();
        }}
        onOpenSupport={() => setIsSupportOpen(true)}
      />
    );
  }

  // 3. Handlers for Match Lifecycle (Available after sign-in)
  const handleOpenFeeModal = (mode: GameMode) => {
    setSelectedGameMode(mode);
    setIsFeeModalOpen(true);
  };

  const handleConfirmFee = async (mode: GameMode, fee: number) => {
    setIsFeeModalOpen(false);
    setSelectedGameMode(mode);
    setSelectedFee(fee);
    try {
      const session = await api.joinMatchmaking(mode, fee);
      if (mode === 'knockout') {
        setMatchState('knockout');
        return;
      }
      setActiveMatchId(session.matchId);
      setMatchPlayers(session.players || [
        {
          uid: user!.uid,
          username: user!.username,
          displayName: user!.displayName,
          photoUrl: user!.photoUrl,
          rank: user!.rank,
          mmr: user!.mmr,
          score: 0,
          correctCount: 0,
          currentQuestionIndex: 0,
          isConnected: true,
        },
      ]);
      setMatchState('live_quiz');
    } catch (err: any) {
      if (mode === 'knockout') {
        alert(err?.message || 'Error entering Knockout Tournament. Please check your wallet balance.');
      } else {
        setActiveMatchId(`quiz_${Date.now()}`);
        setMatchState('live_quiz');
      }
    }
  };

  const handleMatchFound = (players: MatchPlayer[]) => {
    setMatchPlayers(players);
    setMatchState('live_quiz');
  };

  const handleStartLiveQuiz = () => {
    setMatchState('live_quiz');
  };

  const handleFinishMatch = (result: MatchResultData) => {
    setMatchResult(result);
    setRecentMatches(api.getMatchHistory());
    setMatchState('result');
  };

  const handlePlayAgain = () => {
    setMatchResult(null);
    handleConfirmFee(selectedGameMode, selectedFee);
  };

  const handleCancelMatchmaking = () => {
    if (activeMatchId) {
      api.cancelMatchmaking(activeMatchId);
    }
    setMatchState('idle');
  };

  const handleResetToHome = () => {
    setMatchState('idle');
    setMatchResult(null);
    setCurrentTab('home');
    setIsTournamentViewOpen(false);
    setIsHistoryViewOpen(false);
  };

  const handleQuickPlay = () => {
    handleOpenFeeModal('1v1');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Top Header Navbar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setIsTournamentViewOpen(false);
          setIsHistoryViewOpen(false);
          if (matchState !== 'live_quiz') {
            setMatchState('idle');
          }
          setCurrentTab(tab);
        }}
        user={user}
        wallet={wallet}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDeposit={() => {
          setCurrentTab('wallet');
          setIsDepositTabOpen(true);
        }}
        onOpenAuth={() => {}}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        connectionStatus={connectionStatus}
      />

      {/* Disconnect Alert Bar */}
      {connectionStatus !== 'Connected' && (
        <div className="bg-amber-500/90 text-slate-950 font-bold text-xs py-2 px-4 text-center flex items-center justify-center gap-2 sticky top-16 z-30 shadow-md">
          <div className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          <span>Connection Lost. Reconnecting to authoritative speed match server...</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-10">
        {/* Active Match Lifecycle Screens */}
        {matchState === 'knockout' && (
          <KnockoutView
            user={user}
            wallet={wallet}
            entryFee={selectedFee}
            onGoHome={handleResetToHome}
            onOpenDeposit={() => {
              setMatchState('idle');
              setCurrentTab('wallet');
              setIsDepositTabOpen(true);
            }}
          />
        )}

        {matchState === 'matchmaking' && (
          <MatchmakingView
            gameMode={selectedGameMode}
            entryFee={selectedFee}
            userMmr={user.mmr}
            onCancel={handleCancelMatchmaking}
            onMatchFound={handleMatchFound}
            findMatchPromise={async () => {
              const res = await api.joinMatchmaking(selectedGameMode, selectedFee);
              setActiveMatchId(res.matchId);
              return res;
            }}
          />
        )}

        {matchState === 'match_found' && (
          <MatchFoundView
            gameMode={selectedGameMode}
            entryFee={selectedFee}
            user={user}
            players={matchPlayers}
            onStartGame={handleStartLiveQuiz}
          />
        )}

        {matchState === 'live_quiz' && (
          <LiveQuizView
            matchId={activeMatchId}
            gameMode={selectedGameMode}
            entryFee={selectedFee}
            user={user}
            initialPlayers={matchPlayers}
            onFinishMatch={handleFinishMatch}
          />
        )}

        {matchState === 'result' && matchResult && (
          <MatchResultView
            result={matchResult}
            user={user}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleResetToHome}
            onViewHistory={() => {
              setMatchState('idle');
              setIsHistoryViewOpen(true);
            }}
          />
        )}

        {/* Regular Tabs (Visible when idle) */}
        {matchState === 'idle' && (
          <>
            {isTournamentViewOpen ? (
              <MegaTournamentView
                wallet={wallet}
                onJoinTournamentGame={(_tournId, fee) => {
                  setSelectedGameMode('mega_tournament');
                  setSelectedFee(fee);
                  setMatchState('matchmaking');
                }}
                onOpenDeposit={() => {
                  setCurrentTab('wallet');
                  setIsDepositTabOpen(true);
                  setIsTournamentViewOpen(false);
                }}
              />
            ) : isHistoryViewOpen ? (
              <MatchHistoryView
                history={recentMatches}
                onPlayMode={() => {
                  setIsHistoryViewOpen(false);
                  setCurrentTab('play');
                }}
              />
            ) : (
              <>
                {currentTab === 'home' && (
                  <HomeDashboard
                    user={user}
                    recentMatches={recentMatches}
                    leaderboardPreview={leaderboardPreview}
                    onSelectGameMode={handleOpenFeeModal}
                    onOpenQuickPlay={handleQuickPlay}
                    onOpenTournamentLobby={() => setIsTournamentViewOpen(true)}
                    onNavigateTab={(tab) => {
                      setCurrentTab(tab);
                      setIsDepositTabOpen(false);
                    }}
                    onViewMatchHistory={() => setIsHistoryViewOpen(true)}
                  />
                )}

                {currentTab === 'play' && (
                  <GameModesView
                    onSelectMode={handleOpenFeeModal}
                    onOpenTournamentLobby={() => setIsTournamentViewOpen(true)}
                  />
                )}

                {currentTab === 'leaderboard' && <LeaderboardView />}

                {currentTab === 'wallet' && (
                  <WalletView
                    wallet={wallet}
                    transactions={api.getTransactions()}
                    onOpenDepositTab={isDepositTabOpen}
                  />
                )}

                {currentTab === 'profile' && (
                  <ProfileView
                    user={user}
                    recentMatches={recentMatches}
                    onPlayMode={() => {
                      setCurrentTab('play');
                    }}
                    onLogout={async () => {
                      await api.logout();
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Global Entry Fee Modal */}
      <EntryFeeModal
        isOpen={isFeeModalOpen}
        gameMode={selectedGameMode}
        wallet={wallet}
        onClose={() => setIsFeeModalOpen(false)}
        onConfirm={handleConfirmFee}
        onOpenDeposit={() => {
          setIsFeeModalOpen(false);
          setCurrentTab('wallet');
          setIsDepositTabOpen(true);
        }}
      />

      {/* Notifications Slide-Over */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      {/* Community Realtime Chat Modal */}
      <CommunityChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        user={user}
      />

      {/* Support & Social Links Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
