import React, { useState } from 'react';
import { ArrowLeft, X, Trophy, AlertCircle, Wallet as WalletIcon } from 'lucide-react';
import { GameMode, Wallet } from '../types';
import { sound } from '../utils/sound';

interface EntryFeeModalProps {
  isOpen: boolean;
  gameMode: GameMode;
  wallet: Wallet;
  onClose: () => void;
  onConfirm: (mode: GameMode, fee: number) => void;
  onOpenDeposit: () => void;
}

export const EntryFeeModal: React.FC<EntryFeeModalProps> = ({
  isOpen,
  gameMode,
  wallet,
  onClose,
  onConfirm,
  onOpenDeposit,
}) => {
  const [selectedFee, setSelectedFee] = useState<number>(20);

  if (!isOpen) return null;

  const feeOptions = [10, 20, 50, 100, 250, 500];

  const calcPrize = (fee: number) => Math.round(fee * 1.8);
  const prize = gameMode === 'practice' ? 0 : calcPrize(selectedFee);
  const hasBalance = wallet.availableBalance >= selectedFee;

  const handleStart = () => {
    if (!hasBalance) return;
    sound.playMatchFound();
    onConfirm(gameMode, selectedFee);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-hidden">
        {/* Top Header with Back / Close Button */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-xl bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back</span>
          </button>

          <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
            {gameMode === '1v1' ? 'Speed Quiz' : gameMode.toUpperCase()}
          </span>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-black text-white">Select Match Entry Fee</h3>
          <p className="text-[11px] text-slate-400">Choose your stake to play and win cash</p>
        </div>

        {/* Entry Fee Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {feeOptions.map((fee) => {
            const isSelected = selectedFee === fee;
            return (
              <button
                key={fee}
                onClick={() => {
                  sound.playClick();
                  setSelectedFee(fee);
                }}
                className={`py-3 px-2 rounded-2xl font-black text-center transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-600 to-violet-700 text-white border-cyan-400 shadow-lg shadow-indigo-600/30 scale-[1.02]'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-sm font-black">₹{fee}</div>
                <div className={`text-[10px] font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}>
                  Win ₹{calcPrize(fee)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Wallet Balance Summary */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <WalletIcon className="w-4 h-4 text-emerald-400" />
            <span>Wallet Balance:</span>
          </div>
          <span className={`font-black ${hasBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{wallet.availableBalance.toFixed(2)}
          </span>
        </div>

        {/* Primary Action Button */}
        {hasBalance ? (
          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Play Now (₹{selectedFee})</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] text-center font-bold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Need ₹{(selectedFee - wallet.availableBalance).toFixed(0)} more in wallet</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenDeposit();
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Add Money to Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
