import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Mail,
  MessageCircle,
  Send,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  HelpCircle,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SupportConfig } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [support, setSupport] = useState<SupportConfig>({
    email: 'support@mathbaazi.app',
    whatsapp: '+91 9876543210',
    telegram: 'https://t.me/mathbaazi',
    instagram: 'https://instagram.com/mathbaazi',
    facebook: 'https://facebook.com/mathbaazi',
    youtube: 'https://youtube.com/@mathbaazi',
    twitter: 'https://twitter.com/mathbaazi',
    help_articles_url: 'https://mathbaazi.app/help',
  });

  useEffect(() => {
    if (!isOpen) return;
    const unsub = api.subscribeSupportConfig((cfg) => {
      setSupport((prev) => ({ ...prev, ...cfg }));
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const channels = [
    {
      title: 'WhatsApp Support',
      desc: 'Instant 24x7 player support & query resolution',
      value: support.whatsapp || '+91 Support Desk',
      url: support.whatsapp ? `https://wa.me/${support.whatsapp.replace(/[^0-9]/g, '')}` : undefined,
      icon: MessageCircle,
      color: 'from-emerald-500 to-green-600',
    },
    {
      title: 'Telegram Channel & Help',
      desc: 'Daily tournament alerts & official announcements',
      value: 'Join @mathbaazi',
      url: support.telegram || 'https://t.me/mathbaazi',
      icon: Send,
      color: 'from-sky-500 to-blue-600',
    },
    {
      title: 'Official Email Support',
      desc: 'Account & payout assistance (Reply within 2 hours)',
      value: support.email || 'support@mathbaazi.app',
      url: `mailto:${support.email || 'support@mathbaazi.app'}`,
      icon: Mail,
      color: 'from-indigo-500 to-indigo-700',
    },
  ];

  const socials = [
    { name: 'Instagram', url: support.instagram, icon: Instagram, color: 'text-pink-400 border-pink-500/20 bg-pink-500/10' },
    { name: 'YouTube', url: support.youtube, icon: Youtube, color: 'text-red-400 border-red-500/20 bg-red-500/10' },
    { name: 'Facebook', url: support.facebook, icon: Facebook, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10' },
    { name: 'Twitter / X', url: support.twitter, icon: Twitter, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1320] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slideUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Player Support & Help Desk</h3>
              <p className="text-xs text-slate-400">Official channels for instant help & inquiries</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Direct Channels */}
          <div className="space-y-3">
            {channels.map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <a
                  key={idx}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${ch.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {ch.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{ch.desc}</p>
                      <p className="text-xs font-bold text-cyan-400 mt-1">{ch.value}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                </a>
              );
            })}
          </div>

          {/* Social Media Channels */}
          <div className="pt-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
              Official Social Communities
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {socials.map((soc, i) => {
                const Icon = soc.icon;
                if (!soc.url) return null;
                return (
                  <a
                    key={i}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all hover:scale-[1.02] ${soc.color}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs text-white truncate">{soc.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Trust Banner */}
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2.5 text-xs text-indigo-200">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>All payments and payouts are 100% encrypted & regulated under Fair Play rules.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
