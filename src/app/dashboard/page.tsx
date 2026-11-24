import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDemoData } from "@/lib/data/demo-provider";
import {
  totalAvailableWishes,
  primogemsToWishes,
  wishesToTarget,
  pityPercentage,
  calculateRosterStats,
} from "@/lib/calculations";
import {
  Sparkles,
  Star,
  Users,
  Target,
  ArrowRight,
  TrendingUp,
  Flame,
  Coins,
  Shield,
  Zap,
} from "lucide-react";
import { BooTaoGhost, MiniCharacterAvatar } from "@/components/ui/genshin-chibi";

export default function DashboardPage() {
  const { profile, characters, characterEventPity, nextTarget } = getDemoData();

  const totalWishes = totalAvailableWishes(profile.primogems, profile.intertwinedFates);
  const wishesFromPrimos = primogemsToWishes(profile.primogems);
  const rosterStats = calculateRosterStats(characters);

  const currentPity = characterEventPity?.currentPity ?? 64;
  const isGuaranteed = characterEventPity?.isGuaranteed ?? false;
  const pityPct = pityPercentage(currentPity, 90);
  const targetWishes = wishesToTarget(currentPity, isGuaranteed, 90);

  // The 6 showcase characters from the screenshot
  const recentCharacters = [
    {
      id: "raiden-shogun",
      name: "Raiden Shogun",
      title: "Plane of Euthymia",
      element: "Electro",
      weaponType: "Polearm",
      rarity: 5,
      level: 90,
      constellation: 2,
    },
    {
      id: "furina",
      name: "Furina",
      title: "Endless Solo of Solitude",
      element: "Hydro",
      weaponType: "Sword",
      rarity: 5,
      level: 90,
      constellation: 1,
    },
    {
      id: "nahida",
      name: "Nahida",
      title: "Physic of Purity",
      element: "Dendro",
      weaponType: "Catalyst",
      rarity: 5,
      level: 90,
      constellation: 0,
    },
    {
      id: "kaedehara-kazuha",
      name: "Kaedehara Kazuha",
      title: "Scarlet Leaves Pursue Wild Waves",
      element: "Anemo",
      weaponType: "Sword",
      rarity: 5,
      level: 80,
      constellation: 0,
    },
    {
      id: "zhongli",
      name: "Zhongli",
      title: "Vago Mundo",
      element: "Geo",
      weaponType: "Polearm",
      rarity: 5,
      level: 80,
      constellation: 0,
    },
    {
      id: "neuvillette",
      name: "Neuvillette",
      title: "Ordainer of Inexorable Judgment",
      element: "Hydro",
      weaponType: "Catalyst",
      rarity: 5,
      level: 90,
      constellation: 0,
    },
  ];

  return (
    <AppShell>
      {/* Dashboard Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-amber-500/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Traveler Dashboard
            <span className="text-xs sm:text-sm font-normal text-muted-foreground font-serif italic">
              — Teyvat Expedition Overview
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time status of your roster, pity progression, and wishing goals.
          </p>
        </div>

        {/* Action Buttons matching screenshot */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/pull-planner">
            <Button
              className="bg-gradient-to-r from-amber-400 via-gold-500 to-yellow-500 text-stone-950 font-bold hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.35)] text-xs h-8 px-3.5 gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Pull Planner
            </Button>
          </Link>
          <Link href="/characters">
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-foreground font-medium text-xs h-8 px-3.5 gap-1.5 backdrop-blur-md"
            >
              <Users className="w-3.5 h-3.5" />
              View Roster
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: 4 Stat Cards matching screenshot styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Available Wishes */}
        <div className="genshin-card filigree-corners p-4 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80">
              Available Wishes
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-foreground leading-none">
                {totalWishes}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                ({wishesFromPrimos} from Primos + {profile.intertwinedFates} Fates)
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium pt-1">
              Ready to pull
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Card 2: Primogem Balance */}
        <div className="genshin-card filigree-corners p-4 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80">
              Primogem Balance
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-foreground leading-none">
                {profile.primogems.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                (+{wishesFromPrimos} Wishes)
              </span>
            </div>
            <p className="text-[11px] text-amber-400 font-medium pt-1">
              +60 Daily Commissions
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Card 3: Character Pity */}
        <div className="genshin-card filigree-corners p-4 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80">
              Character Pity
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-amber-300 leading-none">
                {currentPity}/90
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                ({isGuaranteed ? "Guaranteed" : "50/50 Active"})
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              {Math.max(0, 74 - currentPity)} pulls to soft
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Target className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Owned Characters */}
        <div className="genshin-card filigree-corners p-4 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80">
              Owned Characters
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-foreground leading-none">
                {rosterStats.totalOwned}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                ({rosterStats.fiveStars} Five-Stars • {rosterStats.fourStars} Four-Stars)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              {rosterStats.maxLevelCount} at Max Lv. 90
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Row 2: Target Character Tracker & Pity Radar (Left ~65%, Right ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Active Target Character Card */}
        <div className="lg:col-span-7 xl:col-span-8 genshin-card filigree-corners p-5 space-y-4 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Active Target Character</h3>
                <p className="text-[11px] text-muted-foreground">Target priority for wishing and pull allocation analysis</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35">
              Next Focus
            </span>
          </div>

          {/* Character Banner with floating Boo Tao ghost */}
          <div className="p-4 rounded-xl bg-[#111a2f]/90 border border-amber-500/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 relative z-10">
              {/* 5-Star Ornamental Icon */}
              <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-amber-500/25 via-red-500/20 to-purple-500/20 border border-amber-400/40 p-2.5 flex items-center justify-center text-amber-300 font-black text-sm shadow-inner">
                5★
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-foreground">
                    {nextTarget?.name ?? "Hu Tao"}
                  </h4>
                  <Badge variant="pyro" className="text-[10px] px-2 py-0">Pyro</Badge>
                  <span className="text-xs text-muted-foreground font-mono">Polearm</span>
                </div>
                <p className="text-xs text-muted-foreground italic mt-0.5">
                  {nextTarget?.title ?? "Fragrance in Thaw"} — {nextTarget?.region ?? "Liyue"}
                </p>
              </div>
            </div>

            {/* Right Status */}
            <div className="text-left sm:text-right relative z-10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
              <p className="text-xs font-bold text-amber-400">
                {isGuaranteed ? "Guaranteed Rate-Up" : "On 50/50"}
              </p>
            </div>

            {/* Floating Animated Boo Tao Ghosts (as seen in the screenshot!) */}
            <div className="absolute right-24 -top-1 pointer-events-none opacity-85">
              <BooTaoGhost className="w-9 h-9" />
            </div>
            <div className="absolute right-12 top-6 pointer-events-none opacity-60">
              <BooTaoGhost className="w-7 h-7" style={{ animationDelay: "0.5s" }} />
            </div>
            <div className="absolute right-40 bottom-1 pointer-events-none opacity-50">
              <BooTaoGhost className="w-6 h-6" style={{ animationDelay: "1.2s" }} />
            </div>
          </div>

          {/* Pity Progress Gauge */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Pity Progress to Next 5-Star:</span>
              <span className="font-mono text-amber-300 font-bold">
                {currentPity} / 90 Pulls ({pityPct}%)
              </span>
            </div>

            {/* Glowing Golden Pity Bar */}
            <div className="h-2.5 w-full rounded-full bg-[#0a1222] overflow-hidden border border-amber-500/20 p-0.5">
              <div
                className="h-full rounded-full pity-glow-bar transition-all duration-500"
                style={{ width: `${pityPct}%` }}
              />
            </div>

            {/* Markers */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/75 font-mono">
              <span>0 Pulls</span>
              <span className="text-amber-400 font-bold">Soft Pity (74+)</span>
              <span>Hard Pity (90)</span>
            </div>
          </div>

          {/* Bottom Requirement Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-lg bg-[#0c1424]/80 border border-border/70 space-y-0.5">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Wishes to 5-Star:</p>
              <p className="font-bold text-sm text-foreground font-mono">
                {targetWishes.wishesToNext5Star} Pulls{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  ({targetWishes.wishesToNext5Star * 160} Primos)
                </span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#0c1424]/80 border border-border/70 space-y-0.5">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Guaranteed Target Budget:</p>
              <p className="font-bold text-sm text-foreground font-mono">
                {targetWishes.wishesToGuaranteedTarget} Pulls{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (Worst Case)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (4-5 cols): Roster Progression Card */}
        <div className="lg:col-span-5 xl:col-span-4 genshin-card filigree-corners p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Roster Progression</h3>
                <p className="text-[11px] text-muted-foreground">Investment breakdown across owned characters</p>
              </div>
            </div>

            {/* Level Breakdown Progress Bars */}
            <div className="space-y-3 pt-1">
              {/* Level 90 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Level 90 (Max Ascension)</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {characters.filter((c) => c.level === 90).length} Characters
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0a1222] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    style={{
                      width: `${(characters.filter((c) => c.level === 90).length / characters.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Level 80 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Level 80 (Ascension 5+)</span>
                  <span className="font-mono text-foreground font-bold">
                    {characters.filter((c) => c.level === 80).length} Characters
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0a1222] overflow-hidden">
                  <div
                    className="h-full bg-amber-400/70 rounded-full"
                    style={{
                      width: `${(characters.filter((c) => c.level === 80).length / characters.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Average Level with Elemental Dot Clusters */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Average Roster Level</span>
                  <span className="font-mono text-foreground font-bold">
                    Lv. {rosterStats.avgLevel}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0a1222] overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-teal-400 rounded-full"
                    style={{ width: `${(rosterStats.avgLevel / 90) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Roster Metadata Counts */}
            <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Rarity Composition:</span>
                <span className="font-semibold text-foreground">
                  {rosterStats.fiveStars} × 5★ · {rosterStats.fourStars} × 4★
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Max Friendship (Lv. 10):</span>
                <span className="font-semibold text-foreground">
                  {characters.filter((c) => c.friendshipLevel === 10).length} / {characters.length}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link href="/progression" className="block pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-300 font-semibold h-8"
            >
              Open Progression Planner
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 3: Recently Updated Characters (Horizontal Grid matching screenshot) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Recently Updated Characters
            </h3>
            <p className="text-xs text-muted-foreground">
              Characters actively maintained and tracked in this traveler profile.
            </p>
          </div>
          <Link href="/characters">
            <Button variant="ghost" size="sm" className="text-xs text-amber-400 hover:text-amber-300 gap-1 h-7 px-2">
              View All ({characters.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* 6 Character Cards matching screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {recentCharacters.map((char) => (
            <div
              key={char.id}
              className="genshin-card filigree-corners p-3 space-y-2 hover:border-amber-400/50 transition-all flex flex-col justify-between"
            >
              {/* Top row: Name & Element icon */}
              <div className="space-y-0.5">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-bold text-xs text-foreground truncate leading-tight">
                    {char.name}
                  </h4>
                  <Badge variant={char.element.toLowerCase() as any} className="text-[9px] px-1.5 py-0 h-4 shrink-0">
                    {char.element}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{char.title}</p>
              </div>

              {/* Middle row: 5 Stars + Weapon */}
              <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
                <span>★★★★★</span>
                <span className="text-[10px] text-muted-foreground">{char.weaponType}</span>
              </div>

              {/* Bottom row: Level Pill & Character Mini Avatar */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">
                  Lv. {char.level}/90
                </span>
                <MiniCharacterAvatar characterId={char.id} className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
