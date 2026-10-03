import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface CommunityChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const CommunityChatModal: React.FC<CommunityChatModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeRoom, setActiveRoom] = useState<'general' | 'hindi' | 'help' | 'vip'>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banExpiresAt, setBanExpiresAt] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const rooms = [
    { slug: 'general' as const, label: '💬 General', desc: 'Main arena chat' },
    { slug: 'hindi' as const, label: '🇮🇳 Hindi Room', desc: 'हिंदी बातचीत' },
    { slug: 'help' as const, label: '❓ Help & Tips', desc: 'Game assistance' },
    { slug: 'vip' as const, label: '💎 VIP Lounge', desc: 'Exclusive for VIPs' },
  ];

  // Subscribe to real-time chat messages for active room
  useEffect(() => {
    if (!isOpen) return;

    // Check if user is banned
    api.checkChatBan(user.uid).then((ban) => {
      if (ban && ban.expires_at > Date.now()) {
        setIsBanned(true);
        setBanExpiresAt(ban.expires_at);
      } else {
        setIsBanned(false);
      }
    });

    const unsub = api.subscribeChatMessages(activeRoom, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsub();
  }, [isOpen, activeRoom, user.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    if (activeRoom === 'vip' && !user.vip_tier && !user.vipPassId) {
      setErrorMsg('VIP Lounge is only available for VIP Pass holders.');
      return;
    }

    if (isBanned) {
      setErrorMsg('You are temporarily restricted from chatting by moderators.');
      return;
    }

    setErrorMsg(null);
    setIsSending(true);
    sound.playClick();

    try {
      await api.sendChatMessage(activeRoom, inputText.trim());
      setInputText('');
      sound.playCoin();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg h-[620px] max-h-[92vh] rounded-3xl bg-[#0e1320] border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <span>Speed Math Community Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Real-time player chat & discussions</p>
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

        {/* Room Selector Tabs */}
        <div className="px-3 py-2 border-b border-slate-800/60 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {rooms.map((room) => {
            const isVipLocked = room.slug === 'vip' && !user.vip_tier && !user.vipPassId;
            return (
              <button
                key={room.slug}
                onClick={() => {
                  sound.playClick();
                  setActiveRoom(room.slug);
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                  activeRoom === room.slug
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/60'
                }`}
              >
                <span>{room.label}</span>
                {isVipLocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>
            );
          })}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b0e17]/80">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p className="text-xs font-bold text-slate-400">No messages yet in this room.</p>
              <p className="text-[11px] text-slate-600">Be the first to say hello to fellow math wizards!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.user_id === user.uid;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeIn`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-400">
                      {isMe ? 'You' : m.user_name || 'Player'}
                    </span>
                    <span className="text-[9px] text-slate-600">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm border border-indigo-400/30'
                        : 'bg-slate-900 text-slate-200 rounded-tl-sm border border-slate-800'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ban Notice if any */}
        {isBanned && (
          <div className="p-3 bg-red-500/10 border-t border-red-500/30 flex items-center gap-2 text-xs font-bold text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Chat disabled by Admin. Restriction ends at{' '}
              {banExpiresAt ? new Date(banExpiresAt).toLocaleTimeString() : 'soon'}.
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-2 bg-amber-500/10 border-t border-amber-500/20 text-center text-xs font-bold text-amber-300">
            {errorMsg}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isBanned || isSending}
            placeholder={
              isBanned
                ? 'Chat suspended temporarily...'
                : activeRoom === 'vip' && !user.vip_tier && !user.vipPassId
                ? 'VIP Pass required for this lounge'
                : `Message #${activeRoom}...`
            }
            maxLength={250}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending || isBanned}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black text-xs disabled:opacity-40 active:scale-95 transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
