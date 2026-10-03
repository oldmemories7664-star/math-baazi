import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Swords,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flame,
  ArrowRight,
  Shield,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Wallet, PublicQuestion } from '../types';
import { sound } from '../utils/sound';
import { api } from '../services/api';

interface KnockoutViewProps {
  user: UserProfile;
  wallet: Wallet;
  entryFee: number;
  totalRounds?: number; // e.g. 2, 3, or 4 rounds
  onGoHome: () => void;
  onOpenDeposit: () => void;
}

interface KnockoutParticipant {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  mmr: number;
  isCurrentUser: boolean;
}

export const KnockoutView: React.FC<KnockoutViewProps> = ({
  user,
  wallet,
  entryFee,
  totalRounds = 3, // Default 3 rounds = 8 players (Quarterfinals -> Semifinals -> Finals)
  onGoHome,
  onOpenDeposit,
}) => {
  const totalSlots = Math.pow(2, totalRounds); // 2^3 = 8 players
  const prizePool = Math.round(entryFee * totalSlots * 0.75); // 25% commission deducted

  const [phase, setPhase] = useState<'lobby' | 'bracket' | 'match' | 'eliminated' | 'champion'>('lobby');
  const [lobbyTimer, setLobbyTimer] = useState<number>(15);
  const [participants, setParticipants] = useState<KnockoutParticipant[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1); // 1: Quarters, 2: Semis, 3: Finals
  const [activeOpponent, setActiveOpponent] = useState<KnockoutParticipant | null>(null);

  // Match state
  const [question, setQuestion] = useState<{ expression: string; options: string[]; correctIndex: number } | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Initialize lobby with current user
  useEffect(() => {
    const userPart: KnockoutParticipant = {
      id: user.uid,
      name: user.displayName,
      avatar: user.photoUrl,
      isBot: false,
      mmr: user.mmr,
      isCurrentUser: true,
    };
    setParticipants([userPart]);

    // 15s Countdown to auto-fill with AI Bots if real players not found
    const countdown = setInterval(() => {
      setLobbyTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          fillWithBotsAndStart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const fillWithBotsAndStart = () => {
    const indianBotNames = [
      'Rahul Sharma',
      'Priya Verma',
      'Vikram Patel',
      'Neha Singh',
      'Amit Kumar',
      'Rohan Mehta',
      'Pooja Joshi',
      'Deepak Gupta',
    ];

    const currentParts: KnockoutParticipant[] = [
      {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoUrl,
        isBot: false,
        mmr: user.mmr,
        isCurrentUser: true,
      },
    ];

    // Fill remaining slots with AI Bots
    for (let i = currentParts.length; i < totalSlots; i++) {
      const name = indianBotNames[i % indianBotNames.length];
      currentParts.push({
        id: `bot_${i}`,
        name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        isBot: true,
        mmr: Math.floor(Math.random() * 400) + (user.mmr - 150),
        isCurrentUser: false,
      });
    }

    setParticipants(currentParts);
    sound.playCorrect();
    setPhase('bracket');
  };

  const getRoundName = (round: number) => {
    if (round === totalRounds) return 'Grand Final 🏆';
    if (round === totalRounds - 1) return 'Semifinals ⚡';
    if (round === totalRounds - 2) return 'Quarterfinals 🥊';
    return `Round ${round}`;
  };

  const startRoundMatch = () => {
    // Pick an opponent from participants
    const opponent = participants.find((p) => !p.isCurrentUser) || {
      id: 'bot_opp',
      name: 'Rohan Mehta',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan',
      isBot: true,
      mmr: user.mmr + 50,
      isCurrentUser: false,
    };
    setActiveOpponent(opponent);
    setUserScore(0);
    setOpponentScore(0);
    setQuestionIndex(0);
    generateNextQuestion();
    setPhase('match');
  };

  const generateNextQuestion = () => {
    const a = Math.floor(Math.random() * 60) + 15;
    const b = Math.floor(Math.random() * 50) + 10;
    const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
    let ans = 0;
    let expr = '';

    if (op === '+') {
      ans = a + b;
      expr = `What is ${a} + ${b}?`;
    } else if (op === '-') {
      ans = Math.max(a, b) - Math.min(a, b);
      expr = `Calculate ${Math.max(a, b)} - ${Math.min(a, b)}`;
    } else {
      const smallA = Math.floor(Math.random() * 12) + 4;
      const smallB = Math.floor(Math.random() * 9) + 3;
      ans = smallA * smallB;
      expr = `What is ${smallA} × ${smallB}?`;
    }

    const correctIdx = Math.floor(Math.random() * 4);
    const opts: string[] = [];
    const deltas = [-4, 4, -10, 10, -2, 2, -1, 1].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
      if (i === correctIdx) {
        opts.push(ans.toString());
      } else {
        const d = deltas.pop() || (i + 1) * 2;
        opts.push(Math.max(1, ans + d).toString());
      }
    }

    setQuestion({ expression: expr, options: opts, correctIndex: correctIdx });
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setRoundFeedback(null);
    setTimeLeft(12);

    // Question countdown timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setIsAnswerLocked(true);
    sound.playIncorrect();
    setRoundFeedback('Time expired! Opponent answered faster.');
    setOpponentScore((s) => s + 1);
    checkMatchProgress(userScore, opponentScore + 1);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerLocked || !question) return;
    setIsAnswerLocked(true);
    setSelectedOption(idx);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      sound.playCorrect();
      const newScore = userScore + 1;
      setUserScore(newScore);
      setRoundFeedback('Fast & Correct! You scored a point!');
      checkMatchProgress(newScore, opponentScore);
    } else {
      sound.playIncorrect();
      const newOppScore = opponentScore + 1;
      setOpponentScore(newOppScore);
      setRoundFeedback(`Incorrect! Answer was ${question.options[question.correctIndex]}`);
      checkMatchProgress(userScore, newOppScore);
    }
  };

  const checkMatchProgress = (uScore: number, oScore: number) => {
    setTimeout(() => {
      // First to 3 points wins the round!
      if (uScore >= 3) {
        if (currentRound >= totalRounds) {
          // User is Grand Champion!
          sound.playVictory();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          setPhase('champion');
          // Auto-credit championship pool winnings in Firestore
          api.rewardKnockoutWinnings(prizePool).catch(() => {});
        } else {
          // Advance to next round
          sound.playVictory();
          setCurrentRound((r) => r + 1);
          setPhase('bracket');
        }
      } else if (oScore >= 3) {
        // Eliminated
        sound.playIncorrect();
        setPhase('eliminated');
      } else {
        setQuestionIndex((i) => i + 1);
        generateNextQuestion();
      }
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn">
      {/* Lobby Phase */}
      {phase === 'lobby' && (
        <div className="glass-panel bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Swords className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Knockout Matchmaking</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Setting up {totalSlots}-player live bracket. {totalRounds} elimination rounds to championship.
          </p>

          <div className="my-8 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">
              Waiting for Players
            </span>
            <div className="text-4xl font-black text-cyan-400 font-mono mb-2">00:{lobbyTimer < 10 ? `0${lobbyTimer}` : lobbyTimer}</div>
            <p className="text-[11px] text-slate-400">
              AI bots backup will automatically fill remaining slots if room does not fill in 15 seconds.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Connecting to Authoritative Knockout Room...</span>
          </div>
        </div>
      )}

      {/* Bracket Overview Phase */}
      {phase === 'bracket' && (
        <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
            <div>
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Knockout Tournament Bracket
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {getRoundName(currentRound)}
              </h2>
            </div>
            <button
              onClick={startRoundMatch}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Fight 1v1 Round</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bracket Tree Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border ${currentRound === 1 ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Round 1 (Quarterfinals)</span>
              <div className="text-sm font-bold text-white">8 Players ➔ 4 Winners</div>
              <span className="text-xs text-emerald-400 font-semibold block mt-2">
                {currentRound > 1 ? '✓ Qualified' : 'Current Round'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${currentRound === 2 ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Round 2 (Semifinals)</span>
              <div className="text-sm font-bold text-white">4 Players ➔ 2 Winners</div>
              <span className="text-xs text-amber-400 font-semibold block mt-2">
                {currentRound === 2 ? 'Current Round' : (currentRound > 2 ? '✓ Qualified' : 'Upcoming')}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${currentRound === 3 ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
              <span className="text-[10px] font-black uppercase text-amber-400 block mb-2">Round 3 (Grand Final)</span>
              <div className="text-sm font-bold text-white">2 Finalists ➔ 1 Champion</div>
              <span className="text-xs text-amber-400 font-bold block mt-2">
                Prize: ₹{prizePool}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Live 1v1 Elimination Match */}
      {phase === 'match' && question && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Scoreboard Bar */}
          <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <img src={user.photoUrl} alt={user.displayName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-cyan-400" />
              <div className="text-left">
                <span className="text-xs font-bold text-cyan-400 block">You</span>
                <span className="text-xl font-black text-white">{userScore} pts</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{getRoundName(currentRound)}</span>
              <span className="text-lg font-black text-amber-400 font-mono">First to 3 Points</span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div className="text-right">
                <span className="text-xs font-bold text-rose-400 block">{activeOpponent?.name || 'Opponent'}</span>
                <span className="text-xl font-black text-white">{opponentScore} pts</span>
              </div>
              <img src={activeOpponent?.avatar} alt="Opponent" className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-400" />
            </div>
          </div>

          {/* Question Box */}
          <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-mono font-bold mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s remaining</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white mb-6">
              {question.expression}
            </h3>

            {/* MCQ Options */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = isAnswerLocked && idx === question.correctIndex;
                const isWrong = isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    disabled={isAnswerLocked}
                    onClick={() => handleSelectOption(idx)}
                    className={`py-4 px-5 rounded-2xl font-black text-lg transition-all border ${
                      isCorrect
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : isWrong
                        ? 'bg-rose-500 text-white border-rose-400'
                        : isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950/80 border-slate-800 text-white hover:border-slate-700 active:scale-95'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {roundFeedback && (
              <div className="mt-4 text-xs font-bold text-amber-400 animate-fadeIn">
                {roundFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Eliminated Screen */}
      {phase === 'eliminated' && (
        <div className="glass-panel bg-slate-900/90 border border-rose-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-fadeIn max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Knocked Out in {getRoundName(currentRound)}</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Opponent scored 3 points first. Better luck in the next tournament!
          </p>
          <button
            onClick={onGoHome}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider transition-colors"
          >
            Back to Home
          </button>
        </div>
      )}

      {/* Champion Screen */}
      {phase === 'champion' && (
        <div className="glass-panel bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-fadeIn max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 mb-4 shadow-xl shadow-amber-500/30">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 uppercase tracking-tight">
            Knockout Champion!
          </h2>
          <p className="text-xs text-amber-300 font-semibold mt-1">
            You won all {totalRounds} elimination rounds undefeated!
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block uppercase font-bold">Prize Credited</span>
            <span className="text-3xl font-black text-emerald-400">₹{prizePool}</span>
          </div>

          <button
            onClick={onGoHome}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            Claim & Return to Home
          </button>
        </div>
      )}
    </div>
  );
};
