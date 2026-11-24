"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ElementIcon } from "@/components/ui/element-icon";
import {
  totalAvailableWishes,
  primogemsToWishes,
  wishesToTarget,
  pityPercentage,
  PRIMOGEMS_PER_WISH,
} from "@/lib/calculations";
import {
  calculateSavingsProjection,
  summarizeWishHistory,
  DEMO_WISH_HISTORY,
  WishLogItem,
} from "@/lib/radar/pull-history-data";
import { getBannerPredictions } from "@/lib/data/banner-radar-data";
import {
  Sparkles,
  Star,
  Calculator,
  Target,
  Info,
  Calendar,
  History,
  TrendingUp,
  Coins,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function PullPlannerPage() {
  // Vault state
  const [primogems, setPrimogems] = React.useState(14880);
  const [fates, setFates] = React.useState(12);
  const [pity, setPity] = React.useState(64);
  const [isGuaranteed, setIsGuaranteed] = React.useState(false);

  // Active planning tab
  const [activeTab, setActiveTab] = React.useState<"calculator" | "projections" | "history">("calculator");

  // Savings projection parameters
  const [daysToTarget, setDaysToTarget] = React.useState(42); // ~1 full version patch
  const [welkinActive, setWelkinActive] = React.useState(true);
  const [battlePassActive, setBattlePassActive] = React.useState(false);
  const [estimatedEvents, setEstimatedEvents] = React.useState(2260); // approx per patch
  const [estimatedAbyss, setEstimatedAbyss] = React.useState(1200);

  // Selected Target from Banner Radar
  const predictions = React.useMemo(() => getBannerPredictions(), []);
  const [selectedTargetId, setSelectedTargetId] = React.useState<string>(predictions[0]?.id || "");

  const selectedTarget = predictions.find((p) => p.id === selectedTargetId) || predictions[0];

  // Calculations
  const availableWishes = totalAvailableWishes(primogems, fates);
  const wishesFromPrimos = primogemsToWishes(primogems);
  const targetCalculations = wishesToTarget(pity, isGuaranteed, 90);
  const progressPct = pityPercentage(pity, 90);

  const wishesRemainingForNext5Star = Math.max(0, targetCalculations.wishesToNext5Star - availableWishes);
  const hasEnoughForNext5Star = availableWishes >= targetCalculations.wishesToNext5Star;
  const hasEnoughForGuaranteed = availableWishes >= targetCalculations.wishesToGuaranteedTarget;

  // Savings forecast calculation
  const savings = calculateSavingsProjection({
    daysRemaining: daysToTarget,
    dailyCommissionsPrimos: 60,
    welkinActive,
    battlePassActive,
    eventsEstimatedPrimos: estimatedEvents,
    abyssEstimatedPrimos: estimatedAbyss,
    starglitterFates: 5,
  });

  const totalFutureWishes = availableWishes + savings.totalProjectedWishes;
  const futureCanGuarantee = totalFutureWishes >= targetCalculations.wishesToGuaranteedTarget;

  // History summary
  const historySummary = React.useMemo(() => summarizeWishHistory(DEMO_WISH_HISTORY), []);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Wish & Pull Planner
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Milestone 3
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pity simulation, worst-case budget guarantee, savings forecasts, and pull history.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/60">
          <Button
            variant={activeTab === "calculator" ? "fantasy" : "ghost"}
            size="sm"
            className="text-xs"
            onClick={() => setActiveTab("calculator")}
          >
            <Calculator className="w-3.5 h-3.5 mr-1" />
            Pity Simulator
          </Button>
          <Button
            variant={activeTab === "projections" ? "fantasy" : "ghost"}
            size="sm"
            className="text-xs"
            onClick={() => setActiveTab("projections")}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Savings Forecast
          </Button>
          <Button
            variant={activeTab === "history" ? "fantasy" : "ghost"}
            size="sm"
            className="text-xs"
            onClick={() => setActiveTab("history")}
          >
            <History className="w-3.5 h-3.5 mr-1" />
            Wish Log
          </Button>
        </div>
      </div>

      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Vault Parameters */}
          <Card fantasy className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-gold-500" />
                Wishing Vault Inputs
              </CardTitle>
              <CardDescription className="text-xs">
                Adjust your current resources and banner status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Primogems</span>
                  <span className="font-mono text-xs text-gold-500">
                    ≈ {wishesFromPrimos} Wishes
                  </span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="160"
                  value={primogems}
                  onChange={(e) => setPrimogems(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Intertwined Fates (Direct)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={fates}
                  onChange={(e) => setFates(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Current Pity (0 - 89)</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {pity} / 90
                  </span>
                </label>
                <Input
                  type="number"
                  min="0"
                  max="89"
                  value={pity}
                  onChange={(e) => setPity(Math.min(89, Math.max(0, parseInt(e.target.value) || 0)))}
                />
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Rate-Up Guarantee Status
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={!isGuaranteed ? "fantasy" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setIsGuaranteed(false)}
                  >
                    On 50/50
                  </Button>
                  <Button
                    variant={isGuaranteed ? "fantasy" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setIsGuaranteed(true)}
                  >
                    Guaranteed Rate-Up
                  </Button>
                </div>
              </div>

              {/* Linked Community Target */}
              <div className="pt-2 border-t border-border/60">
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Target Character (from Banner Radar)
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full text-xs rounded-md bg-muted/60 border border-border p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  {predictions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.characterName} (v{p.estimatedVersion} Phase {p.estimatedPhase}) - {p.evaluation.probabilityPercentage}% Prob
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/80 text-[11px] text-muted-foreground flex gap-2">
                <Info className="w-4 h-4 shrink-0 text-gold-500" />
                <span>
                  Soft pity begins at pull 74. Hard pity guarantees a 5-star at pull 90.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Calculation & Simulation Results */}
          <div className="lg:col-span-2 space-y-6">
            <Card fantasy>
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-gold-500" />
                    Pull Readiness Analysis
                  </CardTitle>
                  <Badge variant={hasEnoughForNext5Star ? "gold" : "outline"}>
                    {hasEnoughForNext5Star ? "5-Star Ready" : "Accumulating Wishes"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Total Pulls Available Banner */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gold-500/15 via-card to-card border border-gold-500/30">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Pulling Power
                    </p>
                    <p className="text-3xl font-extrabold text-foreground mt-0.5">
                      {availableWishes}{" "}
                      <span className="text-sm font-normal text-muted-foreground">Available Wishes</span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground font-mono">
                    <p>{primogems.toLocaleString()} Primos</p>
                    <p>+ {fates} Fates</p>
                  </div>
                </div>

                {/* Target Card Highlight */}
                {selectedTarget && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/70 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ElementIcon element={selectedTarget.element} size="md" />
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          {selectedTarget.characterName}
                          <Badge variant="rarity-5" className="text-[10px]">
                            {"★".repeat(selectedTarget.rarity)}
                          </Badge>
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Estimated v{selectedTarget.estimatedVersion} Phase {selectedTarget.estimatedPhase} · {selectedTarget.isRerun ? "Rerun" : "New Debut"}
                        </p>
                      </div>
                    </div>
                    <Link href="/banner-radar">
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        Radar Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Pity Progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Current Banner Position:</span>
                    <span className="font-mono text-gold-500 font-bold">
                      {pity} / 90 ({progressPct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Milestone 1: Next 5-Star */}
                  <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">Next 5-Star (Any)</span>
                      <Badge variant={hasEnoughForNext5Star ? "gold" : "outline"}>
                        {hasEnoughForNext5Star ? "Covered" : "Need Wishes"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold font-mono">
                      {targetCalculations.wishesToNext5Star}{" "}
                      <span className="text-xs text-muted-foreground font-sans font-normal">
                        Pulls Needed
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasEnoughForNext5Star
                        ? `Surplus: ${availableWishes - targetCalculations.wishesToNext5Star} pulls remaining after this 5★`
                        : `Deficit: Need ${wishesRemainingForNext5Star} more pulls (${wishesRemainingForNext5Star * 160} Primos)`}
                    </p>
                  </div>

                  {/* Milestone 2: Guaranteed Featured Character */}
                  <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">
                        Guaranteed Target Character
                      </span>
                      <Badge variant={hasEnoughForGuaranteed ? "gold" : "outline"}>
                        {hasEnoughForGuaranteed ? "Guaranteed" : "Worst Case"}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold font-mono">
                      {targetCalculations.wishesToGuaranteedTarget}{" "}
                      <span className="text-xs text-muted-foreground font-sans font-normal">
                        Pulls Needed
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasEnoughForGuaranteed
                        ? "You are 100% mathematically guaranteed to secure the target character!"
                        : `Worst case requires ${targetCalculations.wishesToGuaranteedTarget - availableWishes} more wishes if 50/50 is lost.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === "projections" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card fantasy className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                Savings Assumptions
              </CardTitle>
              <CardDescription className="text-xs">
                Configure your daily income and event estimates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Days Until Target Banner</span>
                  <span className="font-mono text-xs text-gold-500">{daysToTarget} Days</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={daysToTarget}
                  onChange={(e) => setDaysToTarget(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Welkin Moon Active</p>
                  <p className="text-muted-foreground">+90 Primogems per day</p>
                </div>
                <input
                  type="checkbox"
                  checked={welkinActive}
                  onChange={(e) => setWelkinActive(e.target.checked)}
                  className="rounded border-border text-gold-500 focus:ring-gold-500 w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Gnostic Hymn Battle Pass</p>
                  <p className="text-muted-foreground">+680 Primos & 4 Fates per patch</p>
                </div>
                <input
                  type="checkbox"
                  checked={battlePassActive}
                  onChange={(e) => setBattlePassActive(e.target.checked)}
                  className="rounded border-border text-gold-500 focus:ring-gold-500 w-4 h-4"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Events Estimated Primogems
                </label>
                <Input
                  type="number"
                  step="100"
                  value={estimatedEvents}
                  onChange={(e) => setEstimatedEvents(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Spiral Abyss / Theater Rewards
                </label>
                <Input
                  type="number"
                  step="100"
                  value={estimatedAbyss}
                  onChange={(e) => setEstimatedAbyss(parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card fantasy>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold-500" />
                  Target Savings Forecast
                </CardTitle>
                <CardDescription className="text-xs">
                  Combined savings projected over {daysToTarget} days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border/80">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Daily Income Rate</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                      {savings.dailyRate} <span className="text-xs font-normal text-muted-foreground">Primos/day</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border/80">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Projected New Wishes</p>
                    <p className="text-2xl font-bold font-mono text-gold-500 mt-1">
                      +{savings.totalProjectedWishes} <span className="text-xs font-normal text-muted-foreground">Wishes</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border/80">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Total At Banner Launch</p>
                    <p className="text-2xl font-bold font-mono text-foreground mt-1">
                      {totalFutureWishes} <span className="text-xs font-normal text-muted-foreground">Wishes</span>
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${futureCanGuarantee ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"}`}>
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{futureCanGuarantee ? "Guaranteed Target Feasible!" : "Additional Savings Needed for Worst Case"}</span>
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {futureCanGuarantee
                      ? `Your projected stash (${totalFutureWishes} wishes) exceeds the worst-case guaranteed requirement (${targetCalculations.wishesToGuaranteedTarget} wishes).`
                      : `You will have ${totalFutureWishes} wishes vs ${targetCalculations.wishesToGuaranteedTarget} needed for worst case guarantee (deficit: ${targetCalculations.wishesToGuaranteedTarget - totalFutureWishes} wishes).`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Wish Log History Tab */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-border/70">
              <p className="text-xs text-muted-foreground uppercase">Total 5★ Pulled</p>
              <p className="text-2xl font-bold font-mono">{historySummary.total5Stars}</p>
            </Card>
            <Card className="p-4 border-border/70">
              <p className="text-xs text-muted-foreground uppercase">Average 5★ Pity</p>
              <p className="text-2xl font-bold font-mono text-gold-500">{historySummary.avgPity}</p>
            </Card>
            <Card className="p-4 border-border/70">
              <p className="text-xs text-muted-foreground uppercase">50/50 Win Rate</p>
              <p className="text-2xl font-bold font-mono">{historySummary.winRate}%</p>
            </Card>
            <Card className="p-4 border-border/70">
              <p className="text-xs text-muted-foreground uppercase">50/50 Won / Lost</p>
              <p className="text-2xl font-bold font-mono">{historySummary.wonCount} / {historySummary.lostCount}</p>
            </Card>
          </div>

          <Card className="border-border/70 overflow-hidden">
            <div className="px-5 py-3 border-b border-border/60 bg-muted/20 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-gold-500" />
                Recent Wish Records
              </h3>
              <Badge variant="outline" className="text-xs">
                Demo Wish Log
              </Badge>
            </div>
            <div className="divide-y divide-border/60">
              {DEMO_WISH_HISTORY.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.rarity === 5 ? "rarity-5" : "rarity-4"}>
                      {item.rarity}★
                    </Badge>
                    <div>
                      <p className="font-bold text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.bannerType.replace("_", " ")} · {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-foreground">
                      Pity {item.pityCount}
                    </p>
                    {item.won5050 !== undefined && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.won5050 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {item.won5050 ? "Won 50/50" : "Lost 50/50"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
