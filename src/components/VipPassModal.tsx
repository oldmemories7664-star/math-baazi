import React, { useState } from 'react';
import { X, Crown, Check, Zap, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { VipPass, Wallet, UserProfile } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface VipPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  vipPasses: VipPass[];
  user: UserProfile;
  wallet: Wallet;
  onOpenDeposit: () => void;
  onSuccess: (updatedUser: UserProfile) => void;
}

export const VipPassModal: React.FC<VipPassModalProps> = ({
  isOpen,
  onClose,
  vipPasses,
  user,
  wallet,
  onOpenDeposit,
  onSuccess,
}) => {
  const [selectedPassId, setSelectedPassId] = useState<string>(vipPasses[1]?.id || vipPasses[0]?.id || 'vip_silver');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPass = vipPasses.find((p) => p.id === selectedPassId) || vipPasses[0];
  const isAffordable = wallet.availableBalance >= (currentPass?.price || 0);

  const handlePurchase = async () => {
    if (!currentPass) return;
    setErrorMsg(null);
    setIsProcessing(true);
    sound.playClick();

    try {
      const updated = await api.purchaseVipPass(currentPass.id);
      sound.playVictory();
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      sound.playIncorrect();
      setErrorMsg(err?.message || 'Could not complete VIP purchase.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel bg-slate-900/95 border border-amber-500/40 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Math Baazi VIP Passes</h2>
              <span className="text-[11px] text-amber-400 font-semibold">Automatic Entry Fee Discounts & Perks</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Status */}
        {user.vipPassId && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Active VIP: {user.vipPassId.toUpperCase()}</span>
            </div>
            {user.vipExpiresAt && (
              <span className="text-[10px] text-slate-400 font-mono">
                Expires: {new Date(user.vipExpiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Passes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
          {vipPasses.map((pass) => {
            const isSelected = selectedPassId === pass.id;
            return (
              <div
                key={pass.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedPassId(pass.id);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                    {pass.badge}
                  </span>
                  <div className="mt-1">
                    <span className="text-lg font-black text-white">₹{pass.price}</span>
                    <span className="text-[10px] text-slate-400">/{pass.validityDays}d</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black">
                    {pass.discountPercent}% OFF
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Pass Features Breakdown */}
        {currentPass && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-black text-white">{currentPass.title} Benefits</span>
              <span className="text-xs font-black text-cyan-400">{currentPass.discountPercent}% Flat Discount</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              {currentPass.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-amber-300">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-2.5 h-2.5" />
                </div>
                <span>Automatic discount on tournament & speed quiz entry fees</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Balance</span>
            <span className="text-sm font-black text-emerald-400">₹{wallet.availableBalance.toFixed(0)}</span>
          </div>

          {isAffordable ? (
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              {isProcessing ? 'Activating...' : `Activate for ₹${currentPass?.price}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenDeposit();
                onClose();
              }}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Add ₹{(currentPass?.price || 0) - wallet.availableBalance} to Activate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
