"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CharacterCard } from "@/components/ui/character-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { getDemoData } from "@/lib/data/demo-provider";
import { getPlaystylesForCharacter } from "@/lib/data/playstyles";
import { analyzePlayerBuildAgainstPlaystyle } from "@/lib/playstyles/analyzer";
import {
  Search, Sparkles, Swords,
} from "lucide-react";

const ELEMENTS = ["All", "Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];
const RARITIES = ["All", "5-Star", "4-Star"];

export default function CharactersPage() {
  const { characters } = getDemoData();
  const [selectedElement, setSelectedElement] = React.useState("All");
  const [selectedRarity, setSelectedRarity] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal State
  const [activeModalChar, setActiveModalChar] = React.useState<(typeof characters)[0] | null>(null);
  const [modalTab, setModalTab] = React.useState<"overview" | "playstyles">("overview");
  const [selectedPlaystyleId, setSelectedPlaystyleId] = React.useState<string | null>(null);

  const characterPlaystyles = activeModalChar ? getPlaystylesForCharacter(activeModalChar.characterId) : [];
  const activePlaystyle = characterPlaystyles.find((p) => p.id === selectedPlaystyleId) ?? characterPlaystyles[0];

  // Run Personalization Analyzer if both character and playstyle exist
  const analysisReport = React.useMemo(() => {
    if (!activeModalChar || !activePlaystyle) return null;
    return analyzePlayerBuildAgainstPlaystyle(
      {
        characterId: activeModalChar.characterId,
        level: activeModalChar.level,
        constellation: activeModalChar.constellation,
        talentNormal: activeModalChar.talentNormal,
        talentSkill: activeModalChar.talentSkill,
        talentBurst: activeModalChar.talentBurst,
        // Demo equipped state:
        equippedWeaponName: activeModalChar.characterId === "furina" ? "Fleuve Cendre Ferryman" : undefined,
        equippedArtifactSet1: activeModalChar.characterId === "furina" ? "Golden Troupe" : undefined,
      },
      activePlaystyle,
      characters.map((c) => c.characterId)
    );
  }, [activeModalChar, activePlaystyle, characters]);

  const filteredCharacters = characters.filter((char) => {
    const matchesElement = selectedElement === "All" || char.element === selectedElement;
    const matchesRarity =
      selectedRarity === "All" ||
      (selectedRarity === "5-Star" && char.rarity === 5) ||
      (selectedRarity === "4-Star" && char.rarity === 4);
    const matchesSearch =
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (char.title?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    return matchesElement && matchesRarity && matchesSearch;
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Character Roster & Playstyles
            <span className="text-sm font-normal text-muted-foreground font-serif italic">
              ({characters.length} Registered)
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage owned characters, explore multi-role playstyles, and evaluate build synergy.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/70 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search characters by name..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rarity Toggles */}
          <div className="flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30">
            {RARITIES.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedRarity === r
                    ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Element Selector */}
          <div className="flex flex-wrap items-center gap-1">
            {ELEMENTS.map((elem) => (
              <button
                key={elem}
                onClick={() => setSelectedElement(elem)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors border ${
                  selectedElement === elem
                    ? "bg-primary text-primary-foreground border-transparent font-semibold shadow-sm"
                    : "bg-card border-border/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                {elem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {filteredCharacters.map((char) => (
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
            onClick={() => {
              setActiveModalChar(char);
              setModalTab("overview");
              setSelectedPlaystyleId(null);
            }}
          />
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No characters match your search filter.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-gold-500"
            onClick={() => {
              setSelectedElement("All");
              setSelectedRarity("All");
              setSearchQuery("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Enhanced Character Details & Playstyle Modal */}
      {activeModalChar && (
        <Dialog
          open={!!activeModalChar}
          onOpenChange={(open) => {
            if (!open) setActiveModalChar(null);
          }}
          title={activeModalChar.name}
          description={activeModalChar.title}
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Modal Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <Badge variant={activeModalChar.element.toLowerCase() as any}>
                  {activeModalChar.element}
                </Badge>
                <Badge variant={activeModalChar.rarity === 5 ? "rarity-5" : "rarity-4"}>
                  {activeModalChar.rarity}-Star {activeModalChar.weaponType}
                </Badge>
              </div>

              <div className="flex gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60">
                <button
                  onClick={() => setModalTab("overview")}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    modalTab === "overview"
                      ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setModalTab("playstyles")}
                  className={`text-xs px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                    modalTab === "playstyles"
                      ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Swords className="w-3 h-3" />
                  Playstyles ({characterPlaystyles.length})
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {modalTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground">Level</span>
                    <p className="font-bold text-sm">
                      {activeModalChar.level} <span className="text-muted-foreground text-xs">/90</span>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground">Constellation</span>
                    <p className="font-bold text-sm">C{activeModalChar.constellation}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground">Friendship</span>
                    <p className="font-bold text-sm">Lv. {activeModalChar.friendshipLevel}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border/80 space-y-1.5 text-xs">
                  <span className="font-semibold text-foreground">Talent Investment:</span>
                  <div className="flex items-center justify-between text-muted-foreground font-mono">
                    <span>Normal Attack: {activeModalChar.talentNormal}</span>
                    <span>Elemental Skill: {activeModalChar.talentSkill}</span>
                    <span>Elemental Burst: {activeModalChar.talentBurst}</span>
                  </div>
                </div>

                {characterPlaystyles.length > 0 && (
                  <div className="p-3 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-gold-700 dark:text-gold-300">
                        {characterPlaystyles.length} Combat Playstyle Archetype(s) Available
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Compare your equipped build against theorycrafted guides.
                      </p>
                    </div>
                    <Button
                      variant="outline-gold"
                      size="sm"
                      onClick={() => setModalTab("playstyles")}
                      className="text-xs"
                    >
                      View Archetypes
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PLAYSTYLE ARCHETYPES */}
            {modalTab === "playstyles" && (
              <div className="space-y-4">
                {characterPlaystyles.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    Playstyles for {activeModalChar.name} are currently undergoing theorycrafting verification.
                  </div>
                ) : (
                  <>
                    {/* Playstyle Selector Badges */}
                    <div className="flex flex-wrap gap-2">
                      {characterPlaystyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedPlaystyleId(style.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${
                            (activePlaystyle?.id === style.id)
                              ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold border-gold-500/40 shadow-sm"
                              : "bg-muted/30 text-muted-foreground border-border/60 hover:text-foreground"
                          }`}
                        >
                          <span className="font-semibold block">{style.name}</span>
                          <span className="text-[10px] text-muted-foreground">{style.combatRole} · {style.investmentLevel} Investment</span>
                        </button>
                      ))}
                    </div>

                    {activePlaystyle && (
                      <div className="space-y-4 text-xs">
                        {/* Playstyle Description & Mechanics */}
                        <div className="p-3 rounded-lg bg-card border border-border/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-foreground">{activePlaystyle.name}</h4>
                            <Badge variant="gold" className="text-[10px]">
                              {activePlaystyle.combatRole}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {activePlaystyle.description}
                          </p>
                          <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/50">
                            <span className="font-semibold text-foreground">Mechanics: </span>
                            {activePlaystyle.gameplayMechanics}
                          </div>
                        </div>

                        {/* Player Personalization Suitability Card */}
                        {analysisReport && (
                          <div className="p-3.5 rounded-lg bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-gold-500" />
                                Personal Player Synergy Score
                              </span>
                              <span className="font-mono text-base font-black text-gold-600 dark:text-gold-400">
                                {analysisReport.overallSuitabilityScore}% Match
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <p className="text-muted-foreground leading-relaxed">
                                <span className="font-semibold text-foreground">Weapon Assessment: </span>
                                {analysisReport.weaponAssessment.recommendation}
                              </p>
                              <p className="text-muted-foreground leading-relaxed">
                                <span className="font-semibold text-foreground">Artifact Set: </span>
                                {analysisReport.artifactAssessment.recommendation}
                              </p>
                            </div>

                            {analysisReport.upgradeChecklist.length > 0 && (
                              <div className="p-2 rounded bg-muted/40 border border-border/60 space-y-1">
                                <p className="font-semibold text-foreground text-[11px]">Recommended Next Steps:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[11px]">
                                  {analysisReport.upgradeChecklist.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recommended Equipment Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Weapons */}
                          <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2">
                            <span className="font-bold text-foreground">Recommended Weapons</span>
                            <div className="space-y-2">
                              {activePlaystyle.recommendedWeapons.map((w, idx) => (
                                <div key={idx} className="p-2 rounded bg-muted/30 border border-border/50">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground">{w.name}</span>
                                    <Badge variant="outline" className="text-[10px]">
                                      {w.tier}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{w.whyRecommended}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Artifacts & Stats */}
                          <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2">
                            <span className="font-bold text-foreground">Artifacts & Stat Priorities</span>
                            <div className="space-y-2">
                              {activePlaystyle.recommendedArtifacts.map((a, idx) => (
                                <div key={idx} className="p-2 rounded bg-muted/30 border border-border/50">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground">{a.setNames.join(" / ")}</span>
                                    <Badge variant="outline" className="text-[10px]">{a.pieceBonus}</Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{a.whyRecommended}</p>
                                </div>
                              ))}
                              <div className="p-2 rounded bg-muted/20 border border-border/40 text-[11px] space-y-0.5">
                                <p><span className="text-muted-foreground">Sands:</span> {activePlaystyle.statPriorities.sandsMain.join(" / ")}</p>
                                <p><span className="text-muted-foreground">Goblet:</span> {activePlaystyle.statPriorities.gobletMain.join(" / ")}</p>
                                <p><span className="text-muted-foreground">Circlet:</span> {activePlaystyle.statPriorities.circletMain.join(" / ")}</p>
                                <p><span className="text-muted-foreground">Substats:</span> {activePlaystyle.statPriorities.substatPriority.join(" > ")}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Standard Rotation Guide */}
                        {activePlaystyle.rotation.length > 0 && (
                          <div className="p-3 rounded-lg border border-border/70 bg-card space-y-2">
                            <span className="font-bold text-foreground">Standard Combat Rotation:</span>
                            <div className="space-y-1">
                              {activePlaystyle.rotation.map((r) => (
                                <div key={r.stepNumber} className="flex items-start gap-2 text-[11px]">
                                  <span className="font-mono font-bold text-gold-600 dark:text-gold-400">
                                    {r.stepNumber}.
                                  </span>
                                  <div>
                                    <span className="font-semibold text-foreground">{r.characterName}: </span>
                                    <span className="text-muted-foreground">{r.action}</span>
                                    {r.notes && <span className="text-muted-foreground/80 italic"> ({r.notes})</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Source Citation */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                          <span>
                            Source: {activePlaystyle.sourceReference.author} ({activePlaystyle.sourceReference.publication})
                          </span>
                          <span>Last updated: {activePlaystyle.sourceReference.lastUpdated}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Dialog>
      )}
    </AppShell>
  );
}
