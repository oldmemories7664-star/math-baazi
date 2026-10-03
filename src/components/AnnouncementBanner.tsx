import React, { useState, useEffect } from 'react';
import { Megaphone, X, ChevronRight } from 'lucide-react';
import { AnnouncementItem } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsub = api.subscribeAnnouncements((items) => {
      setAnnouncements(items.filter((a) => a.status === 'active'));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (isDismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  if (!current) return null;

  const typeStyles: Record<string, { bg: string; border: string; text: string; tag: string }> = {
    Promotion: { bg: 'from-amber-600/20 to-orange-600/20', border: 'border-amber-500/30', text: 'text-amber-300', tag: '🎁 PROMO' },
    Warning: { bg: 'from-red-600/20 to-pink-600/20', border: 'border-red-500/30', text: 'text-red-300', tag: '⚠️ ALERT' },
    Maintenance: { bg: 'from-indigo-600/20 to-purple-600/20', border: 'border-indigo-500/30', text: 'text-indigo-300', tag: '🛠 UPDATE' },
    Info: { bg: 'from-cyan-600/20 to-blue-600/20', border: 'border-cyan-500/30', text: 'text-cyan-300', tag: '📣 NOTICE' },
  };

  const style = typeStyles[current.type] || typeStyles.Info;

  return (
    <div className={`p-3 rounded-2xl bg-gradient-to-r ${style.bg} border ${style.border} flex items-center justify-between gap-3 animate-fadeIn`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-slate-900/80 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
          <Megaphone className="w-4 h-4 animate-bounce" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900/60 text-white">
              {style.tag}
            </span>
            <h4 className="font-black text-xs text-white truncate">{current.title}</h4>
          </div>
          <p className="text-[11px] text-slate-300 truncate mt-0.5">{current.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {announcements.length > 1 && (
          <span className="text-[10px] font-bold text-slate-400 px-1.5">
            {currentIndex + 1}/{announcements.length}
          </span>
        )}
        <button
          onClick={() => {
            sound.playClick();
            setIsDismissed(true);
          }}
          className="w-6 h-6 rounded-lg bg-slate-900/60 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
