"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ElementIcon } from "@/components/ui/element-icon";
import { Input } from "@/components/ui/input";
import {
  Radar, Sparkles, AlertTriangle, ShieldCheck, ExternalLink,
  ChevronRight, Info, PlusCircle, CheckCircle2, History,
  TrendingUp, Users, Clock, AlertCircle, Bookmark, Compass, RefreshCw
} from "lucide-react";
import { getBannerPredictions, BannerPrediction } from "@/lib/data/banner-radar-data";
import { getDemoData } from "@/lib/data/demo-provider";
import { usePlayerProfile, useBannerTracking } from "@/lib/hooks/use-local-player";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { wishEventHistoryRepo, WishEventBanner } from "@/lib/repositories/WishEventHistoryRepository";
import { Pagination } from "@/components/ui/pagination";
import { totalAvailableWishes, wishesToTarget } from "@/lib/calculations";

const STATUS_VARIANTS: Record<string, { label: string; color: string; badgeVariant?: string }> = {
  "Officially confirmed": { label: "Official", color: "emerald" },
  "Corroborated": { label: "Corroborated", color: "gold" },
  "Developing": { label: "Developing", color: "blue" },
  "Disputed": { label: "Disputed", color: "amber" },
  "Unverified": { label: "Unverified", color: "stone" },
  "Stale": { label: "Stale", color: "rose" },
};

