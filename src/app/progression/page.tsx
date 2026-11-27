"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Calendar, BookOpen, Coins, Crown,
  ChevronDown, ChevronUp, Zap, AlertCircle,
} from "lucide-react";
import { getDemoData } from "@/lib/data/demo-provider";
import { CANONICAL_CHARACTERS } from "@/lib/data/canonical-characters";
import { calcAscensionCost, calcTalentCost, getTodayDomains } from "@/lib/data/progression-data";
import { CalculationService } from "@/lib/services/calculation-service";
import { CalculationDetailsTrigger } from "@/components/ui/calculation-details";

const ELEMENT_COLORS: Record<string, string> = {
  Pyro: "red", Hydro: "blue", Anemo: "teal", Electro: "purple",
  Dendro: "green", Cryo: "sky", Geo: "yellow",
};

export default function ProgressionPage() {
  const { characters } = getDemoData();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const todayDomains = getTodayDomains();
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

  // Characters not yet fully levelled
  const inProgress = characters.filter((c) => c.level < 90 || c.ascension < 6);
  const complete = characters.filter((c) => c.level >= 90 && c.ascension >= 6);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Character Progression
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
              Milestone 2
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ascension targets, talent priority roadmaps, and farming day schedules.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Demo Data
        </div>
      </div>

      {/* Today's Domains */}
      <Card className="p-4 border-border/70 space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gold-500" />
          <h3 className="font-semibold text-sm text-foreground">Today&apos;s Talent Domains — {dayName}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {todayDomains.map((d) => (
            <div key={d.name} className="text-xs bg-muted/50 border border-border/60 rounded px-3 py-1.5">
              <span className="font-medium text-foreground">{d.name}</span>
              <span className="text-muted-foreground ml-2">{d.books.join(" · ")}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "In Progress", value: inProgress.length, icon: TrendingUp, color: "gold" },
          { label: "Fully Built", value: complete.length, icon: Zap, color: "green" },
          { label: "Total Roster", value: characters.length, icon: BookOpen, color: "blue" },
          { label: "Avg Level", value: Math.round(characters.reduce((a, c) => a + c.level, 0) / characters.length), icon: Crown, color: "purple" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 border-border/70 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-${s.color}-500/10 text-${s.color}-500`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">{s.label}</p>
                <p className="text-xl font-bold font-mono">{s.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* In-Progress Characters */}
      {inProgress.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-500" />
            Characters In Progress ({inProgress.length})
          </h3>
          <div className="space-y-2">
            {inProgress.map((c) => {
              const canon = CANONICAL_CHARACTERS.find((x) => x.id === c.characterId);
              const color = ELEMENT_COLORS[c.element] ?? "gray";
              const isExpanded = expandedId === c.characterId;
              const ascCost = calcAscensionCost(c.ascension, 6, (c.rarity as 4 | 5));
              const avgTalent = Math.round((c.talentNormal + c.talentSkill + c.talentBurst) / 3);
              const talentCost = calcTalentCost(avgTalent, 10);

              return (
                <Card key={c.characterId} className="border-border/70 overflow-hidden">
                  <button
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : c.characterId)}
                  >
                    {/* Element dot */}
                    <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{c.name}</span>
                        <Badge variant={c.rarity === 5 ? "five-star" : "four-star"} className="text-xs">
                          {"★".repeat(c.rarity)}
                        </Badge>
                        <span className={`text-xs text-${color}-500`}>{c.element}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Lv {c.level}/90</span>
                        <span>Asc {c.ascension}/6</span>
                        <span>Talents {c.talentNormal}/{c.talentSkill}/{c.talentBurst}</span>
                      </div>
                    </div>
                    {/* Level progress */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <div className="w-24 h-1.5 rounded-full bg-muted/60">
                        <div
                          className={`h-1.5 rounded-full bg-${color}-500`}
                          style={{ width: `${Math.round((c.level / 90) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                        {Math.round((c.level / 90) * 100)}%
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                    {/* Expanded cost breakdown */}
                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 pb-4 pt-3 bg-muted/20 grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Ascension to 6 ({c.ascension} → 6)</p>
                            {(() => {
                              const calc = CalculationService.calculateAscensionMaterialRequirement(c.ascension, 6, c.rarity as 4 | 5);
                              return (
                                <CalculationDetailsTrigger
                                  meta={calc.meta}
                                  explanation={calc.explanation}
                                  triggerLabel="Rules & Sources"
                                />
                              );
                            })()}
                          </div>
                          {ascCost.phasesNeeded === 0 ? (
                            <p className="text-xs text-green-500">✓ Already fully ascended</p>
                          ) : (
                            <div className="flex items-center gap-2 text-sm">
                              <Coins className="w-4 h-4 text-amber-500" />
                              <span className="font-mono">{ascCost.mora.toLocaleString()} Mora</span>
                              <span className="text-muted-foreground">· {ascCost.phasesNeeded} phases</span>
                            </div>
                          )}
                        </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Talents avg {avgTalent} → 10</p>
                        {avgTalent >= 10 ? (
                          <p className="text-xs text-green-500">✓ Talents maxed</p>
                        ) : (
                          <div className="space-y-1 text-xs text-muted-foreground font-mono">
                            <div className="flex gap-3">
                              <span>Mora: {talentCost.mora.toLocaleString()}</span>
                              <span>Guides: {talentCost.guideBooks}</span>
                            </div>
                            <div className="flex gap-3">
                              <span>Philosophies: {talentCost.philosophyBooks}</span>
                              <span>Weekly drops: {talentCost.weeklyDrops}</span>
                              {talentCost.crowns > 0 && <span className="text-gold-500">Crowns: {talentCost.crowns}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Fully Built Characters */}
      {complete.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            Fully Built ({complete.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {complete.map((c) => {
              const color = ELEMENT_COLORS[c.element] ?? "gray";
              return (
                <Card key={c.characterId} className="p-3 border-border/70 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-${color}-500 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Lv 90 · Talents {c.talentNormal}/{c.talentSkill}/{c.talentBurst}</p>
                  </div>
                  <Badge variant="default" className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20">
                    ✓
                  </Badge>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
