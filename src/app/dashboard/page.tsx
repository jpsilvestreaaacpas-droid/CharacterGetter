import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { CharacterCard } from "@/components/ui/character-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  ShieldAlert,
  Flame,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile, characters, characterEventPity, nextTarget } = getDemoData();

  const totalWishes = totalAvailableWishes(profile.primogems, profile.intertwinedFates);
  const wishesFromPrimos = primogemsToWishes(profile.primogems);
  const rosterStats = calculateRosterStats(characters);

  const currentPity = characterEventPity?.currentPity ?? 0;
  const isGuaranteed = characterEventPity?.isGuaranteed ?? false;
  const pityPct = pityPercentage(currentPity, 90);
  const targetWishes = wishesToTarget(currentPity, isGuaranteed, 90);

  // Recently updated characters (first 6)
  const recentCharacters = characters.slice(0, 6);

  return (
    <AppShell>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Traveler Dashboard
            <span className="text-sm font-normal text-muted-foreground font-serif italic">
              — Teyvat Expedition Overview
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time status of your roster, pity progression, and wishing vault.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pull-planner">
            <Button variant="fantasy" size="sm" className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Pull Planner
            </Button>
          </Link>
          <Link href="/characters">
            <Button variant="outline-gold" size="sm" className="gap-1.5">
              <Users className="w-3.5 h-3.5" />
              View Roster
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Core Vault & Character Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Wishes"
          value={totalWishes}
          subValue={`${wishesFromPrimos} from Primos + ${profile.intertwinedFates} Fates`}
          icon={Sparkles}
          highlight="gold"
          trend="Ready to pull"
        />

        <StatCard
          label="Primogem Balance"
          value={profile.primogems.toLocaleString()}
          subValue={`≈ ${wishesFromPrimos} Wishes`}
          icon={Star}
          highlight="default"
          trend="+60 Daily Commissions"
        />

        <StatCard
          label="Character Pity"
          value={`${currentPity}/90`}
          subValue={isGuaranteed ? "Guaranteed Banner" : "50/50 Active"}
          icon={Target}
          highlight="gold"
          trend={`${90 - currentPity} pulls to 5★`}
        />

        <StatCard
          label="Owned Characters"
          value={rosterStats.totalOwned}
          subValue={`${rosterStats.fiveStars} Five-Stars • ${rosterStats.fourStars} Four-Stars`}
          icon={Users}
          highlight="default"
          trend={`${rosterStats.maxLevelCount} at Max Lv. 90`}
        />
      </div>

      {/* Row 2: Target Character Tracker & Pity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Target Focus Card */}
        <Card fantasy className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  Active Target Character
                </CardTitle>
                <CardDescription className="text-xs">
                  Target priority tracking and wish allocation analysis
                </CardDescription>
              </div>
              <Badge variant="rarity-5">Next Focus</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-gold-500/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 via-red-500/20 to-purple-500/20 border border-gold-500/40 flex items-center justify-center font-bold text-lg text-gold-500 shadow-inner">
                  5★
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {nextTarget?.name ?? "Hu Tao"}
                    </h3>
                    <Badge variant="pyro">Pyro</Badge>
                    <span className="text-xs text-muted-foreground font-mono">Polearm</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    {nextTarget?.title ?? "Fragrance in Thaw"} • {nextTarget?.region ?? "Liyue"}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {isGuaranteed ? "Guaranteed Rate-Up" : "On 50/50"}
                </p>
              </div>
            </div>

            {/* Pity Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">Pity Progress to Next 5-Star:</span>
                <span className="font-mono text-gold-600 dark:text-gold-400 font-bold">
                  {currentPity} / 90 Pulls ({pityPct}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border/80">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 via-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${pityPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>0 Pulls</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Soft Pity (74+)
                </span>
                <span>Hard Pity (90)</span>
              </div>
            </div>

            {/* Requirement Summary Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-card border border-border/70 space-y-1">
                <span className="text-muted-foreground">Wishes to 5-Star:</span>
                <p className="font-bold text-sm text-foreground">
                  {targetWishes.wishesToNext5Star} Pulls{" "}
                  <span className="text-[11px] text-muted-foreground font-normal">
                    ({targetWishes.wishesToNext5Star * 160} Primos)
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/70 space-y-1">
                <span className="text-muted-foreground">Guaranteed Target Budget:</span>
                <p className="font-bold text-sm text-foreground">
                  {targetWishes.wishesToGuaranteedTarget} Pulls{" "}
                  <span className="text-[11px] text-muted-foreground font-normal">
                    (Worst Case)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Progression Overview Breakdown */}
        <Card fantasy>
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-500" />
              Roster Progression
            </CardTitle>
            <CardDescription className="text-xs">
              Investment breakdown across owned characters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Level 90 (Max Ascension)</span>
                  <span className="font-mono text-gold-500 font-bold">
                    {characters.filter((c) => c.level === 90).length} Characters
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full"
                    style={{
                      width: `${(characters.filter((c) => c.level === 90).length / characters.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Level 80 (Ascension 5+)</span>
                  <span className="font-mono text-foreground">
                    {characters.filter((c) => c.level === 80).length} Characters
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-400/80 rounded-full"
                    style={{
                      width: `${(characters.filter((c) => c.level === 80).length / characters.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Average Roster Level</span>
                  <span className="font-mono font-bold text-foreground">
                    Lv. {rosterStats.avgLevel}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${(rosterStats.avgLevel / 90) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Rarity Composition:</span>
                <span className="font-semibold text-foreground">
                  {rosterStats.fiveStars} × 5★ | {rosterStats.fourStars} × 4★
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Max Friendship (Lv. 10):</span>
                <span className="font-semibold text-foreground">
                  {characters.filter((c) => c.friendshipLevel === 10).length} / {characters.length}
                </span>
              </div>
            </div>

            <Link href="/progression" className="block pt-2">
              <Button variant="outline-gold" size="sm" className="w-full text-xs">
                Open Progression Planner
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recently Updated Characters Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Recently Updated Characters
            </h3>
            <p className="text-xs text-muted-foreground">
              Characters actively maintained and leveled in this traveler profile
            </p>
          </div>
          <Link href="/characters">
            <Button variant="ghost" size="sm" className="text-xs text-gold-600 dark:text-gold-400 gap-1">
              View All ({characters.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {recentCharacters.map((char) => (
            <CharacterCard
              key={char.characterId}
              id={char.characterId}
              name={char.name}
              title={char.title}
              element={char.element}
              weaponType={char.weaponType}
              rarity={char.rarity}
              level={char.level}
              constellation={char.constellation}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
