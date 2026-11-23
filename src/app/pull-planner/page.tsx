"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  totalAvailableWishes,
  primogemsToWishes,
  wishesToTarget,
  pityPercentage,
  PRIMOGEMS_PER_WISH,
} from "@/lib/calculations";
import { Sparkles, Star, Calculator, Target, Info } from "lucide-react";

export default function PullPlannerPage() {
  const [primogems, setPrimogems] = React.useState(14880);
  const [fates, setFates] = React.useState(12);
  const [pity, setPity] = React.useState(64);
  const [isGuaranteed, setIsGuaranteed] = React.useState(false);

  const availableWishes = totalAvailableWishes(primogems, fates);
  const wishesFromPrimos = primogemsToWishes(primogems);
  const targetCalculations = wishesToTarget(pity, isGuaranteed, 90);
  const progressPct = pityPercentage(pity, 90);

  const wishesRemainingForNext5Star = Math.max(0, targetCalculations.wishesToNext5Star - availableWishes);
  const hasEnoughForNext5Star = availableWishes >= targetCalculations.wishesToNext5Star;
  const hasEnoughForGuaranteed = availableWishes >= targetCalculations.wishesToGuaranteedTarget;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Wish & Pull Planner
            <span className="text-sm font-normal text-muted-foreground font-serif italic">
              — Pity & Budget Simulation
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Simulate your wishing budget, calculate worst-case thresholds, and plan for your next target.
          </p>
        </div>
      </div>

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
                      Guaranteed Rate-Up Character
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
    </AppShell>
  );
}