export default function BannerRadarPage() {
  const predictions = React.useMemo(() => getBannerPredictions(), []);
  const demo = React.useMemo(() => getDemoData(), []);
  const { profile: localProfile } = usePlayerProfile();
  const { banners: trackedBanners } = useBannerTracking();
  const profile = localProfile ?? demo.profile;
  const characterEventPity =
    trackedBanners.find((b) => b.bannerType === "CHARACTER_EVENT") ?? demo.characterEventPity;

  // Tab: Rerun Radar vs Historical Wish Event Data (Masterain98)
  const [activeTab, setActiveTab] = React.useState<"radar" | "history">("radar");
  const [historyBanners, setHistoryBanners] = React.useState<WishEventBanner[]>([]);
  const [historySource, setHistorySource] = React.useState<"github" | "cache" | "empty">("empty");
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historySearch, setHistorySearch] = React.useState("");
  const debouncedHistorySearch = useDebouncedValue(historySearch, 150);
  const [historyCategory, setHistoryCategory] = React.useState<string>("All");
  const [historyPage, setHistoryPage] = React.useState(1);
  const [historyPageSize, setHistoryPageSize] = React.useState(12);

  const loadHistory = React.useCallback(async (forceRefresh = false) => {
    setHistoryLoading(true);
    try {
      const res = await wishEventHistoryRepo.getBanners(forceRefresh);
      setHistoryBanners(res.banners);
      setHistorySource(res.source);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === "history" && historyBanners.length === 0 && !historyLoading) {
      loadHistory(false);
    }
  }, [activeTab, historyBanners.length, historyLoading, loadHistory]);

  React.useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyCategory]);

  // Local-First Player Wish Planning State (never uploaded to community DB)
  const availableWishes = totalAvailableWishes(profile.primogems, profile.intertwinedFates);
  const currentPity = characterEventPity?.currentPity ?? 0;
  const isGuaranteed = characterEventPity?.isGuaranteed ?? false;
  const targetPlanning = React.useMemo(
    () => wishesToTarget(currentPity, isGuaranteed),
    [currentPity, isGuaranteed]
  );

  // Filters
  const [filterVersion, setFilterVersion] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // "Why this percentage?" modal state
  const [selectedPrediction, setSelectedPrediction] = React.useState<BannerPrediction | null>(null);

  // Community submission modal state
  const [submissionOpen, setSubmissionOpen] = React.useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<boolean>(false);
  const [submissionData, setSubmissionData] = React.useState({
    characterName: "",
    version: "5.4",
    sourcePlatform: "Reddit",
    sourceUrl: "",
    evidenceNotes: "",
  });

  const versions = React.useMemo(
    () => [
      "all",
      ...Array.from(new Set(predictions.map((p) => p.estimatedVersion))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    ],
    [predictions]
  );

  const statuses = ["all", "Officially confirmed", "Corroborated", "Developing", "Disputed", "Stale"];

  const filteredPredictions = React.useMemo(
    () =>
      predictions.filter((p) => {
        const matchVer = filterVersion === "all" || p.estimatedVersion === filterVersion;
        const matchStatus = filterStatus === "all" || p.evaluation.status === filterStatus;
        const matchSearch =
          p.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.characterId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchVer && matchStatus && matchSearch;
      }),
    [predictions, filterVersion, filterStatus, searchQuery]
  );

  const filteredHistory = React.useMemo(() => {
    const q = debouncedHistorySearch.trim().toLowerCase();
    return historyBanners.filter((b) => {
      const matchCat = historyCategory === "All" || b.bannerCategory === historyCategory;
      const matchQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.version.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [historyBanners, historyCategory, debouncedHistorySearch]);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / historyPageSize));
  const pagedHistory = React.useMemo(
    () =>
      filteredHistory.slice(
        (historyPage - 1) * historyPageSize,
        historyPage * historyPageSize
      ),
    [filteredHistory, historyPage, historyPageSize]
  );

  function handleSubmittal(e: React.FormEvent) {
    e.preventDefault();
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSubmissionOpen(false);
      setSubmissionData({
        characterName: "",
        version: "5.4",
        sourcePlatform: "Reddit",
        sourceUrl: "",
        evidenceNotes: "",
      });
    }, 2000);
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Community Banner Radar
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
              Heuristic Engine
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent probability-of-truth estimates for upcoming character banners and reruns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline-gold"
            size="sm"
            onClick={() => setSubmissionOpen(true)}
            className="text-xs gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Submit Evidence Link
          </Button>
        </div>
      </div>

      {/* Personal Player Planning Integration Bar (Local-First: strictly private) */}
      <Card className="p-4 border-gold-500/30 bg-gradient-to-r from-gold-500/5 via-card to-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gold-600 dark:text-gold-400">
                Personal Wish Planning (Local Private Data)
              </p>
              <p className="text-sm text-foreground">
                <span className="font-mono font-bold">{availableWishes} Total Wishes</span> ({profile.primogems.toLocaleString()} Primos + {profile.intertwinedFates} Fates) · Current Pity: <span className="font-mono font-bold">{currentPity}/90</span> {isGuaranteed ? "(Guaranteed)" : "(50/50)"}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private client-side integration — personal stats are never uploaded to community tables.</span>
          </div>
        </div>
      </Card>

      {/* Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-1 bg-muted/40 rounded-lg border border-border/60 w-fit">
          <button
            onClick={() => setActiveTab("radar")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "radar"
                ? "bg-gold-500/20 text-gold-600 dark:text-gold-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            Rerun Radar
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-gold-500/20 text-gold-600 dark:text-gold-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Wish Event History
          </button>
        </div>

        {activeTab === "history" && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {historySource === "github"
                ? "Masterain98 GitHub Live"
                : historySource === "cache"
                  ? "Cached History"
                  : "Not Loaded"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadHistory(true)}
              disabled={historyLoading}
              className="text-xs gap-1.5 h-8"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
              Sync Banner Data
            </Button>
          </div>
        )}
      </div>

      {activeTab === "radar" && (
      <>
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Filter by character..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs sm:w-48"
          />

          {/* Version Filter */}
          <div className="flex gap-1 p-0.5 bg-muted/40 rounded-md border border-border/60">
            {versions.map((v) => (
              <button
                key={v}
                onClick={() => setFilterVersion(v)}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${filterVersion === v
                    ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {v === "all" ? "All Versions" : `v${v}`}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 p-0.5 bg-muted/40 rounded-md border border-border/60">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${filterStatus === s
                    ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {s === "all" ? "All Statuses" : s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          Showing {filteredPredictions.length} prediction(s)
        </p>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPredictions.map((pred) => {
          const evalRes = pred.evaluation;
          const statusMeta = STATUS_VARIANTS[evalRes.status] ?? { label: evalRes.status, color: "stone" };
          const canAfford = availableWishes >= targetPlanning.wishesToGuaranteedTarget;

          return (
            <Card
              key={pred.id}
              className={`border-border/70 overflow-hidden flex flex-col justify-between transition-all hover:border-gold-500/40 ${evalRes.isOfficiallyConfirmed ? "ring-1 ring-emerald-500/30 bg-emerald-500/5" : ""
                }`}
            >
              <div className="p-4 space-y-3">
                {/* Top Badge Line */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={pred.rarity === 5 ? "rarity-5" : "rarity-4"} className="text-xs">
                    {"★".repeat(pred.rarity)}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted/60 border border-border/60 text-foreground font-semibold">
                      v{pred.estimatedVersion} Phase {pred.estimatedPhase}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${evalRes.isOfficiallyConfirmed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : evalRes.status === "Corroborated"
                            ? "bg-gold-500/15 text-gold-600 dark:text-gold-400 border-gold-500/30"
                            : evalRes.status === "Disputed"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : "bg-muted/50 text-muted-foreground border-border/60"
                        }`}
                    >
                      {evalRes.status}
                    </span>
                  </div>
                </div>

                {/* Character Name & Rerun Flag */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight flex items-center gap-2">
                      <span>{pred.characterName}</span>
                      <ElementIcon element={pred.element} size="sm" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {pred.element} · {pred.weaponType} · {pred.isRerun ? "Estimated Rerun" : "New Character Debut"}
                    </p>
                  </div>

                  {/* Probability Ring / Badge */}
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl font-black font-mono text-gold-600 dark:text-gold-400">
                        {evalRes.isOfficiallyConfirmed ? "100%" : `${evalRes.probabilityPercentage}%`}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                      {evalRes.confidenceLevel}
                    </p>
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${evalRes.isOfficiallyConfirmed
                          ? "bg-emerald-500"
                          : evalRes.probabilityPercentage >= 75
                            ? "bg-gold-500"
                            : evalRes.probabilityPercentage >= 50
                              ? "bg-blue-500"
                              : "bg-stone-500"
                        }`}
                      style={{ width: `${evalRes.probabilityPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{evalRes.independentSourceCount} independent source(s)</span>
                    {evalRes.contradictingEvidenceCount > 0 && (
                      <span className="text-amber-500 font-medium">
                        {evalRes.contradictingEvidenceCount} conflicting report(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Personal Player Planning Integration Callout */}
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Player Target Assessment:</span>
                    <span className={canAfford ? "text-emerald-500 font-semibold" : "text-amber-500 font-semibold"}>
                      {canAfford ? "Guarantee Ready" : `Need ~${Math.max(0, targetPlanning.wishesToGuaranteedTarget - availableWishes)} more wishes`}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Estimated {pred.estimatedVersion} gives ~{(parseInt(pred.estimatedVersion.split(".")[1]) - 3) * 42} days to save.
                  </p>
                </div>
              </div>

              {/* Card Footer: "Why this percentage?" Trigger */}
              <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPrediction(pred)}
                  className="text-xs text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Info className="w-3.5 h-3.5" />
                  Why this percentage?
                </button>

                <span className="text-[10px] text-muted-foreground font-mono">
                  {pred.evidence.length} evidence citation(s)
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      </>
      )}

      {/* Wish Event History Tab (Masterain98/Genshin-Wish-Event-History-Data) */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search banner title or version (e.g. 5.3)..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="h-8 text-xs sm:w-64"
              />
              <div className="flex flex-wrap gap-1 p-0.5 bg-muted/40 rounded-md border border-border/60">
                {["All", "Character Event", "Weapon Event", "Chronicled Wish"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setHistoryCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${
                      historyCategory === cat
                        ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {filteredHistory.length} historical banner(s)
            </p>
          </div>

          {historyLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-xl bg-muted/40 border border-border/50" />
              ))}
            </div>
          ) : pagedHistory.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-border">
              <p className="text-sm font-medium text-foreground">No banner history records match your filters.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &ldquo;Sync Banner Data&rdquo; to fetch the latest wish event history from Masterain98/Genshin-Wish-Event-History-Data.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagedHistory.map((b) => (
                  <Card key={b.id} className="border-border/70 overflow-hidden flex flex-col justify-between">
                    {b.bannerImage && (
                      <div className="h-36 w-full bg-muted/30 overflow-hidden border-b border-border/50">
                        <img
                          src={b.bannerImage}
                          alt={b.title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (b.bannerImageBackup && img.src !== b.bannerImageBackup) {
                              img.src = b.bannerImageBackup;
                            } else {
                              img.style.display = "none";
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="gold" className="text-[10px] font-mono">
                          v{b.version}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {b.bannerCategory}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base text-foreground leading-snug">
                        {b.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {b.startTime.slice(0, 10)} → {b.endTime.slice(0, 10)}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <span>{b.featuredFiveStars.length}× 5★ Featured</span>
                        <span>·</span>
                        <span>{b.featuredFourStars.length}× 4★ Featured</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination
                page={historyPage}
                totalPages={historyTotalPages}
                pageSize={historyPageSize}
                totalItems={filteredHistory.length}
                onPageChange={setHistoryPage}
                onPageSizeChange={setHistoryPageSize}
              />
            </>
          )}
        </div>
      )}

      {/* "Why this percentage?" Explanation Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 lg:left-64 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="genshin-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedPrediction.characterName} (v{selectedPrediction.estimatedVersion})
                  </h3>
                  <Badge variant="gold">
                    {selectedPrediction.evaluation.isOfficiallyConfirmed ? "100% Official" : `${selectedPrediction.evaluation.probabilityPercentage}% Estimated`}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Transparent 5-Factor Heuristic Engine Score Breakdown
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPrediction(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>

            {/* Explanation Summary */}
            <div className="p-3.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-xs text-foreground leading-relaxed">
              <p className="font-semibold text-gold-700 dark:text-gold-300 mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Algorithm Assessment:
              </p>
              {selectedPrediction.evaluation.summaryExplanation}
            </div>

            {/* 5-Factor Score Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">5-Factor Weight Breakdown:</h4>

              {[
                {
                  name: "Historical Source Accuracy (30%)",
                  factor: selectedPrediction.evaluation.breakdown.historicalSourceAccuracy,
                },
                {
                  name: "Independent Source Agreement (25%)",
                  factor: selectedPrediction.evaluation.breakdown.independentSourceAgreement,
                },
                {
                  name: "Evidence Credibility (20%)",
                  factor: selectedPrediction.evaluation.breakdown.evidenceCredibility,
                },
                {
                  name: "Evidence Freshness (15%)",
                  factor: selectedPrediction.evaluation.breakdown.evidenceFreshness,
                },
                {
                  name: "Consistency & Lack of Contradiction (10%)",
                  factor: selectedPrediction.evaluation.breakdown.consistencyWithOtherEvidence,
                },
              ].map(({ name, factor }) => (
                <div key={name} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{name}</span>
                    <span className="font-mono font-bold text-gold-600 dark:text-gold-400">
                      +{factor.weightedScore}% (raw: {factor.rawScore}%)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.explanation}</p>
                </div>
              ))}
            </div>

            {/* Evidence Citation List */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Attributed Primary Evidence:</h4>
              <div className="space-y-2">
                {selectedPrediction.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg border border-border/60 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{ev.source.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {ev.source.platform}
                        </Badge>
                        <Badge variant={ev.stance === "Contradicts" ? "destructive" : "default"} className="text-[10px]">
                          {ev.stance}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        Claim: {ev.claimType} · Historical Accuracy: {Math.round(ev.source.historicalAccuracy * 100)}%
                      </p>
                    </div>

                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gold-600 dark:text-gold-400 hover:underline shrink-0"
                    >
                      Original Post <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Community Evidence Link Submission Modal */}
      {submissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="max-w-md w-full border-gold-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-gold-500" />
                Submit Banner Prediction Evidence
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSubmissionOpen(false)} className="text-xs">
                Cancel
              </Button>
            </div>

            {submissionSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Evidence submitted to the community verification queue!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmittal} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground uppercase">Character</label>
                  <Input
                    required
                    placeholder="e.g. Mavuika, Capitano, Furina"
                    value={submissionData.characterName}
                    onChange={(e) => setSubmissionData({ ...submissionData, characterName: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground uppercase">Estimated Version</label>
                    <Input
                      required
                      placeholder="e.g. 5.4"
                      value={submissionData.version}
                      onChange={(e) => setSubmissionData({ ...submissionData, version: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground uppercase">Source Platform</label>
                    <select
                      className="w-full h-8 px-2 rounded-md border border-border/70 bg-card text-xs text-foreground"
                      value={submissionData.sourcePlatform}
                      onChange={(e) => setSubmissionData({ ...submissionData, sourcePlatform: e.target.value })}
                    >
                      <option value="Reddit">Reddit</option>
                      <option value="Discord">Discord</option>
                      <option value="X">X (Twitter)</option>
                      <option value="Bilibili">Bilibili</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Official">Official Source</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground uppercase">Original Post URL</label>
                  <Input
                    required
                    type="url"
                    placeholder="https://reddit.com/r/Genshin_Impact_Leaks/..."
                    value={submissionData.sourceUrl}
                    onChange={(e) => setSubmissionData({ ...submissionData, sourceUrl: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground uppercase">Evidence Summary & Attribution</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe datamined files, leaker attribution, or livestream timestamps..."
                    value={submissionData.evidenceNotes}
                    onChange={(e) => setSubmissionData({ ...submissionData, evidenceNotes: e.target.value })}
                    className="w-full p-2 rounded-md border border-border/70 bg-card text-xs focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <Button type="submit" variant="fantasy" size="sm" className="w-full text-xs">
                  Submit for Verification
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </AppShell>
  );
}
