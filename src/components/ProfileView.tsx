import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Award,
  Zap,
  Flame,
  Target,
  Clock,
  Settings,
  ShieldAlert,
  HelpCircle,
  FileText,
  LogOut,
  Edit2,
  Check,
  Volume2,
  VolumeX,
  Bell,
  Smartphone,
  CheckCircle2,
  Camera,
  History,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  X,
} from 'lucide-react';
import { UserProfile, MatchHistoryItem } from '../types';
import { RANK_TIERS, getRankProgress, calculateLevelFromXp } from '../utils/ranks';
import { sound } from '../utils/sound';
import { api } from '../services/api';

interface ProfileViewProps {
  user: UserProfile;
  recentMatches?: MatchHistoryItem[];
  onPlayMode?: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  recentMatches = [],
  onPlayMode,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'stats' | 'history' | 'edit' | 'settings' | 'responsible' | 'help' | null
  >(null);

  // Edit fields
  const [displayName, setDisplayName] = useState(user.displayName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(sound.getEnabled());
  const [vibrationEnabled, setVibrationEnabled] = useState(user.preferences.vibrationEnabled);
  const [pushNotifs, setPushNotifs] = useState(user.preferences.pushNotifications);

  // Responsible play
  const [depositLimit, setDepositLimit] = useState(user.preferences.responsiblePlay.dailyDepositLimit);
  const [matchLimit, setMatchLimit] = useState(user.preferences.responsiblePlay.dailyMatchLimit);
  const [sessionLimit, setSessionLimit] = useState(user.preferences.responsiblePlay.sessionLimitMinutes);
  const [responsibleNotice, setResponsibleNotice] = useState<string | null>(null);

  // Selected match detail for modal
  const [selectedHistoryMatch, setSelectedHistoryMatch] = useState<MatchHistoryItem | null>(null);

  // Legal Modal
  const [showLegalModal, setShowLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const rankInfo = RANK_TIERS[user.rank];
  const rankProgress = getRankProgress(user.mmr);
  const levelInfo = calculateLevelFromXp(user.xp);

  const profileTabs = [
    {
      id: 'stats',
      label: 'Career Stats',
      desc: 'Performance, accuracy, win rate & milestones',
      icon: Award,
      badge: `${user.stats.wins} Wins`,
    },
    {
      id: 'history',
      label: 'Match History',
      desc: 'Recent 1v1, Knockout & Tournament games',
      icon: Clock,
      badge: `${recentMatches.length} Games`,
    },
    {
      id: 'edit',
      label: 'Edit Profile & Photo',
      desc: 'Custom avatar, photo upload & display name',
      icon: Edit2,
      badge: 'Edit',
    },
    {
      id: 'settings',
      label: 'Preferences & Audio',
      desc: 'Sound effects, haptics & notifications',
      icon: Settings,
      badge: soundEnabled ? 'Sound On' : 'Muted',
    },
    {
      id: 'responsible',
      label: 'Responsible Play',
      desc: 'Daily limits & gameplay controls',
      icon: ShieldAlert,
      badge: 'Protected',
    },
    {
      id: 'help',
      label: 'Help & Policies',
      desc: 'Rules of play, Fairplay & legal terms',
      icon: HelpCircle,
      badge: 'Support',
    },
  ];

  const avatarPool = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  ];

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid photo file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB.');
      return;
    }

    setUploadError(null);
    sound.playClick();

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    sound.playClick();

