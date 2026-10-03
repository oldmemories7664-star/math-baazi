import React, { useState, useEffect } from 'react';
import { Shield, Key, Check, RefreshCw, X, AlertCircle, Save, Zap, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface AdminPaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPaymentConfigModal: React.FC<AdminPaymentConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [minAmount, setMinAmount] = useState(10);
  const [maxAmount, setMaxAmount] = useState(200000);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const cfg = await api.getZapConfig();
      setApiKey(cfg.zapKey || '');
      setEnabled(cfg.enabled);
      setMinAmount(cfg.minAmount);
      setMaxAmount(cfg.maxAmount);
    } catch (err: any) {
      console.error('Failed to load ZapUPI config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSaving(true);
    setStatusMsg(null);

    if (!apiKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid ZapUPI API Key.' });
      setIsSaving(false);
      sound.playIncorrect();
      return;
    }

    try {
      await api.updatePaymentGatewayConfig({
        api_key: apiKey.trim(),
        enabled,
        min_amount: minAmount,
        max_amount: maxAmount,
      });

      sound.playCoin();
      setStatusMsg({ type: 'success', text: 'Payment Gateway config updated successfully in Firestore!' });
    } catch (err: any) {
      sound.playIncorrect();
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update Firestore payment config.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Payment Gateway Config
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  game_config / payment
                </span>
              </h3>
              <p className="text-xs text-slate-400">Manage ZapUPI API Key & Deposit Limits</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs font-bold">Fetching game_config / payment from Firestore...</p>
            </div>
          ) : (
            <>
              {statusMsg && (
                <div
                  className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  ZapUPI API Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="e.g. zapcaf328dc7bb4..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono tracking-wide"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Fetched directly from Firestore document path: <code className="text-indigo-400 font-mono">game_config/payment</code> → <code className="text-indigo-400 font-mono">zapupi.api_key</code>
                </p>
              </div>

              {/* Status & Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Gateway Status</p>
                    <p className="text-[10px] text-slate-400">Enable or disable ZapUPI instant deposits</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Min & Max Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-cyan-400" />
                    Min Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-cyan-400" />
                    Max Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={loadConfig}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Firestore...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Payment Config
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
