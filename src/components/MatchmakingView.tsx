import React, { useEffect, useState } from 'react';
import { Shield, X, Radio, Sparkles } from 'lucide-react';
import { GameMode, MatchPlayer } from '../types';
import { sound } from '../utils/sound';

interface MatchmakingViewProps {
  gameMode: GameMode;
  entryFee: number;
  userMmr: number;
  onCancel: () => void;
  onMatchFound: (players: MatchPlayer[]) => void;
  findMatchPromise: () => Promise<{ matchId: string; players: MatchPlayer[] }>;
}

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({
  gameMode,
  entryFee,
  userMmr,
  onCancel,
  onMatchFound,
  findMatchPromise,
}) => {
  const [statusText, setStatusText] = useState('Finding Opponent...');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [canCancel, setCanCancel] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    const statusTimer1 = setTimeout(() => {
      setStatusText('Searching for players with similar skill...');
    }, 1200);

    const statusTimer2 = setTimeout(() => {
      setStatusText('Matching skill bracket MMR ' + (userMmr - 50) + ' - ' + (userMmr + 50) + '...');
    }, 2400);

    const statusTimer3 = setTimeout(() => {
      setStatusText('Locking game session & server seed...');
      setCanCancel(false);
    }, 3600);

    // Call the server matchmaker
    let isCancelled = false;
    const execute = async () => {
      try {
        const res = await findMatchPromise();
        // Wait at least 3.8s for smooth immersive experience
        setTimeout(() => {
          if (!isCancelled) {
            sound.playMatchFound();
            onMatchFound(res.players);
          }
        }, 3800);
      } catch (err: any) {
        if (!isCancelled) {
          alert(err.message || 'Matchmaking failed');
          onCancel();
        }
      }
    };

    execute();

    return () => {
      isCancelled = true;
      clearInterval(timer);
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      clearTimeout(statusTimer3);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md glass-panel bg-slate-900/90 border border-slate-700/80 rounded-3xl shadow-2xl p-8 text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            {gameMode.toUpperCase()} MATCHMAKING
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            Fee: ₹{entryFee}
          </span>
        </div>

        {/* Animated Radar Scanning Element */}
        <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-indigo-500/20" />
          <div className="absolute inset-6 rounded-full border border-cyan-500/25" />
          <div className="absolute inset-12 rounded-full border border-indigo-500/30" />
          <div className="absolute inset-20 rounded-full border border-cyan-400/40" />

          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-800" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-800" />

          {/* Rotating radar beam */}
          <div className="absolute inset-0 rounded-full animate-radar origin-center">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/40 to-transparent rounded-tl-full" />
          </div>

          {/* Center glowing node */}
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-1 mb-8">
          <h3 className="text-xl font-black text-white tracking-tight animate-pulse">
            {statusText}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Elapsed Time: {formatTime(elapsedSeconds)} · Est. Wait: ~0:08
          </p>
        </div>

        {/* Cancel Button */}
        {canCancel ? (
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Cancel Matchmaking (Refund ₹{entryFee})</span>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-400 py-3">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Players found! Initializing duel arena...</span>
          </div>
        )}
      </div>
    </div>
  );
};
