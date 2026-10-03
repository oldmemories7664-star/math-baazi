import React, { useState } from 'react';
import { ShieldCheck, FileText, AlertTriangle, Lock, RefreshCw, Scale, ChevronRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface OfficialPoliciesViewProps {
  onBack: () => void;
  policies?: {
    termsAndConditions?: string;
    refundPolicy?: string;
    privacyPolicy?: string;
    antiCheatingPolicy?: string;
  };
}

export const OfficialPoliciesView: React.FC<OfficialPoliciesViewProps> = ({ onBack, policies }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'refund' | 'privacy' | 'antiCheating'>('terms');

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', hindiLabel: 'नियम और शर्तें', icon: Scale },
    { id: 'refund', label: 'Refund Policy', hindiLabel: 'रिफंड नीति', icon: RefreshCw },
    { id: 'privacy', label: 'Privacy Policy', hindiLabel: 'गोपनीयता नीति', icon: Lock },
    { id: 'antiCheating', label: 'Fair Play Policy', hindiLabel: 'फेयर प्ले और धोखाधड़ी विरोधी', icon: AlertTriangle },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Math Baazi Official Policies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            नियम और नीतियां (Legal & Compliance)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Last Updated: 2026-10-03 · 100% Legal 'Game of Skill' compliance under Indian Law.
          </p>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
        >
          ← Back to App
        </button>
      </div>

      {/* Policy Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-black truncate">{tab.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate">{tab.hindiLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Policy Content Card */}
      <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl leading-relaxed text-slate-200 text-sm">
        {activeTab === 'terms' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-cyan-400 font-black">
                1
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Terms & Conditions (नियम और शर्तें)</h2>
                <span className="text-xs text-slate-400">Rules governing participation and eligibility</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="font-bold text-indigo-300 text-sm mb-1">1. आयु सीमा (Age Requirement)</h3>
                <p className="text-xs text-slate-300">
                  इस ऐप पर पैसे लगाकर खेलने के लिए यूज़र की उम्र <strong>18 वर्ष या उससे अधिक</strong> होना अनिवार्य है। 18 वर्ष से कम आयु के खिलाड़ी केवल फ्री प्रैक्टिस मोड में भाग ले सकते हैं।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="font-bold text-indigo-300 text-sm mb-1">2. कौशल का खेल (Game of Skill)</h3>
                <p className="text-xs text-slate-300">
                  यह ऐप पूरी तरह से <strong>'Game of Skill' (कौशल का खेल)</strong> है। इसमें जीत पूरी तरह से यूज़र के गणितीय ज्ञान, मानसिक गणना और गति (Speed) पर निर्भर करती है। इसका सट्टेबाजी, लाटरी या भाग्य (Gambling/Luck) से कोई संबंध नहीं है।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/30 bg-rose-950/10">
                <h3 className="font-bold text-rose-300 text-sm mb-1">3. प्रतिबंधित राज्य (Restricted Jurisdictions)</h3>
                <p className="text-xs text-slate-300">
                  राज्य स्तरीय नियमों के कारण, <strong>असम, ओडिशा, नागालैंड, सिक्किम, आंध्र प्रदेश और तेलंगाना</strong> के निवासी इस ऐप पर कैश गेम और पेड टूर्नामेंट में भाग नहीं ले सकते।
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                2
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Refund & Cancellation Policy (रिफंड नीति)</h2>
                <span className="text-xs text-slate-400">Rules regarding deposits, cancellations, and server crashes</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="font-bold text-amber-300 text-sm mb-1">1. एंट्री फीस रिफंड (Entry Fee Cancellation)</h3>
                <p className="text-xs text-slate-300">
                  एक बार गेम या टूर्नामेंट ज्वाइन करने के बाद एंट्री फीस (जैसे ₹10 या ₹20) किसी भी स्थिति में रिफंड नहीं होगी, भले ही यूज़र का इंटरनेट बंद हो जाए, कॉल आ जाए या वह गेम बीच में छोड़ दे।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <h3 className="font-bold text-emerald-300 text-sm mb-1">2. तकनीकी खराबी (Server Error / App Crash Protection)</h3>
                <p className="text-xs text-slate-300">
                  यदि ऐप के सर्वर या तकनीकी समस्या के कारण गेम क्रैश होता है या प्रश्न लोड नहीं होता, तो सिस्टम द्वारा पुष्टि होने पर यूज़र की पूरी एंट्री फीस <strong>24 घंटे के भीतर</strong> उसके ऐप वॉलेट में ऑटो-रिफंड कर दी जाएगी।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="font-bold text-amber-300 text-sm mb-1">3. ऐड मनी (Deposited Funds Policy)</h3>
                <p className="text-xs text-slate-300">
                  वॉलेट में ऐड किया हुआ पैसा सीधे पेमेंट गेटवे पर चार्ज-बैक नहीं होगा। यूज़र अपनी जीती हुई राशि और उपलब्ध बैलेंस को कभी भी ऐप के <strong>'Withdraw'</strong> विकल्प द्वारा अपने बैंक या UPI में सीधे निकाल सकता है।
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black">
                3
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Privacy Policy (गोपनीयता नीति)</h2>
                <span className="text-xs text-slate-400">How your personal and banking information is secured</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="font-bold text-cyan-300 text-sm mb-1">1. डेटा सुरक्षा (Bank-Grade Data Encryption)</h3>
                <p className="text-xs text-slate-300">
                  हम यूज़र की गोपनीयता का पूरा सम्मान करते हैं। यूज़र का नाम, मोबाइल नंबर, ईमेल, यूपीआई आईडी और वॉलेट ट्रांजैक्शन का डेटा Firebase Firestore पर पूरी तरह एन्क्रिप्टेड और सुरक्षित रखा जाता है।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="font-bold text-cyan-300 text-sm mb-1">2. डेटा का उपयोग (Zero 3rd-Party Selling)</h3>
                <p className="text-xs text-slate-300">
                  यूज़र के डेटा का उपयोग केवल अकाउंट वेरिफिकेशन, इंस्टेंट विथड्रॉवल प्रोसेस और ऐप सर्विस को बेहतर बनाने के लिए किया जाता है। इसे कभी भी किसी तीसरे पक्ष (Third Party) या विज्ञापन कंपनी को नहीं बेचा जाता।
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'antiCheating' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black">
                4
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Anti-Cheating & Fair Play Policy (धोखाधड़ी विरोधी नीति)</h2>
                <span className="text-xs text-slate-400">Strict zero-tolerance policy against automation and exploits</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40">
                <h3 className="font-bold text-rose-400 text-sm mb-1">1. हैकिंग और बॉट्स (Prohibited Scripts & Bots)</h3>
                <p className="text-xs text-slate-300">
                  यदि कोई यूज़र गेम में किसी भी प्रकार के Hacks, स्क्रीन-रीडर स्क्रिप्ट, ऑटो-क्लिकर, या ऑटो-कैलकुलेटर का उपयोग करते हुए पकड़ा जाता है, तो सर्वर एंटी-चीट इंजन द्वारा उसका अकाउंट तुरंत स्थायी रूप से ब्लॉक कर दिया जाएगा।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="font-bold text-amber-300 text-sm mb-1">2. मल्टीपल अकाउंट्स (Multi-Account Exploits)</h3>
                <p className="text-xs text-slate-300">
                  एक ही डिवाइस या मोबाइल में कई नकली अकाउंट बनाकर रेफरल बोनस या गेम पूल का गलत फायदा उठाने पर डिवाइस आईडी को हमेशा के लिए ब्लैकलिस्ट कर दिया जाएगा।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/50">
                <h3 className="font-bold text-rose-300 text-sm mb-1">3. फंड्स ज़ब्त (Balance Confiscation)</h3>
                <p className="text-xs text-slate-300">
                  धोखाधड़ी या फेयर-प्ले नियमों का उल्लंघन करने पर यूज़र के वॉलेट में मौजूद सभी पैसे और जीती हुई रकम तुरंत ज़ब्त कर ली जाएगी और कोई रिफंड नहीं दिया जाएगा।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
