import * as React from "react";

// Cute Genshin Chibi SVGs matching the playful, premium companion aesthetic in the screenshot

export function HuTaoChibi({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hat */}
      <ellipse cx="50" cy="28" rx="36" ry="10" fill="#2d1c1a" />
      <path d="M22 28 C24 10, 76 10, 78 28 Z" fill="#3a2522" />
      {/* Hat Band & Flower */}
      <path d="M22 27 Q50 33 78 27 Q50 24 22 27 Z" fill="#ab2626" />
      <circle cx="68" cy="22" r="5" fill="#f87171" />
      <circle cx="68" cy="22" r="2.5" fill="#fbbf24" />
      {/* Twin Tails Hair */}
      <path d="M20 38 C8 45, 6 70, 14 85 C18 70, 26 55, 30 45 Z" fill="#2d1c1a" />
      <path d="M80 38 C92 45, 94 70, 86 85 C82 70, 74 55, 70 45 Z" fill="#2d1c1a" />
      {/* Head */}
      <ellipse cx="50" cy="46" rx="26" ry="22" fill="#ffebd6" />
      {/* Bangs */}
      <path d="M28 35 Q50 44 72 35 Q65 48 50 48 Q35 48 28 35 Z" fill="#3a2522" />
      <path d="M38 38 Q42 50 45 42 Q48 50 53 40 Q58 50 63 38" fill="#3a2522" />
      {/* Flower Eyes */}
      <circle cx="40" cy="48" r="4.5" fill="#b91c1c" />
      <path d="M40 44 L40 52 M36 48 L44 48 M37 45 L43 51 M37 51 L43 45" stroke="#fde047" strokeWidth="1.2" />
      <circle cx="60" cy="48" r="4.5" fill="#b91c1c" />
      <path d="M60 44 L60 52 M56 48 L64 48 M57 45 L63 51 M57 51 L63 45" stroke="#fde047" strokeWidth="1.2" />
      {/* Blushes */}
      <circle cx="34" cy="53" r="3.5" fill="#f87171" opacity="0.6" />
      <circle cx="66" cy="53" r="3.5" fill="#f87171" opacity="0.6" />
      {/* W-Smile */}
      <path d="M46 54 Q48 56 50 54 Q52 56 54 54" stroke="#451a03" strokeWidth="1.4" strokeLinecap="round" />
      {/* Coat & Sitting Body */}
      <path d="M34 66 C32 80, 68 80, 66 66 Z" fill="#241715" />
      <path d="M44 66 L50 78 L56 66 Z" fill="#dc2626" />
      <circle cx="50" cy="71" r="2" fill="#fbbf24" />
      {/* Tiny dangling legs */}
      <rect x="38" y="78" width="7" height="12" rx="3.5" fill="#1c1917" />
      <rect x="55" y="78" width="7" height="12" rx="3.5" fill="#1c1917" />
    </svg>
  );
}

export function FurinaChibi({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Hat */}
      <path d="M30 26 C32 10, 68 10, 70 26 Z" fill="#1e3a8a" />
      <ellipse cx="50" cy="26" rx="26" ry="6" fill="#172554" />
      <path d="M32 24 Q50 28 68 24 Q50 22 32 24 Z" fill="#60a5fa" />
      <circle cx="42" cy="18" r="3" fill="#93c5fd" />
      {/* Side hair curl */}
      <path d="M22 36 C10 48, 8 75, 20 85 C18 70, 26 55, 30 45 Z" fill="#e0f2fe" />
      <path d="M78 36 C90 48, 92 75, 80 85 C82 70, 74 55, 70 45 Z" fill="#bae6fd" />
      {/* Head */}
      <ellipse cx="50" cy="46" rx="25" ry="22" fill="#fef2f2" />
      {/* Bangs */}
      <path d="M28 36 Q50 44 72 36 Q62 50 50 48 Q38 50 28 36 Z" fill="#f0f9ff" />
      <path d="M42 38 Q48 50 52 42 Q56 50 62 40" fill="#bae6fd" />
      {/* Heterochromia Eyes (Blue and Deep Blue/Cyan) */}
      <ellipse cx="40" cy="48" rx="4.5" ry="5.5" fill="#0284c7" />
      <circle cx="39" cy="46" r="1.5" fill="#ffffff" />
      <ellipse cx="60" cy="48" rx="4.5" ry="5.5" fill="#38bdf8" />
      <circle cx="59" cy="46" r="1.5" fill="#ffffff" />
      {/* Blushes */}
      <circle cx="34" cy="53" r="3.5" fill="#f472b6" opacity="0.5" />
      <circle cx="66" cy="53" r="3.5" fill="#f472b6" opacity="0.5" />
      {/* Confident Smile */}
      <path d="M47 54 Q50 57 53 54" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
      {/* Dress / Body */}
      <path d="M34 66 C32 82, 68 82, 66 66 Z" fill="#1e3a8a" />
      <path d="M46 66 L50 75 L54 66 Z" fill="#ffffff" />
      <rect x="38" y="78" width="6" height="12" rx="3" fill="#172554" />
      <rect x="56" y="78" width="6" height="12" rx="3" fill="#172554" />
    </svg>
  );
}

