import React from 'react';
import {
  Home,
  Gamepad2,
  Trophy,
  Wallet as WalletIcon,
  User,
  Bell,
  Plus,
  Wifi,
  WifiOff,
  MessageSquare,
  PhoneCall,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, Wallet as WalletType, AppNotification } from '../types';
import { sound } from '../utils/sound';

interface NavigationProps {
  currentTab: 'home' | 'play' | 'leaderboard' | 'wallet' | 'profile';
  onSelectTab: (tab: 'home' | 'play' | 'leaderboard' | 'wallet' | 'profile') => void;
  user: UserProfile | null;
  wallet: WalletType;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onOpenChat?: () => void;
  onOpenSupport?: () => void;
  connectionStatus: 'Connected' | 'Reconnecting' | 'Disconnected';
  onToggleConnectionDemo?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  user,
  wallet,
  notifications,
  onOpenNotifications,
  onOpenDeposit,
  onOpenAuth,
  onOpenChat,
  onOpenSupport,
  connectionStatus,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectTab('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-400 font-black text-xl tracking-tighter">
                  ∑x
                </span>
              </div>
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SPEEDMATH
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  ARENA
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'play', label: 'Play Modes', icon: Gamepad2 },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'wallet', label: 'Wallet', icon: WalletIcon },
              { id: 'profile', label: 'Profile', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectTab(tab.id as any);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Live Chat Button */}
            {onOpenChat && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenChat();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 text-xs font-bold transition-all active:scale-95"
                title="Community Chat"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}

            {/* Support Desk Button */}
            {onOpenSupport && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSupport();
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                title="Support Desk"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </button>
            )}

            {/* Connection Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border ${
                connectionStatus === 'Connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : connectionStatus === 'Reconnecting'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
              title={`Network: ${connectionStatus}`}
            >
              {connectionStatus === 'Connected' ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenNotifications();
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-all active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center border-2 border-slate-950 animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Wallet Balance Pill */}
            {user ? (
              <div
                onClick={() => {
                  sound.playClick();
                  onSelectTab('wallet');
                }}
                className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner cursor-pointer hover:border-slate-600 transition-all"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Balance</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400 tracking-tight leading-none">
                    ₹{wallet.availableBalance.toFixed(0)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onOpenDeposit();
                  }}
                  title="Add Money"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAuth();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-lg px-2 py-1.5">
        <div className="grid grid-cols-5 gap-1">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'play', label: 'Play', icon: Gamepad2 },
            { id: 'leaderboard', label: 'Ranks', icon: Trophy },
            { id: 'wallet', label: 'Wallet', icon: WalletIcon },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTab(tab.id as any);
                }}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-indigo-500/10 font-bold'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'} transition-transform`} />
                  {tab.id === 'wallet' && wallet.availableBalance > 0 && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
