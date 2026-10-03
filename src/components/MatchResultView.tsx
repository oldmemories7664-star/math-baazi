import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Zap,
  Target,
  Clock,
  RotateCcw,
  Home,
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
} from 'lucide-react';
import { MatchResultData, UserProfile } from '../types';
import { getRankProgress, RANK_TIERS } from '../utils/ranks';
import { sound } from '../utils/sound';

interface MatchResultViewProps {
  result: MatchResultData;
  user: UserProfile;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onViewHistory: () => void;
}

export const MatchResultView: React.FC<MatchResultViewProps> = ({
  result,
  user,
  onPlayAgain,
  onGoHome,
  onViewHistory,
}) => {
  useEffect(() => {
    if (result.isWinner) {
      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#6366f1', '#fbbf24', '#10b981'],
      });
    } else {
      sound.playIncorrect();
    }
  }, [result.isWinner]);

  const rankProgress = getRankProgress(user.mmr);
  const rankInfo = RANK_TIERS[rankProgress.tier];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-fadeIn">
      <div className="glass-panel bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none ${
            result.isWinner ? 'bg-amber-500/25' : 'bg-slate-700/25'
          }`}
        />

        {/* Victory / Defeat Hero Banner */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 shadow-xl ${
              result.isWinner
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {result.isWinner ? <Trophy className="w-10 h-10" /> : <Award className="w-10 h-10" />}
          </div>

          <h1
            className={`text-3xl sm:text-4xl font-black tracking-tight uppercase ${
              result.isWinner
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500'
                : 'text-slate-300'
            }`}
          >
            {result.isWinner ? 'VICTORY!' : 'MATCH CONCLUDED'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-semibold">
            {result.gameMode.toUpperCase()} Arena Match #{result.matchId}
          </p>
        </div>

        {/* Big Score Comparison Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
          <div className="grid grid-cols-3 items-center gap-2">
            {/* You */}
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Your Score
              </span>
              <span className="text-2xl sm:text-4xl font-black text-white font-mono">
                {result.userScore}
              </span>
              <span className="text-[11px] font-bold text-amber-400 block mt-0.5">
                {result.correctAnswers} / {result.totalQuestions || 10} Correct
              </span>
            </div>

            {/* Match Status / Winner Tag */}
            <div className="text-center">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  result.correctAnswers >= 5
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {result.correctAnswers >= 5 ? 'COMPLETED' : 'LOW SCORE'}
              </span>
              <div className="text-xs font-black text-amber-400 mt-1.5 flex items-center justify-center gap-1">
                <span>+₹{result.prizeAmount} Credited</span>
              </div>
            </div>

            {/* Rival / Opponent */}
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1 truncate">
                {result.opponent?.displayName || 'Opponent'}
              </span>
              <span className="text-2xl sm:text-4xl font-black text-slate-300 font-mono">
                {result.opponent ? result.opponent.score : (result.teamBScore || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Payout & Earnings Summary Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 mb-6 text-xs text-left space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Entry Fee Paid:</span>
            <span className="font-mono font-bold text-slate-200">₹{result.entryFee}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Correct Answers ({result.correctAnswers}/10):</span>
            <span className="font-mono font-bold text-cyan-400">
              {result.correctAnswers === 5
                ? '5/10 Correct (100% Entry Fee Recovered!)'
                : result.correctAnswers > 5
                ? `${result.correctAnswers}/10 (${result.correctAnswers - 5} Extra Profit Questions)`
                : `${result.correctAnswers}/10 Questions`}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-black">
            <span className="text-slate-300">Total Money Credited to Wallet:</span>
            <span className="text-emerald-400 font-mono">₹{result.prizeAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Detailed Stats Grid (Accuracy, Speed, Correct, MMR) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <Target className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Accuracy</span>
            <span className="text-sm font-black text-white">{result.accuracy}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Avg Response</span>
            <span className="text-sm font-black text-white">{(result.avgResponseTimeMs / 1000).toFixed(2)}s</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <Zap className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">XP Gained</span>
            <span className="text-sm font-black text-indigo-400">+{result.xpGained} XP</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            {result.mmrChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            )}
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">MMR Delta</span>
            <span className={`text-sm font-black ${result.mmrChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {result.mmrChange >= 0 ? `+${result.mmrChange}` : result.mmrChange}
            </span>
          </div>
        </div>

        {/* Rank Progress Bar Widget */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 mb-6 text-left">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white">{rankInfo.tier} Rank</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-amber-400 font-bold">{user.mmr} MMR</span>
            </div>
            {rankProgress.nextTier && (
              <span className="text-slate-400 text-[11px]">Next: {rankProgress.nextTier}</span>
            )}
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full bg-gradient-to-r ${rankInfo.badgeBg} transition-all duration-500 rounded-full`}
              style={{ width: `${rankProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Financial Settlement Verification Badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <span>Settlement: Authoritative Server Confirmed</span>
          <span className="uppercase font-bold tracking-wider">{result.settlementStatus}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onViewHistory();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Match Details</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
