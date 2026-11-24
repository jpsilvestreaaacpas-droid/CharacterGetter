"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Star, User, Settings2 } from "lucide-react";
import { DEMO_PLAYER_PROFILE } from "@/lib/data/demo-provider";
import { ChatEmojiImg } from "@/components/theme/chat-emoji-context";

export function Header() {
  const profile = DEMO_PLAYER_PROFILE;

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full max-w-full items-center justify-between border-b border-amber-500/15 bg-[#0a1222]/85 backdrop-blur-xl px-3 sm:px-6 lg:px-8">
      {/* Left side: Tab navigation with chat emoji decoration */}
      <div className="flex items-center gap-4 sm:gap-6 pl-10 lg:pl-0 min-w-0">
        <div className="relative flex items-center gap-2 pb-1 pt-2 cursor-pointer group">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-300">
            Overview
          </span>
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />

          {/* Chat emoji next to Overview tab – replaces the old TravelerChibi SVG */}
          <div className="hidden sm:block absolute -top-4 right-[-18px] pointer-events-none">
            <ChatEmojiImg slot="header_tab" size={28} />
          </div>
        </div>
      </div>

      {/* Right side: Player quick stats */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Primogems Pill */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#111c33]/80 border border-amber-500/25 shadow-inner text-xs font-medium">
          <span className="text-amber-400 font-bold text-xs sm:text-sm leading-none">✦</span>
          <span className="font-mono font-bold text-amber-200 text-[11px] sm:text-xs">{profile.primogems.toLocaleString()}</span>
        </div>

        {/* Intertwined Fates Pill */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#111c33]/80 border border-purple-500/30 shadow-inner text-xs font-medium">
          <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-400 fill-purple-400" />
          <span className="font-mono font-bold text-purple-200 text-[11px] sm:text-xs">{profile.intertwinedFates}</span>
          <span className="hidden md:inline text-[10px] text-purple-300/70">Fates</span>
        </div>

        {/* Traveler Profile pill */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 rounded-xl bg-[#111c33]/80 border border-amber-500/20 text-xs shadow-sm">
          <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-[#0d1627] flex items-center justify-center font-bold text-amber-300 text-xs">
              <User className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-300" />
            </div>
          </div>
          <div className="hidden lg:block text-left">
            <p className="font-bold text-foreground leading-tight text-xs">{profile.travelerName}</p>
            <p className="text-[10px] text-muted-foreground font-mono">AR {profile.adventureRank} • WL {profile.worldLevel}</p>
          </div>
          <Settings2 className="w-3.5 h-3.5 text-muted-foreground/60 hidden lg:block" />
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
