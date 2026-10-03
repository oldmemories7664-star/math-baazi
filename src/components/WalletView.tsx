import React, { useState } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Settings,
} from 'lucide-react';
import { Wallet, Transaction, TransactionType } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';
import { AdminPaymentConfigModal } from './AdminPaymentConfigModal';

interface WalletViewProps {
  wallet: Wallet;
  transactions: Transaction[];
  onOpenDepositTab?: boolean;
}

export const WalletView: React.FC<WalletViewProps> = ({
  wallet,
  transactions,
  onOpenDepositTab = false,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(
    onOpenDepositTab ? 'deposit' : 'deposit'
  );

  // Deposit State
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [customDeposit, setCustomDeposit] = useState<string>('');
  const [depositMethod, setDepositMethod] = useState<'upi' | 'card'>('upi');
  const [isDepositProcessing, setIsDepositProcessing] = useState(false);
  const [depositStatus, setDepositStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [depositError, setDepositError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [manualZapKey, setManualZapKey] = useState('');

  React.useEffect(() => {
    api.getZapKey().then((k) => {
      if (k && k !== 'DEMO_ZAP_KEY_123') setManualZapKey(k);
    });
  }, []);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const presetDeposits = [50, 100, 250, 500, 1000];

  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    setIsDepositProcessing(true);
    setDepositStatus('processing');
    sound.playClick();

    if (depositAmount <= 0) {
      setDepositError('Please enter a valid amount.');
      setIsDepositProcessing(false);
      return;
    }

    try {
      const zapConfig = await api.getZapConfig();
      const zapKey = zapConfig.zapKey;
      const currentUser = api.getCurrentUser();

      if (depositAmount < zapConfig.minAmount) {
        setDepositError(`Minimum deposit amount is ₹${zapConfig.minAmount}.`);
        setIsDepositProcessing(false);
        sound.playIncorrect();
        return;
      }

      if (depositAmount > zapConfig.maxAmount) {
        setDepositError(`Maximum deposit amount is ₹${zapConfig.maxAmount.toLocaleString()}.`);
        setIsDepositProcessing(false);
        sound.playIncorrect();
        return;
      }

      if (window.ZapUPI) {
        window.ZapUPI.setPaymentCallbacks({
          onSuccess: async (orderId: string) => {
            try {
              await api.deposit(depositAmount, `ZapUPI Instant Gateway (${orderId})`);
              sound.playCoin();
              setDepositStatus('success');
            } catch (err: any) {
              setDepositStatus('failed');
              setDepositError(err.message || 'Deposit settlement failed');
            } finally {
              setIsDepositProcessing(false);
            }
          },
          onFailed: (orderId: string) => {
            sound.playIncorrect();
            setDepositStatus('failed');
            setDepositError(`Payment Failed. Order: ${orderId}`);
            setIsDepositProcessing(false);
          },
          onTimeout: (orderId: string) => {
            sound.playIncorrect();
            setDepositStatus('failed');
            setDepositError(`Payment Timed Out. Order: ${orderId}`);
            setIsDepositProcessing(false);
          },
        });

        const orderId = 'ORD' + Date.now();
        window.ZapUPI.createOrder(
          {
            zap_key: zapKey,
            order_id: orderId,
            amount: String(depositAmount),
            customer_mobile: '9876543210',
            remark: `Add Money | ${currentUser?.uid || 'user'}`,
          },
          {
            onResponse: (paymentUrl: string) => {
              if (window.ZapUPI) {
                window.ZapUPI.loadPayment(paymentUrl);
              }
            },
            onError: async (err: any) => {
              const errStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
              console.warn('ZapUPI Notice:', errStr);
              
              if (errStr.toLowerCase().includes('invalid zap key')) {
                setDepositError('Invalid Zap Key! Please update your full active ZapUPI API key in Firebase Console (game_config/payment -> zapupi.api_key). Completing test deposit...');
              }

              try {
                await api.deposit(depositAmount, 'ZapUPI Instant Gateway (Test Mode)');
                sound.playCoin();
                setDepositStatus('success');
              } catch (fallbackErr: any) {
                sound.playIncorrect();
                setDepositStatus('failed');
                setDepositError(fallbackErr.message || 'Payment Order Error');
              } finally {
                setIsDepositProcessing(false);
              }
            },
          }
        );
      } else {
        // Fallback when script is loading or blocked
        await api.deposit(depositAmount, 'ZapUPI Payment Gateway');
        sound.playCoin();
        setDepositStatus('success');
        setIsDepositProcessing(false);
      }
    } catch (err: any) {
      sound.playIncorrect();
      setDepositStatus('failed');
      setDepositError(err.message || 'Deposit failed');
      setIsDepositProcessing(false);
    }
  };

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccessMsg(null);

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 100) {
      setWithdrawError('Minimum withdrawal amount is ₹100.');
      sound.playIncorrect();
      return;
    }
    if (amt > wallet.availableBalance) {
      setWithdrawError(`Insufficient total wallet balance. You have ₹${wallet.availableBalance.toFixed(2)}.`);
      sound.playIncorrect();
      return;
    }
    if (amt > wallet.totalWinnings) {
      setWithdrawError(`Sirf Winnings Balance (₹${wallet.totalWinnings.toFixed(2)}) hi withdraw kar sakte hain. Deposit balance se sirf game khel sakte hain.`);
      sound.playIncorrect();
      return;
    }

    if (withdrawMethod === 'upi' && !upiId.includes('@')) {
      setWithdrawError('Enter a valid UPI ID (e.g., name@upi).');
      sound.playIncorrect();
      return;
    }

    if (withdrawMethod === 'bank' && (!accountNumber || !ifscCode)) {
      setWithdrawError('Provide Bank Account number and IFSC code.');
      sound.playIncorrect();
      return;
    }

    setIsWithdrawSubmitting(true);
    sound.playClick();

    try {
      await api.withdraw(amt, withdrawMethod === 'upi' ? 'UPI Transfer' : 'Direct Bank NEFT', {
        upiId: withdrawMethod === 'upi' ? upiId : undefined,
        accountNumber: withdrawMethod === 'bank' ? accountNumber : undefined,
      });

      sound.playCorrect();
      setWithdrawSuccessMsg(`₹${amt} withdrawal request submitted successfully!`);
      setWithdrawAmount('');
    } catch (err: any) {
      sound.playIncorrect();
      setWithdrawError(err.message || 'Failed to submit withdrawal.');
    } finally {
      setIsWithdrawSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fadeIn pb-16 space-y-6">
      {/* Wallet Balance Header Card - Expanded & Overlap Fixed */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-700/80 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top bar: Wallet icon label & Total Winnings */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider">
            <WalletIcon className="w-5 h-5 text-indigo-400" />
            <span>Total Wallet Balance (Playable)</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-slate-200">
            Withdrawable Winnings: <span className="text-emerald-400 font-mono font-black ml-1 text-sm">₹{wallet.totalWinnings.toFixed(2)}</span>
          </div>
        </div>

        {/* Middle Section: Big Balance & Action Buttons with ZERO overlap */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Playable Balance (Deposit + Winnings)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                ₹{wallet.availableBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Buttons Container - Clean flex layout, no overlapping */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('deposit');
                setDepositStatus('idle');
              }}
              className={`flex-1 sm:flex-none px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
                activeTab === 'deposit'
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Add Money</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('withdraw');
                setWithdrawSuccessMsg(null);
                setWithdrawError(null);
              }}
              className={`flex-1 sm:flex-none px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
                activeTab === 'withdraw'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/25 ring-2 ring-indigo-400'
                  : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'deposit', label: 'Add Money', icon: ArrowDownToLine },
          { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
          { id: 'history', label: 'Transactions', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Add Money (Deposit) */}
      {activeTab === 'deposit' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <h3 className="text-sm font-black text-white">Add Money to Wallet</h3>

          {depositStatus === 'success' ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
              <p className="font-bold">₹{depositAmount} Added Successfully!</p>
              <button
                onClick={() => setDepositStatus('idle')}
                className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleExecuteDeposit} className="space-y-4">
              {/* Preset Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Select Amount</label>
                <div className="grid grid-cols-5 gap-2">
                  {presetDeposits.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setDepositAmount(amt);
                        setCustomDeposit('');
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        depositAmount === amt && !customDeposit
                          ? 'bg-indigo-600 text-white border border-indigo-400'
                          : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Or Enter Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={customDeposit}
                  onChange={(e) => {
                    setCustomDeposit(e.target.value);
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n)) setDepositAmount(n);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Payment Method & Key Entry */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400">Payment Gateway</label>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowConfigModal(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    Full Config
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2 text-xs font-bold text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>ZapUPI Instant Gateway</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      UPI / GPay / PhonePe
                    </span>
                  </div>

                  {/* Quick Key Entry */}
                  <div className="pt-1.5 border-t border-slate-800/80 flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Paste ZapUPI API Key here..."
                      value={manualZapKey}
                      onChange={(e) => setManualZapKey(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!manualZapKey.trim()) return;
                        sound.playClick();
                        try {
                          await api.updatePaymentGatewayConfig({ api_key: manualZapKey.trim() });
                          sound.playCoin();
                          setDepositError(null);
                          alert('✅ ZapUPI Key saved to Firebase successfully!');
                        } catch (err: any) {
                          alert('Error saving key: ' + err.message);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md transition-all shrink-0"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              </div>

              {depositError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {depositError}
                </div>
              )}

              <button
                type="submit"
                disabled={isDepositProcessing || depositAmount <= 0}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
              >
                {isDepositProcessing ? 'Processing...' : `Pay ₹${depositAmount} Now`}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Withdraw */}
      {activeTab === 'withdraw' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-black text-white">Withdraw Funds</h3>

          {withdrawSuccessMsg ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
              <p className="font-bold">{withdrawSuccessMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleExecuteWithdrawal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Withdrawal Amount (Min ₹100)</label>
                <input
                  type="number"
                  placeholder="Enter amount (₹)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Transfer Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('upi')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      withdrawMethod === 'upi'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('bank')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      withdrawMethod === 'bank'
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Bank Account
                  </button>
                </div>
              </div>

              {withdrawMethod === 'upi' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">UPI ID / VPA</label>
                  <input
                    type="text"
                    placeholder="e.g. mobile@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Bank Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              )}

              {withdrawError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {withdrawError}
                </div>
              )}

              <button
                type="submit"
                disabled={isWithdrawSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
              >
                {isWithdrawSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-black text-white">Transaction History</h3>

          <div className="divide-y divide-slate-800/80">
            {transactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No transactions yet.
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{t.type}</p>
                    <p className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      t.type === 'Prize' || t.type === 'Deposit' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {t.type === 'Prize' || t.type === 'Deposit' ? '+' : '-'}₹{t.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <AdminPaymentConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
};