    try {
      await api.updateProfile({
        displayName,
        photoUrl,
      });
      setSaveSuccess(true);
      sound.playCorrect();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
      sound.playIncorrect();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveResponsiblePlay = async () => {
    sound.playClick();
    try {
      await api.updateProfile({
        preferences: {
          responsiblePlay: {
            dailyDepositLimit: depositLimit,
            dailyMatchLimit: matchLimit,
            sessionLimitMinutes: sessionLimit,
          },
        },
      });
      setResponsibleNotice('Limits updated successfully.');
      sound.playCorrect();
      setTimeout(() => setResponsibleNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving responsible play settings.');
    }
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    sound.setEnabled(enabled);
    if (enabled) sound.playClick();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fadeIn pb-16 space-y-6">
      {/* 1. MAIN PROFILE VIEW */}
      {activeTab === null && (
        <div className="space-y-6">
          {/* Hero Profile Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative group">
                <img
                  src={photoUrl || user.photoUrl}
                  alt={user.displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-indigo-500/80 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('edit');
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-cyan-400" />
                </button>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-[9px] uppercase shadow">
                  {user.rank}
                </span>
              </div>

              <div className="text-center sm:text-left flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5">
                      <h1 className="text-xl sm:text-2xl font-black text-white">{user.displayName}</h1>
                      {user.is_verified && <span className="text-cyan-400 font-bold">✓</span>}
                      {user.has_gold_crown && <span>👑</span>}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">@{user.username} • Level {levelInfo.level}</p>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="font-mono font-black text-lg text-amber-400">{user.mmr} MMR</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating</span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Level {levelInfo.level} Progress</span>
                    <span>{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, levelInfo.progressPercent))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Games</span>
              <span className="text-sm font-black text-white">{user.stats.totalMatches}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Victories</span>
              <span className="text-sm font-black text-emerald-400">{user.stats.wins}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Win Rate</span>
              <span className="text-sm font-black text-cyan-400">{user.stats.winRate}%</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy</span>
              <span className="text-sm font-black text-amber-400">{user.stats.accuracy}%</span>
            </div>
          </div>

          {/* Feature Menu Navigation Options */}
          <div className="space-y-2">
            {profileTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-300 transition-colors">
                        {tab.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">{tab.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {tab.badge}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              sound.playClick();
              onLogout();
            }}
            className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      )}

      {/* 2. SUB-PAGES WITH BACK BUTTON */}
      {activeTab !== null && (
        <div className="space-y-4 animate-fadeIn">
          {/* Back Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </button>

            <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
              {profileTabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {/* Sub-Tab 1: Career Stats */}
          {activeTab === 'stats' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Career Performance Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Questions Answered</span>
                  <p className="text-base font-black text-white">{user.stats.totalQuestionsAnswered}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Correct Answers</span>
                  <p className="text-base font-black text-emerald-400">{user.stats.correctAnswers}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Best Score</span>
                  <p className="text-base font-black text-amber-400">{user.stats.bestScore} Pts</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Current Win Streak</span>
                  <p className="text-base font-black text-rose-400">🔥 {user.stats.currentStreak} Wins</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Losses</span>
                  <p className="text-base font-black text-slate-400">{user.stats.losses}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Rank Tier</span>
                  <p className="text-base font-black text-indigo-400">{user.rank}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Match History */}
          {activeTab === 'history' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Recent Match History</span>
              </h3>

              <div className="divide-y divide-slate-800">
                {recentMatches.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No match history recorded yet.
                  </div>
                ) : (
                  recentMatches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedHistoryMatch(m)}
                      className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            m.isWinner
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {m.isWinner ? 'WIN' : 'LOSS'}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-white">vs {m.opponentName}</p>
                          <p className="text-[10px] text-slate-400">
                            Score: {m.userScore} - {m.opponentScore} • {new Date(m.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {m.prizeAmount > 0 && (
                          <span className="block font-black text-xs text-amber-400">+₹{m.prizeAmount}</span>
                        )}
                        <span
                          className={`text-[10px] font-bold ${
                            m.mmrChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {m.mmrChange >= 0 ? '+' : ''}{m.mmrChange} MMR
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Edit Profile */}
          {activeTab === 'edit' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>Edit Profile Details</span>
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">Profile Photo</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={photoUrl || user.photoUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Or Select Avatar</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {avatarPool.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Avatar ${i}`}
                        onClick={() => {
                          sound.playClick();
                          setPhotoUrl(url);
                        }}
                        className={`w-10 h-10 rounded-xl object-cover cursor-pointer ring-2 transition-all ${
                          photoUrl === url ? 'ring-indigo-500 scale-105' : 'ring-slate-800 hover:ring-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {saveSuccess && (
                  <p className="text-xs text-emerald-400 font-bold">Profile updated successfully!</p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Sub-Tab 4: Settings */}
          {activeTab === 'settings' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Audio & App Preferences</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    <span>Sound Effects & Audio</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSound(!soundEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        soundEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>Haptic Vibration</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVibrationEnabled(!vibrationEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      vibrationEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        vibrationEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Push Notifications</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPushNotifs(!pushNotifs)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      pushNotifs ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        pushNotifs ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5: Responsible Play */}
          {activeTab === 'responsible' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Responsible Play & Limits</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Daily Deposit Limit (₹)</label>
                  <input
                    type="number"
                    value={depositLimit}
                    onChange={(e) => setDepositLimit(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Daily Match Limit</label>
                  <input
                    type="number"
                    value={matchLimit}
                    onChange={(e) => setMatchLimit(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Max Session Time (Minutes)</label>
                  <input
                    type="number"
                    value={sessionLimit}
                    onChange={(e) => setSessionLimit(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                {responsibleNotice && (
                  <p className="text-xs text-emerald-400 font-bold">{responsibleNotice}</p>
                )}

                <button
                  type="button"
                  onClick={handleSaveResponsiblePlay}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
                >
                  Save Responsible Play Limits
                </button>
              </div>
            </div>
          )}

          {/* Sub-Tab 6: Help & Policies */}
          {activeTab === 'help' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Help Center & Policies</span>
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setShowLegalModal('terms')}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-xs font-bold text-white flex items-center justify-between"
                >
                  <span>Terms & Conditions</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => setShowLegalModal('privacy')}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-xs font-bold text-white flex items-center justify-between"
                >
                  <span>Privacy Policy & Security</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MATCH HISTORY DETAIL MODAL */}
      {selectedHistoryMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-sm">Match Details #{selectedHistoryMatch.id}</h4>
              <button onClick={() => setSelectedHistoryMatch(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Opponent:</span>
                <span className="font-bold text-white">{selectedHistoryMatch.opponentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Score:</span>
                <span className="font-bold text-white">
                  {selectedHistoryMatch.userScore} - {selectedHistoryMatch.opponentScore}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accuracy:</span>
                <span className="font-bold text-cyan-400">{selectedHistoryMatch.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prize Credited:</span>
                <span className="font-bold text-emerald-400">₹{selectedHistoryMatch.prizeAmount}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedHistoryMatch(null)}
              className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* LEGAL MODAL */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-sm">
                {showLegalModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              </h4>
              <button onClick={() => setShowLegalModal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {showLegalModal === 'terms'
                ? 'By playing SpeedMath Arena, players agree to follow fairplay standards. All calculations and match outcomes are strictly verified server-side.'
                : 'All user data and wallet transaction balances are protected by Firestore security rules and encrypted communication channels.'}
            </p>

            <button
              onClick={() => setShowLegalModal(null)}
              className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Close Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
