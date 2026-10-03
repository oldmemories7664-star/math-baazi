import React, { useEffect, useState } from 'react';
import { Swords, Trophy, Zap, ShieldAlert } from 'lucide-react';
import { GameMode, MatchPlayer, UserProfile } from '../types';
import { RANK_TIERS } from '../utils/ranks';
import { sound } from '../utils/sound';

interface MatchFoundViewProps {
  gameMode: GameMode;
  entryFee: number;
  user: UserProfile;
  players: MatchPlayer[];
  onStartGame: () => void;
}

export const MatchFoundView: React.FC<MatchFoundViewProps> = ({
  gameMode,
  entryFee,
  user,
  players,
  onStartGame,
}) => {
  const [countdown, setCountdown] = useState<number | string>(3);

  useEffect(() => {
    sound.playMatchFound();

    const t1 = setTimeout(() => {
      setCountdown(2);
      sound.playCountdownBeep(false);
    }, 1000);

    const t2 = setTimeout(() => {
      setCountdown(1);
      sound.playCountdownBeep(false);
    }, 2000);

    const t3 = setTimeout(() => {
      setCountdown('START!');
      sound.playCountdownBeep(true);
    }, 3000);

    const t4 = setTimeout(() => {
      onStartGame();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const opponent = players.find((p) => p.uid !== user.uid);
  const teamAPlayers = players.filter((p) => p.team === 'A');
  const teamBPlayers = players.filter((p) => p.team === 'B');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl glass-panel bg-slate-900/95 border border-indigo-500/40 rounded-3xl shadow-2xl p-6 sm:p-10 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-b from-indigo-500/30 to-transparent blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-widest uppercase mb-2 animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            MATCH FOUND
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            {gameMode} Speed Arena
          </h2>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mt-1 font-semibold">
            <span>Fee: ₹{entryFee}</span>
            <span>•</span>
            <span>10 Speed Questions</span>
            <span>•</span>
            <span>15s Timer</span>
          </div>
        </div>

        {/* Players Matchup Arena */}
        {gameMode === '1v1' ? (
          <div className="grid grid-cols-5 items-center gap-2 sm:gap-4 my-8 max-w-lg mx-auto">
            {/* Player 1 (You) */}
            <div className="col-span-2 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-center relative group">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
                <img
                  src={user.photoUrl}
                  alt={user.displayName}
                  className="w-full h-full rounded-2xl object-cover ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-indigo-600 text-[10px] font-black uppercase text-white shadow">
                  YOU
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white truncate">{user.displayName}</h4>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-bold text-amber-400">
                <span>{user.rank}</span>
                <span>•</span>
                <span>{user.mmr} MMR</span>
              </div>
            </div>

            {/* VS Badge */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950 border-2 border-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Swords className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="col-span-2 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center relative group">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
                <img
                  src={opponent?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={opponent?.displayName}
                  className="w-full h-full rounded-2xl object-cover ring-2 ring-rose-500 shadow-lg shadow-rose-500/30"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-rose-600 text-[10px] font-black uppercase text-white shadow">
                  RIVAL
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white truncate">
                {opponent?.displayName || 'Opponent'}
              </h4>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-bold text-amber-400">
                <span>{opponent?.rank || 'Gold'}</span>
                <span>•</span>
                <span>{opponent?.mmr || 1520} MMR</span>
              </div>
            </div>
          </div>
        ) : (
          /* 2v2 or 4v4 Squad Roster Display */
          <div className="grid grid-cols-2 gap-4 my-6">
            {/* Team A */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-left">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-500/20">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">TEAM ALPHA</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  YOUR TEAM
                </span>
              </div>
              <div className="space-y-2">
                {teamAPlayers.map((p) => (
                  <div key={p.uid} className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900/60">
                    <img src={p.photoUrl} alt={p.displayName} className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-100 truncate">
                        {p.displayName} {p.uid === user.uid && '(You)'}
                      </p>
                      <p className="text-[10px] text-amber-400 font-semibold">{p.mmr} MMR · {p.rank}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-left">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-500/20">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider">TEAM OMEGA</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  RIVALS
                </span>
              </div>
              <div className="space-y-2">
                {teamBPlayers.map((p) => (
                  <div key={p.uid} className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900/60">
                    <img src={p.photoUrl} alt={p.displayName} className="w-8 h-8 rounded-lg object-cover ring-1 ring-rose-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-100 truncate">{p.displayName}</p>
                      <p className="text-[10px] text-amber-400 font-semibold">{p.mmr} MMR · {p.rank}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* START COUNTDOWN */}
        <div className="mt-4">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-widest block mb-2">
            Match Begins In
          </span>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-950 border-2 border-cyan-400 shadow-xl shadow-cyan-500/30">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 animate-pulse">
              {countdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
