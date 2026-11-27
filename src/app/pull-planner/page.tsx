"use client";

import * as React from "react";
import { Link } from "react-router-dom";
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
import { CalculationService } from "@/lib/services/calculation-service";
import { CalculationDetailsTrigger } from "@/components/ui/calculation-details";
import { usePlayerProfile, useBannerTracking } from "@/lib/hooks/use-local-player";
import { wishPlannerRepo } from "@/lib/repositories/WishPlannerRepository";
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
  Radar,
} from "lucide-react";

// Rough timeline used to turn a Banner Radar prediction into "days until launch".
// Mirrors the Banner Radar page: 5.3 is the current patch, a patch lasts ~42 days,
// and phase 2 starts about half a patch later. Users can still override the result.
const CURRENT_VERSION_MINOR = 3;
const DAYS_PER_PATCH = 42;

function estimateDaysUntilBanner(version: string, phase: number | string): number {
  const minor = parseInt(String(version).split(".")[1] ?? "", 10);
  if (Number.isNaN(minor)) return DAYS_PER_PATCH;
  const patchesAhead = Math.max(0, minor - CURRENT_VERSION_MINOR);
  const phaseOffset = Number(phase) >= 2 ? DAYS_PER_PATCH / 2 : 0;
  return Math.max(1, patchesAhead * DAYS_PER_PATCH + phaseOffset);
}

