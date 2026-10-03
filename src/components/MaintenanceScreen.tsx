import React from 'react';
import { Wrench, ShieldAlert, RefreshCw, LogOut, PhoneCall } from 'lucide-react';
import { sound } from '../utils/sound';

interface MaintenanceScreenProps {
  message?: string;
  onRefresh: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message = 'Speed Math is undergoing scheduled infrastructure upgrades to provide faster matchmaking and instant payouts. We will be back online shortly!',
  onRefresh,
}) => {
  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-red-500 p-0.5 shadow-2xl shadow-amber-500/20 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
            <Wrench className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            🚧 Platform Maintenance
          </span>
          <h2 className="text-2xl font-black text-white">System Upgrade in Progress</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">{message}</p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Status & Refresh</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500">Your wallet balance and tournament entries remain 100% safe.</p>
      </div>
    </div>
  );
};

interface SuspendedScreenProps {
  onLogout: () => void;
  onOpenSupport: () => void;
}

export const SuspendedScreen: React.FC<SuspendedScreenProps> = ({ onLogout, onOpenSupport }) => {
  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-red-500/30 shadow-2xl shadow-red-500/10 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
            🚫 Account Restricted
          </span>
          <h2 className="text-2xl font-black text-white">Access Suspended</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account has been temporarily suspended by an administrator under fair-play or verification rules.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenSupport();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Support Desk</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onLogout();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
