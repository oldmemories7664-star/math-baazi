import React from 'react';
import { Swords, Trophy, Shield, ArrowRight } from 'lucide-react';
import { GameMode } from '../types';
import { sound } from '../utils/sound';

interface GameModesViewProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenTournamentLobby: () => void;
}

export const GameModesView: React.FC<GameModesViewProps> = ({
  onSelectMode,
  onOpenTournamentLobby,
}) => {
  const modes = [
    {
      id: 'knockout' as GameMode,
      title: 'Knockout Battle',
      badge: '16 Players',
      spec: '10 Qs / Rd • 12s Timer',
      icon: Swords,
      actionText: 'Play Battle',
      actionHandler: () => onSelectMode('knockout'),
    },
    {
      id: 'mega_tournament' as GameMode,
      title: 'Mega Tournament',
      badge: '₹10,000 Pool',
      spec: 'Global Standings • 12s Timer',
      icon: Trophy,
      actionText: 'Enter Lobby',
      actionHandler: onOpenTournamentLobby,
    },
    {
      id: '4v4' as GameMode,
      title: 'Practice Arena',
      badge: 'Free Mode',
      spec: '10 Qs • 15s Timer',
      icon: Shield,
      actionText: 'Train Free',
      actionHandler: () => onSelectMode('4v4'),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight">Game Modes</h1>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Choose your math duel arena</p>
      </div>

      {/* Mode List */}
      <div className="space-y-3">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              onClick={() => {
                sound.playClick();
                m.actionHandler();
              }}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between gap-4 group shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {m.title}
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{m.spec}</p>
                </div>
              </div>

              <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-colors shrink-0">
                <span>{m.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