export default function PullPlannerPage() {
  const { profile } = usePlayerProfile();
  const { banners } = useBannerTracking();

  // Vault state (hydrated from Dexie profile & bannerTracking)
  const [primogems, setPrimogems] = React.useState(0);
  const [fates, setFates] = React.useState(0);
  const [acquaintFates, setAcquaintFates] = React.useState(0);
  const [pity, setPity] = React.useState(0);
  const [isGuaranteed, setIsGuaranteed] = React.useState(false);
  const [weaponPity, setWeaponPity] = React.useState(0);
  const [weaponFatePoints, setWeaponFatePoints] = React.useState(0);
  const [standardPity, setStandardPity] = React.useState(0);
  const [desiredConstellation, setDesiredConstellation] = React.useState(0);
  const [isDirty, setIsDirty] = React.useState(false);
  const [saveFeedback, setSaveFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const charBanner = banners.find((b) => b.bannerType === "CHARACTER_EVENT");
  const wpnBanner = banners.find((b) => b.bannerType === "WEAPON_EVENT");
  const stdBanner = banners.find((b) => b.bannerType === "STANDARD");

  // Sync from Dexie when not dirty
  React.useEffect(() => {
    if (!isDirty && profile) {
      setPrimogems(profile.primogems);
      setFates(profile.intertwinedFates);
      setAcquaintFates(profile.acquaintFates);
    }
  }, [profile, isDirty]);

  React.useEffect(() => {
    if (!isDirty && banners.length > 0) {
      if (charBanner) {
        setPity(charBanner.currentPity);
        setIsGuaranteed(charBanner.isGuaranteed);
      }
      if (wpnBanner) {
        setWeaponPity(wpnBanner.currentPity);
        setWeaponFatePoints(wpnBanner.epitomizedPathPoints ?? 0);
      }
      if (stdBanner) {
        setStandardPity(stdBanner.currentPity);
      }
    }
  }, [banners, charBanner, wpnBanner, stdBanner, isDirty]);

  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function handleSaveData() {
    setSaveFeedback(null);
    try {
      const ts = await wishPlannerRepo.saveAll({
        primogems,
        intertwinedFates: fates,
        acquaintFates,
        characterPity: pity,
        characterGuaranteed: isGuaranteed,
        weaponPity,
        weaponGuaranteed: false,
        weaponFatePoints,
        standardPity,
        targetCharacterId: selectedTargetId,
        desiredConstellation,
        notes: "",
      });
      setIsDirty(false);
      setLastSavedAt(ts);
      setSaveFeedback({ type: "success", message: "Saved to local IndexedDB!" });
    } catch (err) {
      setSaveFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save data",
      });
    }
  }

  async function handleResetPlanner() {
    if (!window.confirm("Reset Character, Weapon, and Standard banner pity to 0? Your Primogems and Fates will NOT be affected.")) {
      return;
    }
    await wishPlannerRepo.resetWishPlannerOnly();
    setPity(0);
    setIsGuaranteed(false);
    setWeaponPity(0);
    setWeaponFatePoints(0);
    setStandardPity(0);
    setIsDirty(false);
    setSaveFeedback({ type: "success", message: "Wish planner pity reset (resources preserved)." });
  }

  // Active planning tab
  const [activeTab, setActiveTab] = React.useState<"calculator" | "projections" | "history">("calculator");

  // Savings projection parameters
  // null = follow the selected banner's estimated launch; a number = the user typed their own
  const [daysOverride, setDaysOverride] = React.useState<number | null>(null);
  const [welkinActive, setWelkinActive] = React.useState(true);
  const [battlePassActive, setBattlePassActive] = React.useState(false);
  const [estimatedEvents, setEstimatedEvents] = React.useState(2260); // approx per patch
  const [estimatedAbyss, setEstimatedAbyss] = React.useState(1200);

  // Simulating banner: chosen from the Banner Radar predictions (5-star pity only), soonest first
  const predictions = React.useMemo(() => getBannerPredictions(), []);
  const sortedTargets = React.useMemo(() => {
    const fiveStars = predictions.filter((p) => p.rarity === 5);
    const pool = fiveStars.length > 0 ? fiveStars : predictions;
    return [...pool].sort(
      (a, b) =>
        estimateDaysUntilBanner(a.estimatedVersion, a.estimatedPhase) -
          estimateDaysUntilBanner(b.estimatedVersion, b.estimatedPhase) ||
        b.evaluation.probabilityPercentage - a.evaluation.probabilityPercentage
    );
  }, [predictions]);
  const [selectedTargetId, setSelectedTargetId] = React.useState<string>(sortedTargets[0]?.id || "");

  const selectedTarget =
    sortedTargets.find((p) => p.id === selectedTargetId) || sortedTargets[0] || predictions[0];

  // The savings forecast follows the selected banner's launch unless the user typed their own value
  const estimatedDays = selectedTarget
    ? estimateDaysUntilBanner(selectedTarget.estimatedVersion, selectedTarget.estimatedPhase)
    : DAYS_PER_PATCH;
  const daysToTarget = daysOverride ?? estimatedDays;

  // Calculations via Centralized Calculation Service
  const wishPowerCalc = CalculationService.calculateWishPower(primogems, fates);
  const availableWishes = wishPowerCalc.value.totalWishes;
  const wishesFromPrimos = wishPowerCalc.value.wishesFromPrimos;
  const leftoverPrimos = wishPowerCalc.value.leftoverPrimos;

  const pityGuaranteesCalc = CalculationService.calculatePityGuarantees(pity, isGuaranteed, "CHARACTER_EVENT");
  const targetCalculations = wishesToTarget(pity, isGuaranteed, 90);
  const progressPct = pityPercentage(pity, 90);

  const wishesRemainingForNext5Star = Math.max(0, targetCalculations.wishesToNext5Star - availableWishes);
  const hasEnoughForNext5Star = availableWishes >= targetCalculations.wishesToNext5Star;
  const hasEnoughForGuaranteed = availableWishes >= targetCalculations.wishesToGuaranteedTarget;

  // Savings forecast calculation via Centralized Calculation Service
  const savingsForecastCalc = CalculationService.calculateSavingsForecast({
    daysRemaining: daysToTarget,
    dailyCommissions: 60,
    welkinActive,
    battlePassActive,
    eventsPrimos: estimatedEvents,
    abyssPrimos: estimatedAbyss,
    starglitterFates: 5,
  });
  const savings = savingsForecastCalc.value;

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
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/60 overflow-x-auto max-w-full">
          <Button
            variant={activeTab === "calculator" ? "fantasy" : "ghost"}
            size="sm"
            className="text-[11px] sm:text-xs px-2.5 sm:px-3"
            onClick={() => setActiveTab("calculator")}
          >
            <Calculator className="w-3.5 h-3.5 mr-1" />
            Pity Simulator
          </Button>
          <Button
            variant={activeTab === "projections" ? "fantasy" : "ghost"}
            size="sm"
            className="text-[11px] sm:text-xs px-2.5 sm:px-3"
            onClick={() => setActiveTab("projections")}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            Savings Forecast
          </Button>
          <Button
            variant={activeTab === "history" ? "fantasy" : "ghost"}
            size="sm"
            className="text-[11px] sm:text-xs px-2.5 sm:px-3"
            onClick={() => setActiveTab("history")}
          >
            <History className="w-3.5 h-3.5 mr-1" />
            Wish Log
          </Button>
        </div>
      </div>

      {/* Simulating Banner picker (driven by the Banner Radar) */}
      {activeTab !== "history" && sortedTargets.length > 0 && (
        <Card className="p-4 border-border/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Radar className="w-4 h-4 text-gold-500" />
                Simulating Banner
              </h3>
              <p className="text-xs text-muted-foreground">
                Pick an upcoming banner from the Banner Radar. Its estimated launch drives the savings forecast.
              </p>
            </div>
            <Link to="/banner-radar">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Open Banner Radar
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          <div role="radiogroup" aria-label="Simulating banner" className="flex gap-2.5 overflow-x-auto pb-1">
            {sortedTargets.map((p) => {
              const isSelected = p.id === selectedTarget?.id;
              const official = p.evaluation.isOfficiallyConfirmed;
              const days = estimateDaysUntilBanner(p.estimatedVersion, p.estimatedPhase);
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setSelectedTargetId(p.id);
                    setDaysOverride(null);
                    setIsDirty(true);
                  }}
                  className={`shrink-0 min-w-[230px] text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-card hover:border-border"
                  }`}
                >
                  <ElementIcon element={p.element} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-foreground truncate">{p.characterName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      v{p.estimatedVersion} · Phase {p.estimatedPhase} · {p.isRerun ? "Rerun" : "Debut"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-mono font-bold ${official ? "text-emerald-400" : "text-gold-500"}`}>
                      {official ? "Official" : `${p.evaluation.probabilityPercentage}%`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">~{days}d</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

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
                  onChange={(e) => {
                    setPrimogems(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
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
                  onChange={(e) => {
                    setFates(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button type="button" onClick={handleSaveData} className="gap-1.5">
                  Save Data
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleResetPlanner}>
                  Reset Pity
                </Button>
                {isDirty && (
                  <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                    Unsaved changes
                  </Badge>
                )}
                {saveFeedback && (
                  <span className={`text-xs ${saveFeedback.type === "success" ? "text-emerald-400" : "text-destructive"}`}>
                    {saveFeedback.message}
                  </span>
                )}
                {lastSavedAt && !isDirty && (
                  <span className="text-[11px] text-muted-foreground">
                    Saved {new Date(lastSavedAt).toLocaleTimeString()}
                  </span>
                )}
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

              {/* Linked Community Target (picked in the Simulating Banner bar above) */}
              {selectedTarget && (
                <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  Simulating{" "}
                  <span className="font-semibold text-foreground">{selectedTarget.characterName}</span>. Change the
                  banner in the Simulating Banner bar above.
                </div>
              )}

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-gold-500/15 via-card to-card border border-gold-500/30 min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Pulling Power
                      </p>
                      <CalculationDetailsTrigger
                        meta={wishPowerCalc.meta}
                        explanation={wishPowerCalc.explanation}
                        triggerLabel="Wish Formula"
                      />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5">
                      {availableWishes}{" "}
                      <span className="text-xs sm:text-sm font-normal text-muted-foreground">Available Wishes</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs text-muted-foreground font-mono">
                    <p>{primogems.toLocaleString()} Primos ({wishesFromPrimos} Wishes + {leftoverPrimos} Leftover)</p>
                    <p>+ {fates} Intertwined Fates</p>
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
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          ~{daysToTarget} days to launch · radar confidence{" "}
                          {selectedTarget.evaluation.isOfficiallyConfirmed
                            ? "Official"
                            : `${selectedTarget.evaluation.probabilityPercentage}%`}
                        </p>
                      </div>
                    </div>
                    <Link to="/banner-radar">
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        Radar Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Outcome by the selected banner's launch */}
                {selectedTarget && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      futureCanGuarantee
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    <strong className="font-semibold">
                      By {selectedTarget.characterName}&apos;s banner (~{daysToTarget} days):
                    </strong>{" "}
                    {futureCanGuarantee
                      ? `projected ${totalFutureWishes} wishes covers the ${targetCalculations.wishesToGuaranteedTarget}-pull worst case, so a guaranteed pull is feasible.`
                      : `projected ${totalFutureWishes} wishes is ${targetCalculations.wishesToGuaranteedTarget - totalFutureWishes} short of the ${targetCalculations.wishesToGuaranteedTarget}-pull worst case.`}
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
                      <div className="flex items-center gap-1.5">
                        <CalculationDetailsTrigger
                          meta={pityGuaranteesCalc.meta}
                          explanation={pityGuaranteesCalc.explanation}
                          triggerLabel="Pity Rules"
                        />
                        <Badge variant={hasEnoughForGuaranteed ? "gold" : "outline"}>
                          {hasEnoughForGuaranteed ? "Guaranteed" : "Worst Case"}
                        </Badge>
                      </div>
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
                  <span>Days Until {selectedTarget?.characterName ?? "Target"} Banner</span>
                  <span className="font-mono text-xs text-gold-500">{daysToTarget} Days</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={daysToTarget}
                  onChange={(e) => setDaysOverride(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <p className="text-[11px] text-muted-foreground">
                  {daysOverride === null ? (
                    selectedTarget
                      ? `Auto from the Banner Radar estimate (v${selectedTarget.estimatedVersion} Phase ${selectedTarget.estimatedPhase}).`
                      : "Set manually."
                  ) : (
                    <>
                      Custom value.{" "}
                      <button
                        type="button"
                        className="underline text-gold-500"
                        onClick={() => setDaysOverride(null)}
                      >
                        Use radar estimate ({estimatedDays} days)
                      </button>
                    </>
                  )}
                </p>
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
                      {savings.dailyIncome} <span className="text-xs font-normal text-muted-foreground">Primos/day</span>
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