"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Star, User, Settings2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { DEMO_PLAYER_PROFILE } from "@/lib/data/demo-provider";
import { usePlayerProfile } from "@/lib/hooks/use-local-player";
import { ChatEmojiImg } from "@/components/theme/chat-emoji-context";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/characters": "Characters",
  "/pull-planner": "Pull Planner",
  "/banner-radar": "Banner Radar",
  "/resources": "Resources",
  "/progression": "Progression",
  "/weapons": "Weapons",
  "/teams": "Teams",
  "/settings": "Settings",
};

export const Header = React.memo(function Header() {
  const { pathname } = useLocation();
  const { profile: localProfile } = usePlayerProfile();
  const profile = localProfile ?? DEMO_PLAYER_PROFILE;
  const sectionTitle = ROUTE_TITLES[pathname] ?? "Overview";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full max-w-full items-center justify-between border-b border-[#D7B66D]/25 bg-[#101B35]/90 backdrop-blur-xl px-3 sm:px-6 lg:px-8">
      {/* Left side: Dynamic current section indicator with chat emoji decoration */}
      <div className="flex items-center gap-4 sm:gap-6 pl-10 lg:pl-0 min-w-0">
        <div className="relative flex items-center gap-2 pb-1 pt-2 group">
          <span className="text-xs font-bold tracking-widest uppercase text-[#F2D38A]">
            {sectionTitle}
          </span>
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D7B66D] to-[#F2D38A] shadow-[0_0_8px_rgba(242,211,138,0.75)]" />

          {/* Chat emoji next to section tab */}
          <div className="hidden sm:block absolute -top-4 right-[-22px] pointer-events-none">
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
        <Link
          to="/settings"
          className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1 rounded-xl bg-[#111c33]/80 border border-amber-500/20 text-xs shadow-sm hover:border-amber-500/40 transition-colors"
        >
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
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
});
