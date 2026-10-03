import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ScheduledTournament, UserProfile, Wallet } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface ScheduledTournamentViewProps {
  user: UserProfile;
  wallet: Wallet;
  onPlayTournamentAttempt: (tournId: string, questionsCount: number, entryFee: number) => void;
  onOpenDeposit: () => void;
  onBack: () => void;
}

export const ScheduledTournamentView: React.FC<ScheduledTournamentViewProps> = ({
  user,
  wallet,
  onPlayTournamentAttempt,
  onOpenDeposit,
  onBack,
}) => {
  const [tournaments, setTournaments] = useState<ScheduledTournament[]>(api.getScheduledTournaments());
  const [selectedTournId, setSelectedTournId] = useState<string | null>(tournaments[0]?.id || null);

  useEffect(() => {
    const unsub = api.onScheduledTournamentsChanged((list) => {
      setTournaments(list);
      if (!selectedTournId && list.length > 0) {
        setSelectedTournId(list[0].id);
      }
    });
    return unsub;
  }, []);

  const selectedTourn = tournaments.find((t) => t.id === selectedTournId) || tournaments[0];
  const now = Date.now();

  const isLive = selectedTourn && now >= selectedTourn.startTime && now <= selectedTourn.endTime;
  const isUpcoming = selectedTourn && now < selectedTourn.startTime;
  const isEnded = selectedTourn && now > selectedTourn.endTime;

  const userEntry = selectedTourn?.leaderboard.find((e) => e.uid === user.uid);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Scheduled Tournaments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            टूर्नामेंट अखाड़ा (Live Championships)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Play your official attempt during the active window. Live rankings updated automatically by score & timing.
          </p>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
        >
          ← Back to Games
        </button>
      </div>

      {/* Tournaments List Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {tournaments.map((t) => {
          const isSelected = selectedTourn?.id === t.id;
          const live = now >= t.startTime && now <= t.endTime;
          const upcoming = now < t.startTime;

          return (
            <div
              key={t.id}
              onClick={() => {
                sound.playClick();
                setSelectedTournId(t.id);
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900/90 border-amber-400/60 ring-2 ring-amber-500/30 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      live
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                        : upcoming
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {live ? '● Live Now' : upcoming ? 'Upcoming' : 'Ended'}
                  </span>
                  <span className="text-xs font-black text-amber-400">Entry: ₹{t.entryFee}</span>
                </div>

                <h3 className="text-base font-black text-white">{t.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Window: {new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(t.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(t.endTime).toLocaleDateString()})
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  {t.registeredPlayersCount || t.leaderboard.length} Players Registered
                </span>
                <span className="text-amber-400 font-bold">
                  {t.commissionPercent}% Commission Deducted
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tournament Detail & Leaderboard */}
      {selectedTourn && (
        <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Tournament Details</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{selectedTourn.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <span>⏱️ {selectedTourn.questionsCount || 12} Questions</span>
                <span>•</span>
                <span>💰 Entry: ₹{selectedTourn.entryFee}</span>
                <span>•</span>
                <span>🏆 Platform Commission: {selectedTourn.commissionPercent}%</span>
              </div>
            </div>

            {/* Action button */}
            {isLive ? (
              userEntry ? (
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 block mb-1">
                    ✓ Your Score Submitted: {userEntry.score} pts
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Rank #{userEntry.rank || 'Pending'} · Time: {(userEntry.timeSpentMs / 1000).toFixed(1)}s
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onPlayTournamentAttempt(selectedTourn.id, selectedTourn.questionsCount || 12, selectedTourn.entryFee);
                  }}
                  className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Official Attempt (₹{selectedTourn.entryFee})</span>
                </button>
              )
            ) : isUpcoming ? (
              <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                Starts at {new Date(selectedTourn.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                Tournament Finalized · Prizes Auto-Credited
              </div>
            )}
          </div>

          {/* Prize Distribution Tiers */}
          <div>
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-3">
              Prize Distribution Rules (Platform Commission Deducted)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedTourn.prizeDistribution.map((tier, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-bold text-white block">{tier.rankLabel}</span>
                  <span className="text-sm font-black text-amber-400">{tier.percentage}% of Net Pool</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Leaderboard Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                Live Standings (Auto-Ranked by Score & Timing)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedTourn.leaderboard.length} submissions
              </span>
            </div>

            {selectedTourn.leaderboard.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selectedTourn.leaderboard.map((entry, idx) => {
                  const isCurrent = entry.uid === user.uid;
                  return (
                    <div
                      key={entry.uid}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md ring-1 ring-indigo-500'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            idx === 0
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950 font-black'
                              : idx === 2
                              ? 'bg-amber-700 text-white font-black'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <img src={entry.photoUrl} alt={entry.displayName} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700" />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {entry.displayName} {isCurrent && '(You)'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Time: {(entry.timeSpentMs / 1000).toFixed(1)}s · {entry.correctCount}/{entry.totalQuestions} Correct
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-cyan-400 font-mono block">
                          {entry.score} pts
                        </span>
                        {entry.prizeAwarded ? (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Won ₹{entry.prizeAwarded}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-400">
                No submissions yet. Be the first to play your attempt and claim Rank #1!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
