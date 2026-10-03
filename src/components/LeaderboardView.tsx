import React, { useState } from 'react';
import { Trophy, Crown, Search, Target, TrendingUp, Sparkles, X } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

export const LeaderboardView: React.FC = () => {
  const [period, setPeriod] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = api.getCurrentUser();
  const entries: LeaderboardEntry[] = api.getLeaderboard(period);

  const filteredEntries = entries.filter(
    (e) =>
      e.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = entries.slice(0, 3);
  const myEntry = entries.find((e) => e.isCurrentUser || e.uid === currentUser?.uid);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeIn pb-24">
      {/* Clean Native Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">Top players ranked by skill rating</p>
        </div>

        {myEntry && (
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
            <span>Your Rank:</span>
            <span className="font-black text-white">#{myEntry.rank}</span>
          </div>
        )}
      </div>

      {/* TARGETED ELEMENTS: Segmented Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        {/* Segmented Period Tabs */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto shrink-0 shadow-sm">
          {(['global', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                sound.playClick();
                setPeriod(p);
              }}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Clean Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && !searchQuery && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
          {/* 2nd Place */}
          {top3[1] ? (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center relative">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-black flex items-center justify-center mb-1.5">
                2
              </span>
              <img
                src={top3[1].photoUrl}
                alt={top3[1].displayName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-400 mb-1.5"
              />
              <span className="font-bold text-xs text-white truncate max-w-[90px]">{top3[1].displayName}</span>
              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{top3[1].rankTier}</span>
              <span className="text-xs font-black text-cyan-400 mt-1">{top3[1].mmr} MMR</span>
            </div>
          ) : <div />}

          {/* 1st Place */}
          {top3[0] ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/50 text-center flex flex-col items-center justify-center relative shadow-lg shadow-amber-500/5">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center mb-1 shadow-sm">
                <Crown className="w-3.5 h-3.5 fill-current" />
              </div>
              <img
                src={top3[0].photoUrl}
                alt={top3[0].displayName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-400 mb-1.5 shadow-md"
              />
              <span className="font-black text-xs text-white truncate max-w-[100px]">{top3[0].displayName}</span>
              <span className="text-[10px] font-bold text-amber-400 block mt-0.5">{top3[0].rankTier}</span>
              <span className="text-sm font-black text-amber-300 mt-1">{top3[0].mmr} MMR</span>
            </div>
          ) : <div />}

          {/* 3rd Place */}
          {top3[2] ? (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center relative">
              <span className="w-5 h-5 rounded-full bg-amber-800 text-amber-200 text-[10px] font-black flex items-center justify-center mb-1.5">
                3
              </span>
              <img
                src={top3[2].photoUrl}
                alt={top3[2].displayName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-700 mb-1.5"
              />
              <span className="font-bold text-xs text-white truncate max-w-[90px]">{top3[2].displayName}</span>
              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{top3[2].rankTier}</span>
              <span className="text-xs font-black text-amber-400 mt-1">{top3[2].mmr} MMR</span>
            </div>
          ) : <div />}
        </div>
      )}

      {/* Clean Native Leaderboard List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            No players found.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredEntries.map((player) => (
              <div
                key={player.uid}
                className={`p-3 sm:p-3.5 flex items-center justify-between transition-colors ${
                  player.isCurrentUser
                    ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Rank + Avatar + Name */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-black text-xs ${
                      player.rank === 1
                        ? 'text-amber-400'
                        : player.rank === 2
                        ? 'text-slate-300'
                        : player.rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    #{player.rank}
                  </span>

                  <img
                    src={player.photoUrl}
                    alt={player.displayName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-white">{player.displayName}</span>
                      {player.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600 font-bold text-white uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {player.rankTier} • {player.wins} Wins
                    </span>
                  </div>
                </div>

                {/* Right: MMR Rating */}
                <div className="text-right">
                  <span className="font-mono font-black text-xs sm:text-sm text-cyan-300">
                    {player.mmr}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase -mt-0.5">MMR</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
