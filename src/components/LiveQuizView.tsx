import React, { useEffect, useState, useRef } from 'react';
import {
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Flame,
  Users,
  Trophy,
} from 'lucide-react';
import { GameMode, MatchPlayer, PublicQuestion, AnswerResult, MatchResultData, UserProfile } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface LiveQuizViewProps {
  matchId: string;
  gameMode: GameMode;
  entryFee: number;
  user: UserProfile;
  initialPlayers: MatchPlayer[];
  onFinishMatch: (result: MatchResultData) => void;
}

export const LiveQuizView: React.FC<LiveQuizViewProps> = ({
  matchId,
  gameMode,
  entryFee,
  user,
  initialPlayers,
  onFinishMatch,
}) => {
  const [players, setPlayers] = useState<MatchPlayer[]>(initialPlayers);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(15);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'Connected' | 'Reconnecting'>('Connected');

  const timerRef = useRef<any>(null);
  const hasExpiredRef = useRef(false);

  // Subscribe to real-time match state
  useEffect(() => {
    const unsubMatch = api.onMatchUpdate(matchId, (session) => {
      if (session && session.players) {
        setPlayers([...session.players]);
      }
    });

    const unsubConn = api.onConnectionChange((status) => {
      setConnectionStatus(status === 'Disconnected' ? 'Reconnecting' : 'Connected');
    });

    return () => {
      unsubMatch();
      unsubConn();
    };
  }, [matchId]);

  // Load question when index changes
  useEffect(() => {
    hasExpiredRef.current = false;
    setIsLocked(false);
    setSelectedOption(null);
    setAnswerResult(null);
    setIsSubmitting(false);

    try {
      const q = api.getQuestion(matchId, currentQuestionIndex);
      setQuestion(q);
      setRemainingTime(q.timeLimitSeconds);

      // Start countdown
      const startTime = Date.now();
      const totalTimeMs = q.timeLimitSeconds * 1000;

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const leftSec = Math.max(0, (totalTimeMs - elapsed) / 1000);
        setRemainingTime(leftSec);

        // Sound ticks in the last 4 seconds
        if (leftSec <= 4.1 && leftSec > 0.3) {
          sound.playTick();
        }

        if (leftSec <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true;
          clearInterval(timerRef.current);
          handleTimeExpired(currentQuestionIndex);
        }
      }, 100);
    } catch (err: any) {
      console.error('Failed to load question:', err);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, matchId]);

  const handleTimeExpired = async (qIndex: number) => {
    setIsLocked(true);
    sound.playIncorrect();

    try {
      // Send -1 for expired/no answer
      const result = await api.submitAnswer(matchId, qIndex, -1);
      setAnswerResult(result);
      setStreakCount(0);
    } catch {
      // Offline or network lag
    }

    // Advance to next question after 1.8s
    setTimeout(() => {
      proceedToNext(qIndex);
    }, 1800);
  };

  const handleSelectOption = async (optionIdx: number) => {
    if (isLocked || isSubmitting || !question) return;

    sound.playClick();
    setIsLocked(true);
    setSelectedOption(optionIdx);
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await api.submitAnswer(matchId, currentQuestionIndex, optionIdx);
      setAnswerResult(res);

      if (res.isCorrect) {
        sound.playCorrect();
        setStreakCount((s) => s + 1);
      } else {
        sound.playIncorrect();
        setStreakCount(0);
      }
    } catch (err: any) {
      console.error('Answer submission error:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Auto advance to next question after 1.8 seconds transition
    setTimeout(() => {
      proceedToNext(currentQuestionIndex);
    }, 1800);
  };

  const proceedToNext = async (currentIndex: number) => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < (question?.total || 10)) {
      api.nextQuestion(matchId, nextIdx);
      setCurrentQuestionIndex(nextIdx);
    } else {
      // All questions finished! Authoritatively settle match on backend
      try {
        const finalResult = await api.settleMatch(matchId);
        onFinishMatch(finalResult);
      } catch (err: any) {
        alert(err.message || 'Error settling match.');
      }
    }
  };

  // Keyboard shortcut listener for 1, 2, 3, 4 / A, B, C, D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || isSubmitting) return;
      if (e.key === '1' || e.key.toLowerCase() === 'a') handleSelectOption(0);
      else if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelectOption(1);
      else if (e.key === '3' || e.key.toLowerCase() === 'c') handleSelectOption(2);
      else if (e.key === '4' || e.key.toLowerCase() === 'd') handleSelectOption(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isSubmitting, question]);

  const userPlayer = players.find((p) => p.uid === user.uid);
  const opponent = players.find((p) => p.uid !== user.uid);
  const teamAPlayers = players.filter((p) => p.team === 'A');
  const teamBPlayers = players.filter((p) => p.team === 'B');
  const teamAScore = teamAPlayers.reduce((sum, p) => sum + p.score, 0);
  const teamBScore = teamBPlayers.reduce((sum, p) => sum + p.score, 0);

  // Timer color shifting
  const timerPercentage = question ? (remainingTime / question.timeLimitSeconds) * 100 : 100;
  const timerColor =
    timerPercentage > 50
      ? 'from-cyan-400 to-indigo-500'
      : timerPercentage > 25
      ? 'from-amber-400 to-amber-600'
      : 'from-rose-500 to-red-600';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
      {/* Top Match Bar */}
      <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Mode & Question Progress */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-black tracking-wider uppercase border border-indigo-500/30">
              {gameMode}
            </span>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Question
              </span>
              <span className="text-sm sm:text-base font-black text-white">
                {currentQuestionIndex + 1} <span className="text-slate-500 font-semibold text-xs">/ {question?.total || 10}</span>
              </span>
            </div>
          </div>

          {/* Center: Realtime Score & Accuracy */}
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="text-center">
              <span className="text-[10px] font-bold text-cyan-400 block uppercase tracking-wider">Score</span>
              <span className="text-base sm:text-xl font-black text-white tracking-tight">
                {userPlayer?.score || 0}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Correct</span>
              <span className="text-base sm:text-xl font-black text-emerald-400 tracking-tight">
                {userPlayer?.correctCount || 0}
              </span>
            </div>
          </div>

          {/* Right: Streak & Connection */}
          <div className="flex items-center gap-2">
            {streakCount > 1 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streakCount}x Streak</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                connectionStatus === 'Connected'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-amber-400 bg-amber-500/10 animate-pulse'
              }`}
            >
              {connectionStatus === 'Connected' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* Visual Question Countdown Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
          <div
            className={`h-full bg-gradient-to-r ${timerColor} transition-all duration-100 ease-linear rounded-full`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Question & Answer Arena */}
      <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Giant Timer Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-200 text-sm font-black mb-6">
          <Clock className={`w-4 h-4 ${remainingTime <= 4 ? 'text-rose-500 animate-spin' : 'text-cyan-400'}`} />
          <span className={`font-mono text-base ${remainingTime <= 4 ? 'text-rose-400' : 'text-white'}`}>
            {remainingTime.toFixed(1)}s
          </span>
        </div>

        {/* Mathematical Expression Prompt */}
        <div className="min-h-[100px] flex items-center justify-center mb-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight font-mono select-none drop-shadow-md">
            {question ? question.expression : 'Loading...'}
          </h1>
        </div>

        {/* 4 Answer Option Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto mb-4">
          {question?.options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isChosen = selectedOption === idx;
            const isCorrectOption = answerResult && answerResult.correctOptionIndex === idx;
            const isWrongChoice = answerResult && isChosen && !answerResult.isCorrect;

            let buttonStyle = 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/60 text-slate-100';

            if (isChosen && !answerResult) {
              buttonStyle = 'bg-indigo-600 border-indigo-400 text-white animate-pulse';
            } else if (isCorrectOption) {
              buttonStyle = 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]';
            } else if (isWrongChoice) {
              buttonStyle = 'bg-rose-600/90 border-rose-400 text-white shadow-lg shadow-rose-500/30';
            }

            return (
              <button
                key={idx}
                disabled={isLocked}
                onClick={() => handleSelectOption(idx)}
                className={`group relative p-4 sm:p-5 rounded-2xl border-2 text-left font-mono font-bold text-lg sm:text-xl transition-all flex items-center justify-between active:scale-[0.98] ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-xs font-black text-cyan-400 group-hover:text-white">
                    {letter}
                  </span>
                  <span className="tracking-wide text-white">{opt}</span>
                </div>

                {isCorrectOption && <CheckCircle2 className="w-6 h-6 text-white shrink-0" />}
                {isWrongChoice && <XCircle className="w-6 h-6 text-white shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Speed Score Feedback Display */}
        {answerResult && (
          <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {answerResult.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span className={`text-sm font-black ${answerResult.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {answerResult.isCorrect ? 'CORRECT!' : 'INCORRECT'}
                </span>
              </div>
              <div className="text-right flex items-center gap-3 text-xs">
                <span className="text-slate-400 font-mono">
                  Time: {(answerResult.responseTimeMs / 1000).toFixed(2)}s
                </span>
                <span className="font-black text-cyan-400 text-sm">
                  +{answerResult.pointsEarned} PTS
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-left mt-1.5 border-t border-slate-800/80 pt-1.5">
              💡 {answerResult.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
