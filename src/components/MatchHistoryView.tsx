import React, { useState } from 'react';
import {
  History,
  Trophy,
  Swords,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Zap,
  X,
  CheckCircle2,
} from 'lucide-react';
import { MatchHistoryItem } from '../types';
import { sound } from '../utils/sound';

interface MatchHistoryViewProps {
  history: MatchHistoryItem[];
  onPlayMode: () => void;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({ history, onPlayMode }) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryItem | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Match History</h1>
          <p className="text-xs text-slate-400 mt-1">Review your recent speed battles and rewards</p>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onPlayMode();
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
        >
          Play Match
        </button>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Matches Recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Jump into a Speed Math quiz or championship tournament to build your competitive match history.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onPlayMode();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider"
          >
            Start Your First Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                sound.playClick();
                setSelectedMatch(m);
              }}
              className={`p-4 rounded-2xl glass-panel bg-slate-900/70 border transition-all cursor-pointer hover:border-slate-700 flex items-center justify-between gap-3 ${
                m.isWinner ? 'border-emerald-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    m.isWinner
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {m.isWinner ? 'WIN' : 'LOSS'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      vs {m.opponentName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold uppercase">
                      {m.gameMode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Score: <span className="font-mono text-white font-bold">{m.userScore}</span> -{' '}
                    <span className="font-mono text-slate-400">{m.opponentScore}</span> · Accuracy: {m.accuracy}% · {new Date(m.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 text-right">
                <div>
                  {m.prizeAmount > 0 && (
                    <span className="block text-xs sm:text-sm font-black text-amber-400">
                      +₹{m.prizeAmount}
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold flex items-center justify-end gap-1 ${
                      m.mmrChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {m.mmrChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {m.mmrChange >= 0 ? `+${m.mmrChange}` : m.mmrChange} MMR
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel bg-slate-900/95 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMatch(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mb-2 ${
                  selectedMatch.isWinner
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedMatch.isWinner ? 'MATCH VICTORY' : 'DEFEATED'}
              </span>
              <h3 className="text-xl font-black text-white">Match #{selectedMatch.matchId}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(selectedMatch.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your Score</span>
                <span className="text-xl font-black text-white font-mono">{selectedMatch.userScore}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
                  {selectedMatch.opponentName}
                </span>
                <span className="text-xl font-black text-slate-400 font-mono">{selectedMatch.opponentScore}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-4 mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Game Mode:</span>
                <span className="font-bold text-white uppercase">{selectedMatch.gameMode}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Entry Fee:</span>
                <span className="font-bold text-white">₹{selectedMatch.entryFee}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Prize Earned:</span>
                <span className="font-bold text-amber-400">₹{selectedMatch.prizeAmount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Accuracy:</span>
                <span className="font-bold text-cyan-400">
                  {selectedMatch.accuracy}% ({selectedMatch.correctCount} / {selectedMatch.totalQuestions} correct)
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>XP Awarded:</span>
                <span className="font-bold text-indigo-400">+{selectedMatch.xpGained} XP</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setSelectedMatch(null);
              }}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
