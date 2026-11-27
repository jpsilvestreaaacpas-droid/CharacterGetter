"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Plus, X, Users, Sparkles } from "lucide-react";
import {
  PRESET_TEAMS, detectResonances, TeamComposition, Element,
} from "@/lib/data/team-data";
import { CANONICAL_CHARACTERS } from "@/lib/data/canonical-characters";
import { getDemoData } from "@/lib/data/demo-provider";

const ELEMENT_COLORS: Record<string, string> = {
  Pyro: "red", Hydro: "blue", Anemo: "teal", Electro: "purple",
  Dendro: "green", Cryo: "sky", Geo: "yellow",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "green", Medium: "amber", Advanced: "red",
};

export default function TeamsPage() {
  const { characters: ownedChars } = React.useMemo(() => getDemoData(), []);
  const [activeTab, setActiveTab] = React.useState<"presets" | "builder">("presets");
  const [builderSlots, setBuilderSlots] = React.useState<(string | null)[]>([null, null, null, null]);
  const [pickerSlot, setPickerSlot] = React.useState<number | null>(null);

  // Characters in custom builder
  const builderChars = React.useMemo(
    () => builderSlots.map((id) => (id ? CANONICAL_CHARACTERS.find((c) => c.id === id) : null)),
    [builderSlots]
  );
  const builderElements = React.useMemo(
    () => builderChars.filter(Boolean).map((c) => c!.element as Element),
    [builderChars]
  );
  const resonances = React.useMemo(() => detectResonances(builderElements), [builderElements]);

  // Check if player owns a character for preset teams
  const ownedIds = React.useMemo(() => new Set(ownedChars.map((c) => c.characterId)), [ownedChars]);

  function assignSlot(slotIdx: number, charId: string) {
    setBuilderSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = charId;
      return next;
    });
    setPickerSlot(null);
  }

  function clearSlot(slotIdx: number) {
    setBuilderSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Team Compositions
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
              Milestone 2
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synergy matrix, elemental resonance, and custom team builder.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/40 rounded-lg w-fit border border-border/60">
        {(["presets", "builder"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "presets" ? "Preset Teams" : "Team Builder"}
          </button>
        ))}
      </div>

      {/* Preset Teams Tab */}
      {activeTab === "presets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_TEAMS.map((team: TeamComposition) => {
            const ownedCount = team.slots.filter((s) => ownedIds.has(s.characterId)).length;
            const allOwned = ownedCount === 4;

            return (
              <Card key={team.id} className="p-4 border-border/70 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{team.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{team.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge className={`text-xs bg-${DIFFICULTY_COLORS[team.difficulty]}-500/10 text-${DIFFICULTY_COLORS[team.difficulty]}-600 dark:text-${DIFFICULTY_COLORS[team.difficulty]}-400 border-${DIFFICULTY_COLORS[team.difficulty]}-500/30`}>
                      {team.difficulty}
                    </Badge>
                    <span className={`text-xs font-medium ${allOwned ? "text-green-500" : "text-muted-foreground"}`}>
                      {ownedCount}/4 owned
                    </span>
                  </div>
                </div>

                {/* Character Slots */}
                <div className="grid grid-cols-4 gap-2">
                  {team.slots.map((slot) => {
                    const canon = CANONICAL_CHARACTERS.find((c) => c.id === slot.characterId);
                    const isOwned = ownedIds.has(slot.characterId);
                    const color = ELEMENT_COLORS[canon?.element ?? ""] ?? "gray";
                    return (
                      <div
                        key={slot.characterId}
                        className={`p-2 rounded-lg border text-center space-y-1 transition-colors ${
                          isOwned
                            ? "border-border/70 bg-muted/30"
                            : "border-border/40 bg-muted/10 opacity-60"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full bg-${color}-500 mx-auto`} />
                        <p className="text-xs font-medium text-foreground leading-tight">
                          {canon?.name ?? slot.characterId}
                        </p>
                        <p className="text-xs text-muted-foreground">{slot.role}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reaction focus */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-gold-500" />
                  <span>{team.reactionFocus}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Team Builder Tab */}
      {activeTab === "builder" && (
        <div className="space-y-4">
          {/* 4 Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {builderSlots.map((id, i) => {
              const canon = id ? CANONICAL_CHARACTERS.find((c) => c.id === id) : null;
              const color = canon ? (ELEMENT_COLORS[canon.element] ?? "gray") : "gray";
              return (
                <div key={i} className="relative">
                  <Card
                    className={`p-4 border-border/70 text-center cursor-pointer hover:border-gold-500/50 transition-colors min-h-[100px] flex flex-col items-center justify-center gap-2 ${
                      pickerSlot === i ? "border-gold-500/60 bg-gold-500/5" : ""
                    }`}
                    onClick={() => setPickerSlot(pickerSlot === i ? null : i)}
                  >
                    {canon ? (
                      <>
                        <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                        <p className="text-sm font-semibold text-foreground">{canon.name}</p>
                        <p className="text-xs text-muted-foreground">{canon.element} · {canon.weaponType}</p>
                        <Badge variant={canon.rarity === 5 ? "five-star" : "four-star"} className="text-xs">
                          {"★".repeat(canon.rarity)}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Slot {i + 1}</p>
                      </>
                    )}
                  </Card>
                  {canon && (
                    <button
                      className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); clearSlot(i); }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resonance display */}
          {resonances.length > 0 && (
            <Card className="p-4 border-border/70 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <h4 className="text-sm font-semibold text-foreground">Active Resonances</h4>
              </div>
              <div className="space-y-2">
                {resonances.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 text-sm">
                    <span className={`font-semibold text-${r.color}-500 shrink-0`}>{r.name}</span>
                    <span className="text-muted-foreground">{r.effect}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Character Picker */}
          {pickerSlot !== null && (
            <Card className="p-4 border-gold-500/30 bg-gold-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold-500" />
                  Select character for Slot {pickerSlot + 1}
                  <span className="text-xs text-muted-foreground font-normal">(Owned characters shown first)</span>
                </h4>
                <button onClick={() => setPickerSlot(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                {[...CANONICAL_CHARACTERS]
                  .sort((a, b) => {
                    const ao = ownedIds.has(a.id) ? 0 : 1;
                    const bo = ownedIds.has(b.id) ? 0 : 1;
                    return ao - bo || b.rarity - a.rarity || a.name.localeCompare(b.name);
                  })
                  .map((c) => {
                    const color = ELEMENT_COLORS[c.element] ?? "gray";
                    const alreadySlotted = builderSlots.includes(c.id);
                    const isOwned = ownedIds.has(c.id);
                    return (
                      <button
                        key={c.id}
                        disabled={alreadySlotted}
                        onClick={() => assignSlot(pickerSlot, c.id)}
                        className={`p-2.5 rounded-lg border text-left transition-colors ${
                          alreadySlotted
                            ? "opacity-30 cursor-not-allowed border-border/40 bg-muted/20"
                            : isOwned
                            ? "border-border/70 bg-muted/30 hover:border-gold-500/50 hover:bg-gold-500/5"
                            : "border-border/40 bg-muted/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 shrink-0`} />
                          <span className="text-xs font-semibold text-foreground truncate">{c.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{c.element}</p>
                      </button>
                    );
                  })}
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
