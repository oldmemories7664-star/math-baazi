import React from 'react';
import {
  Zap,
  Trophy,
  Swords,
  Shield,
  Play,
  ChevronRight,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, GameMode, MatchHistoryItem, LeaderboardEntry } from '../types';
import { sound } from '../utils/sound';
import { AnnouncementBanner } from './AnnouncementBanner';

interface HomeDashboardProps {
  user: UserProfile;
  recentMatches: MatchHistoryItem[];
  leaderboardPreview: LeaderboardEntry[];
  onSelectGameMode: (mode: GameMode) => void;
  onOpenQuickPlay: () => void;
  onOpenTournamentLobby: () => void;
  onNavigateTab: (tab: 'play' | 'leaderboard' | 'wallet' | 'profile') => void;
  onViewMatchHistory: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  recentMatches,
  leaderboardPreview,
  onSelectGameMode,
  onOpenQuickPlay,
  onOpenTournamentLobby,
  onNavigateTab,
  onViewMatchHistory,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 animate-fadeIn pb-12">
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Hero Quick Play Banner - Lean & Direct */}
      <div
        onClick={() => {
          sound.playClick();
          onOpenQuickPlay();
        }}
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/15 flex items-center justify-between gap-4 cursor-pointer hover:opacity-95 transition-all group"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-300 fill-current animate-pulse" />
            <span>Speed Quiz</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">Play Quick Math Duel</h2>
          <p className="text-xs text-indigo-100 font-medium">Select entry stake & win instantly</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onOpenQuickPlay();
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md shrink-0 flex items-center gap-2 group-hover:scale-105 transition-transform"
        >
          <Play className="w-3.5 h-3.5 fill-current text-indigo-600" />
          <span>Play Now</span>
        </button>
      </div>

      {/* Game Modes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Game Modes</span>
          </h3>
          <button
            onClick={() => onNavigateTab('play')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>All Modes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Knockout Battle */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectGameMode('knockout');
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Swords className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                16 Players
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                Knockout Battle
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">1v1 Elimination tournament</p>
            </div>

            <button className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors">
              <span>Play Battle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mega Tournament */}
          <div
            onClick={() => {
              sound.playClick();
              onOpenTournamentLobby();
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                ₹10,000 Pool
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                Mega Tournament
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Global leaderboard contest</p>
            </div>

            <button className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors">
              <span>Enter Lobby</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Practice Arena */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectGameMode('1v1');
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                Free Mode
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Practice Arena
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Train your math speed</p>
            </div>

            <button className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors">
              <span>Train Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Matches & Leaderboard Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Matches */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Matches</span>
            </h4>
            <button
              onClick={() => {
                sound.playClick();
                onViewMatchHistory();
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentMatches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No matches played yet.
              </div>
            ) : (
              recentMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        match.isWinner
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {match.isWinner ? 'WIN' : 'LOSS'}
                    </span>
                    <div>
                      <p className="font-bold text-white">vs {match.opponentName}</p>
                      <p className="text-[10px] text-slate-400">
                        Score: {match.userScore} - {match.opponentScore}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {match.prizeAmount > 0 && (
                      <span className="block font-black text-amber-400">+₹{match.prizeAmount}</span>
                    )}
                    <span
                      className={`text-[10px] font-bold ${
                        match.mmrChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {match.mmrChange >= 0 ? '+' : ''}{match.mmrChange} MMR
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Leaderboard Standings */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Top Players</span>
            </h4>
            <button
              onClick={() => onNavigateTab('leaderboard')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {leaderboardPreview.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Standings loading...
              </div>
            ) : (
              leaderboardPreview.slice(0, 3).map((item) => (
                <div
                  key={item.uid}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 text-center font-black ${
                        item.rank === 1 ? 'text-amber-400' : item.rank === 2 ? 'text-slate-300' : 'text-amber-600'
                      }`}
                    >
                      #{item.rank}
                    </span>
                    <img
                      src={item.photoUrl}
                      alt={item.displayName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <p className="font-bold text-white">{item.displayName}</p>
                      <p className="text-[10px] text-slate-400">{item.rankTier}</p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-cyan-300">
                    {item.mmr} MMR
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