export function ZhongliChibi({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hair Behind */}
      <path d="M26 34 C18 48, 18 75, 26 85 C24 70, 30 55, 34 45 Z" fill="#38241b" />
      <path d="M74 34 C82 48, 82 75, 74 85 C76 70, 70 55, 66 45 Z" fill="#38241b" />
      {/* Head */}
      <ellipse cx="50" cy="44" rx="25" ry="22" fill="#ffebd6" />
      {/* Amber Eyeliner & Eyes */}
      <path d="M34 44 Q40 42 45 45" stroke="#f59e0b" strokeWidth="1.8" fill="none" />
      <ellipse cx="40" cy="48" rx="4" ry="5" fill="#d97706" />
      <circle cx="39" cy="46.5" r="1.5" fill="#ffffff" />
      <path d="M66 44 Q60 42 55 45" stroke="#f59e0b" strokeWidth="1.8" fill="none" />
      <ellipse cx="60" cy="48" rx="4" ry="5" fill="#d97706" />
      <circle cx="59" cy="46.5" r="1.5" fill="#ffffff" />
      {/* Bangs */}
      <path d="M28 32 Q50 38 72 32 Q62 46 50 44 Q38 46 28 32 Z" fill="#2d1c16" />
      <path d="M44 34 Q48 52 50 42 Q52 52 56 36" fill="#f59e0b" />
      {/* Earring */}
      <circle cx="25" cy="52" r="2" fill="#f59e0b" />
      <line x1="25" y1="54" x2="25" y2="60" stroke="#f59e0b" strokeWidth="1.5" />
      {/* Calm Smile */}
      <path d="M47 55 Q50 57 53 55" stroke="#451a03" strokeWidth="1.4" strokeLinecap="round" />
      {/* Suit Coat */}
      <path d="M32 64 C30 84, 70 84, 68 64 Z" fill="#2d221c" />
      <path d="M46 64 L50 78 L54 64 Z" fill="#f59e0b" />
      <rect x="38" y="80" width="7" height="12" rx="3.5" fill="#1c1917" />
      <rect x="55" y="80" width="7" height="12" rx="3.5" fill="#1c1917" />
    </svg>
  );
}

export function TravelerChibi({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Golden Hair */}
      <circle cx="50" cy="46" r="26" fill="#fbbf24" />
      {/* Face */}
      <circle cx="50" cy="48" r="21" fill="#ffedd5" />
      {/* Bangs */}
      <path d="M30 36 Q50 46 70 36 Q60 48 50 46 Q40 48 30 36 Z" fill="#f59e0b" />
      {/* Cute Eyes */}
      <circle cx="41" cy="49" r="3.5" fill="#b45309" />
      <circle cx="59" cy="49" r="3.5" fill="#b45309" />
      <circle cx="40" cy="47.5" r="1.2" fill="#ffffff" />
      <circle cx="58" cy="47.5" r="1.2" fill="#ffffff" />
      {/* Smile */}
      <path d="M47 55 Q50 58 53 55" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
      {/* Scarf / Outfit */}
      <path d="M36 68 C34 82, 66 82, 64 68 Z" fill="#3b4252" />
      <path d="M45 68 L50 76 L55 68 Z" fill="#f59e0b" />
    </svg>
  );
}

