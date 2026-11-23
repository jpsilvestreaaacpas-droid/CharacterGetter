"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, User } from "lucide-react";
import { DEMO_PLAYER_PROFILE } from "@/lib/data/demo-provider";

export function Header() {
  const profile = DEMO_PLAYER_PROFILE;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-card/80 backdrop-blur px-6 lg:px-8">
      {/* Left side: Page breadcrumb / Title spacer */}
      <div className="flex items-center gap-2 pl-10 lg:pl-0">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground hidden sm:inline">
          Overview
        </span>
      </div>

      {/* Right side: Player quick stats, Demo badge, Theme toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Currencies Pill */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted/60 border border-border/70 text-xs font-medium">
          {/* Primogems */}
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono font-bold">{profile.primogems.toLocaleString()}</span>
          </div>
          <div className="h-3 w-px bg-border/80" />
          {/* Intertwined Fates */}
          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono font-bold">{profile.intertwinedFates}</span>
            <span className="text-[10px] text-muted-foreground">Fates</span>
          </div>
        </div>

        {/* Traveler Profile pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-gold-500/30 text-xs">
          <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden md:block">
            <p className="font-semibold text-foreground leading-tight text-xs">{profile.travelerName}</p>
            <p className="text-[10px] text-muted-foreground font-mono">AR {profile.adventureRank} • WL {profile.worldLevel}</p>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
