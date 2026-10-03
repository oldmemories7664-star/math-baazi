import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { TournamentLobby, TournamentHistoryItem, Wallet } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface MegaTournamentViewProps {
  wallet: Wallet;
  onJoinTournamentGame: (tournId: string, fee: number) => void;
  onOpenDeposit: () => void;
}

export const MegaTournamentView: React.FC<MegaTournamentViewProps> = ({
  wallet,
  onJoinTournamentGame,
  onOpenDeposit,
}) => {
  const [lobbies, setLobbies] = useState<TournamentLobby[]>([]);
  const [history, setHistory] = useState<TournamentHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'lobbies' | 'history'>('lobbies');
  const [selectedLobby, setSelectedLobby] = useState<TournamentLobby | null>(null);
  const [countdown, setCountdown] = useState<number>(145);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const list = api.getTournaments();
    setLobbies(list);
    if (list.length > 0) setSelectedLobby(list[0]);
    setHistory(api.getTournamentHistory());

    const t = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 180));
    }, 1000);

    return () => clearInterval(t);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRegister = () => {
    if (!selectedLobby) return;
    sound.playClick();

    if (wallet.availableBalance < selectedLobby.entryFee) {
      alert(`Insufficient balance. You need ₹${selectedLobby.entryFee} to enter this tournament.`);
      return;
    }

    setIsRegistered(true);
    sound.playCoin();

    // After 2.5s simulation, start tournament quiz
    setTimeout(() => {
      onJoinTournamentGame(selectedLobby.id, selectedLobby.entryFee);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>100-PLAYER TOURNAMENT CIRCUIT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Mega Speed Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compete in massive scheduled player pools for high-tier grand prizes.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('lobbies');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lobbies'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Lobbies
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tournament History
          </button>
        </div>
      </div>

      {activeTab === 'lobbies' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tournament selection cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Lobbies</h3>
            {lobbies.map((lobby) => {
              const isSelected = selectedLobby?.id === lobby.id;
              return (
                <div
                  key={lobby.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedLobby(lobby);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-extrabold text-sm sm:text-base text-white">{lobby.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black shrink-0">
                      ₹{lobby.entryFee} Entry
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {lobby.playersJoined} / {lobby.maxPlayers} Joined
                    </span>
                    <span className="font-bold text-emerald-400">₹{lobby.totalPrizePool} Pool</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Tournament Details and Registration */}
          {selectedLobby && (
            <div className="lg:col-span-2 glass-panel bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedLobby.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">15 Rapid Math MCQs · Top 10 Placements Paid</p>
                </div>
                {/* Live Countdown */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting In</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {formatCountdown(countdown)}
                  </span>
                </div>
              </div>

              {/* Progress & Stats */}
              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Players</span>
                  <span className="text-sm font-black text-white">
                    {selectedLobby.playersJoined} / {selectedLobby.maxPlayers}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Prize</span>
                  <span className="text-sm font-black text-amber-400">₹{selectedLobby.totalPrizePool}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Entry Fee</span>
                  <span className="text-sm font-black text-cyan-400">₹{selectedLobby.entryFee}</span>
                </div>
              </div>

              {/* Prize Distribution Table */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Authoritative Prize Distribution
                </h4>
                <div className="space-y-1.5">
                  {selectedLobby.prizeDistribution.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                    >
                      <span className="font-bold text-slate-200">{tier.rankRange}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{tier.percentage}%</span>
                        <span className="font-black text-amber-400">₹{tier.prize}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registration CTA */}
              {isRegistered ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm mb-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>You are registered for this Mega Tournament!</span>
                  </div>
                  <p className="text-xs text-slate-400 animate-pulse">
                    Connecting to server lobby and generating 100-player synchronized room...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleRegister}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Enter Tournament for ₹{selectedLobby.entryFee}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Tournament History Tab */
        <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="font-black text-lg text-white mb-4">Past Tournament Performance</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(item.date).toLocaleDateString()} · {item.totalPlayers} Competitors · Score: {item.score}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-400">Rank #{item.finalRank}</span>
                  <span className="block text-xs font-bold text-emerald-400">
                    {item.prizeEarned > 0 ? `+₹${item.prizeEarned} Won` : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