// Boo Tao - Hu Tao's floating ghost companion with playful animated flame aura
export function BooTaoGhost({ className = "w-8 h-8", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative inline-block animate-bounce duration-1000 ${className}`} style={style}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Flame Wisps */}
        <path d="M20 70 C10 60, 20 40, 30 50 Z" fill="#fdba74" opacity="0.6" />
        <path d="M80 70 C90 60, 80 40, 70 50 Z" fill="#fdba74" opacity="0.6" />
        {/* Ghost Body */}
        <path
          d="M50 15 C28 15, 24 45, 24 72 C24 82, 34 86, 42 78 C48 72, 52 72, 58 78 C66 86, 76 82, 76 72 C76 45, 72 15, 50 15 Z"
          fill="url(#ghostGrad)"
        />
        {/* Happy Smiling Eyes */}
        <path d="M38 46 Q43 40 48 46" stroke="#431407" strokeWidth="3" strokeLinecap="round" />
        <path d="M56 46 Q61 40 66 46" stroke="#431407" strokeWidth="3" strokeLinecap="round" />
        {/* Open happy mouth */}
        <ellipse cx="52" cy="56" rx="4" ry="5" fill="#b91c1c" />
        {/* Blushes */}
        <circle cx="33" cy="52" r="4.5" fill="#fb7185" opacity="0.7" />
        <circle cx="71" cy="52" r="4.5" fill="#fb7185" opacity="0.7" />
        {/* Gradient */}
        <defs>
          <linearGradient id="ghostGrad" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff7ed" />
            <stop offset="0.7" stopColor="#ffedd5" />
            <stop offset="1" stopColor="#fdba74" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Compact character avatar icon for recently updated roster cards
export function MiniCharacterAvatar({ characterId, className = "w-8 h-8" }: { characterId: string; className?: string }) {
  switch (characterId) {
    case "raiden-shogun":
      return (
        <div className={`rounded-full bg-gradient-to-br from-purple-600 to-indigo-900 p-0.5 border border-purple-400/50 shadow-sm ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="48" fill="#3b1d60" />
            <circle cx="50" cy="48" r="25" fill="#ffe4d6" />
            <path d="M24 30 Q50 10 76 30 C76 65, 68 75, 50 78 C32 75, 24 65, 24 30 Z" fill="#582a8e" />
            <path d="M28 35 Q50 48 72 35" fill="#3b1d60" />
            <circle cx="42" cy="46" r="3.5" fill="#8b5cf6" />
            <circle cx="58" cy="46" r="3.5" fill="#8b5cf6" />
            <circle cx="68" cy="36" r="3" fill="#e9d5ff" />
          </svg>
        </div>
      );
    case "furina":
      return (
        <div className={`rounded-full bg-gradient-to-br from-blue-500 to-cyan-800 p-0.5 border border-blue-400/50 shadow-sm ${className}`}>
          <FurinaChibi className="w-full h-full" />
        </div>
      );
    case "nahida":
      return (
        <div className={`rounded-full bg-gradient-to-br from-emerald-500 to-lime-800 p-0.5 border border-emerald-400/50 shadow-sm ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="48" fill="#143e26" />
            <circle cx="50" cy="48" r="25" fill="#fff1e6" />
            <path d="M20 28 C30 15, 70 15, 80 28 C85 60, 75 80, 50 82 C25 80, 15 60, 20 28 Z" fill="#e2f6dc" />
            <path d="M24 32 Q50 42 76 32" fill="#84cc16" />
            <circle cx="42" cy="46" r="3.5" fill="#65a30d" />
            <circle cx="58" cy="46" r="3.5" fill="#65a30d" />
            <path d="M68 28 L72 34 L66 36 Z" fill="#84cc16" />
          </svg>
        </div>
      );
    case "kaedehara-kazuha":
      return (
        <div className={`rounded-full bg-gradient-to-br from-teal-500 to-emerald-800 p-0.5 border border-teal-400/50 shadow-sm ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="48" fill="#134e4a" />
            <circle cx="50" cy="48" r="25" fill="#ffebd6" />
            <path d="M22 28 C28 12, 72 12, 78 28 C80 65, 75 78, 50 80 C25 78, 20 65, 22 28 Z" fill="#e5e5e5" />
            <path d="M58 24 Q62 44 65 38" stroke="#ef4444" strokeWidth="3" />
            <circle cx="41" cy="48" r="3.5" fill="#dc2626" />
            <circle cx="59" cy="48" r="3.5" fill="#dc2626" />
          </svg>
        </div>
      );
    case "zhongli":
      return (
        <div className={`rounded-full bg-gradient-to-br from-amber-600 to-yellow-900 p-0.5 border border-amber-400/50 shadow-sm ${className}`}>
          <ZhongliChibi className="w-full h-full" />
        </div>
      );
    case "neuvillette":
      return (
        <div className={`rounded-full bg-gradient-to-br from-sky-600 to-blue-950 p-0.5 border border-sky-400/50 shadow-sm ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <circle cx="50" cy="50" r="48" fill="#0c2340" />
            <circle cx="50" cy="48" r="25" fill="#f8fafc" />
            <path d="M20 28 C28 10, 72 10, 80 28 C85 68, 75 80, 50 82 C25 80, 15 68, 20 28 Z" fill="#e2e8f0" />
            <path d="M42 22 Q50 36 58 22" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="41" cy="48" r="3.5" fill="#0284c7" />
            <circle cx="59" cy="48" r="3.5" fill="#0284c7" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`rounded-full bg-gold-500/20 p-0.5 border border-gold-500/40 flex items-center justify-center font-bold text-xs text-gold-400 ${className}`}>
          5★
        </div>
      );
  }
}
