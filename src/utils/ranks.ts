import { RankInfo, RankTier } from '../types';

export const RANK_TIERS: Record<RankTier, RankInfo> = {
  Bronze: {
    tier: 'Bronze',
    minMmr: 0,
    maxMmr: 999,
    color: '#cd7f32',
    badgeBg: 'from-amber-900/60 to-amber-700/40',
    badgeBorder: 'border-amber-700/50',
    iconName: 'Shield',
  },
  Silver: {
    tier: 'Silver',
    minMmr: 1000,
    maxMmr: 1399,
    color: '#cbd5e1',
    badgeBg: 'from-slate-400/50 to-slate-200/30',
    badgeBorder: 'border-slate-400/50',
    iconName: 'ShieldAlert',
  },
  Gold: {
    tier: 'Gold',
    minMmr: 1400,
    maxMmr: 1799,
    color: '#fbbf24',
    badgeBg: 'from-yellow-600/60 to-amber-400/40',
    badgeBorder: 'border-yellow-400/60',
    iconName: 'Award',
  },
  Platinum: {
    tier: 'Platinum',
    minMmr: 1800,
    maxMmr: 2199,
    color: '#22d3ee',
    badgeBg: 'from-cyan-600/60 to-teal-400/40',
    badgeBorder: 'border-cyan-400/60',
    iconName: 'Zap',
  },
  Diamond: {
    tier: 'Diamond',
    minMmr: 2200,
    maxMmr: 2699,
    color: '#a855f7',
    badgeBg: 'from-purple-600/60 to-fuchsia-400/40',
    badgeBorder: 'border-purple-400/60',
    iconName: 'Crown',
  },
  Legend: {
    tier: 'Legend',
    minMmr: 2700,
    maxMmr: 9999,
    color: '#ef4444',
    badgeBg: 'from-red-600/60 via-amber-500/40 to-yellow-400/60',
    badgeBorder: 'border-red-500/80',
    iconName: 'Flame',
  },
};

export function getRankTierFromMmr(mmr: number): RankTier {
  if (mmr >= 2700) return 'Legend';
  if (mmr >= 2200) return 'Diamond';
  if (mmr >= 1800) return 'Platinum';
  if (mmr >= 1400) return 'Gold';
  if (mmr >= 1000) return 'Silver';
  return 'Bronze';
}

export function getRankProgress(mmr: number): { current: number; max: number; percentage: number; tier: RankTier; nextTier?: RankTier } {
  const tier = getRankTierFromMmr(mmr);
  const info = RANK_TIERS[tier];
  
  if (tier === 'Legend') {
    return { current: mmr, max: 3500, percentage: Math.min(100, Math.round(((mmr - 2700) / 800) * 100)), tier };
  }

  const range = info.maxMmr - info.minMmr;
  const currentInRange = mmr - info.minMmr;
  const percentage = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
  
  const tiers: RankTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legend'];
  const nextTier = tiers[tiers.indexOf(tier) + 1];

  return {
    current: currentInRange,
    max: range,
    percentage,
    tier,
    nextTier,
  };
}

export function calculateLevelFromXp(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPercent: number } {
  // 500 XP per level with scaling
  const level = Math.floor(xp / 500) + 1;
  const currentXp = xp % 500;
  const nextLevelXp = 500;
  const progressPercent = Math.round((currentXp / nextLevelXp) * 100);
  return { level, currentXp, nextLevelXp, progressPercent };
}
