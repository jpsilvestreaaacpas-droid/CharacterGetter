"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CharacterCard } from "@/components/ui/character-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ElementIcon } from "@/components/ui/element-icon";
import { getDemoData } from "@/lib/data/demo-provider";
import { getPlaystylesForCharacter } from "@/lib/data/playstyles";
import { analyzePlayerBuildAgainstPlaystyle } from "@/lib/playstyles/analyzer";
import {
  Search, Sparkles, Swords, X,
} from "lucide-react";

const ELEMENTS = ["All", "Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];
const RARITIES = ["All", "5-Star", "4-Star"];

type DemoCharacter = ReturnType<typeof getDemoData>["characters"][number];
type AnalysisReport = ReturnType<typeof analyzePlayerBuildAgainstPlaystyle>;

function toBuildInput(char: DemoCharacter) {
  return {
    characterId: char.characterId,
    level: char.level,
    constellation: char.constellation,
    talentNormal: char.talentNormal,
    talentSkill: char.talentSkill,
    talentBurst: char.talentBurst,
    // Demo equipped state:
    equippedWeaponName: char.characterId === "furina" ? "Fleuve Cendre Ferryman" : undefined,
    equippedArtifactSet1: char.characterId === "furina" ? "Golden Troupe" : undefined,
  };
}

function scoreBarColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-gold-500";
  return "bg-amber-500";
}

const TAB_BASE = "text-xs px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5";
const TAB_ACTIVE = "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold";
const TAB_IDLE = "text-muted-foreground hover:text-foreground";

export default function CharactersPage() {
  const { characters } = getDemoData();
  const [selectedElement, setSelectedElement] = React.useState("All");
  const [selectedRarity, setSelectedRarity] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modal State
  const [activeModalChar, setActiveModalChar] = React.useState<DemoCharacter | null>(null);
  const [modalTab, setModalTab] = React.useState<"overview" | "playstyles">("overview");
  const [selectedPlaystyleId, setSelectedPlaystyleId] = React.useState<string | null>(null);

  const characterPlaystyles = React.useMemo(
    () => (activeModalChar ? getPlaystylesForCharacter(activeModalChar.characterId) : []),
    [activeModalChar]
  );
  const activePlaystyle =
    characterPlaystyles.find((p) => p.id === selectedPlaystyleId) ?? characterPlaystyles[0];

  const ownedIds = React.useMemo(() => characters.map((c) => c.characterId), [characters]);

  // Run the Personalization Analyzer for every playstyle so the overview can rank them
  const analysisReports = React.useMemo<Record<string, AnalysisReport>>(() => {
    if (!activeModalChar) return {};
    const build = toBuildInput(activeModalChar);
    return Object.fromEntries(
      characterPlaystyles.map((p) => [p.id, analyzePlayerBuildAgainstPlaystyle(build, p, ownedIds)])
    );
  }, [activeModalChar, characterPlaystyles, ownedIds]);

  const analysisReport = activePlaystyle ? analysisReports[activePlaystyle.id] ?? null : null;

  // Close on Escape + lock background scroll while the modal is open
  React.useEffect(() => {
    if (!activeModalChar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModalChar(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.modalOpen = "true"; // new
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.modalOpen; // new
    };
  }, [activeModalChar]);

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

  const talents = activeModalChar
    ? [
      { label: "Normal Attack", value: activeModalChar.talentNormal },
      { label: "Elemental Skill", value: activeModalChar.talentSkill },
      { label: "Elemental Burst", value: activeModalChar.talentBurst },
    ]
    : [];

  const equipped = activeModalChar ? toBuildInput(activeModalChar) : null;

  // Playstyles ranked by personal match, best first
  const rankedPlaystyles = [...characterPlaystyles].sort(
    (a, b) =>
      (analysisReports[b.id]?.overallSuitabilityScore ?? 0) -
      (analysisReports[a.id]?.overallSuitabilityScore ?? 0)
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border/70 shadow-sm min-w-0">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search characters by name..."
            className="pl-9 text-xs w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Rarity Toggles */}
          <div className="flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30">
            {RARITIES.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-md transition-colors ${selectedRarity === r
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
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs rounded-md font-medium transition-colors border flex items-center gap-1 sm:gap-1.5 ${selectedElement === elem
                    ? "bg-primary text-primary-foreground border-transparent font-semibold shadow-sm"
                    : "bg-card border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
              >
                {elem !== "All" && <ElementIcon element={elem} size="xs" />}
                <span>{elem}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
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

      {/* Character Detail Modal: responsive layout */}
      {activeModalChar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalChar(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeModalChar.name} details`}
            className="w-full max-w-7xl max-h-[96vh] sm:h-[94vh] flex flex-col rounded-xl sm:rounded-2xl border border-gold-500/40 bg-card shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-5 py-3 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-foreground leading-tight truncate">
                    {activeModalChar.name}
                  </h3>
                  {activeModalChar.title && (
                    <p className="text-xs text-muted-foreground font-serif italic truncate">
                      {activeModalChar.title}
                    </p>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Badge variant={activeModalChar.element.toLowerCase() as any} className="flex items-center gap-1.5 pl-1.5 pr-2">
                    <ElementIcon element={activeModalChar.element} size="xs" />
                    <span>{activeModalChar.element}</span>
                  </Badge>
                  <Badge variant={activeModalChar.rarity === 5 ? "rarity-5" : "rarity-4"}>
                    {activeModalChar.rarity}-Star {activeModalChar.weaponType}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60">
                  <button
                    onClick={() => setModalTab("overview")}
                    className={`${TAB_BASE} ${modalTab === "overview" ? TAB_ACTIVE : TAB_IDLE}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setModalTab("playstyles")}
                    className={`${TAB_BASE} ${modalTab === "playstyles" ? TAB_ACTIVE : TAB_IDLE}`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    Playstyles ({characterPlaystyles.length})
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveModalChar(null)}
                  aria-label="Close"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body: sidebar + content */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] overflow-y-auto lg:overflow-hidden">
              {/* Sidebar: always-visible character snapshot */}
              <aside className="lg:overflow-y-auto p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/10">
                {/* Badges for small screens (hidden in header) */}
                <div className="flex sm:hidden items-center gap-2">
                  <Badge variant={activeModalChar.element.toLowerCase() as any}>
                    {activeModalChar.element}
                  </Badge>
                  <Badge variant={activeModalChar.rarity === 5 ? "rarity-5" : "rarity-4"}>
                    {activeModalChar.rarity}-Star {activeModalChar.weaponType}
                  </Badge>
                </div>

                {/* Level */}
                <div className="p-3 rounded-lg bg-card border border-border/70 space-y-2 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-bold text-base">
                      {activeModalChar.level}
                      <span className="text-muted-foreground text-xs font-normal"> /90</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold-500"
                      style={{ width: `${Math.min(100, (activeModalChar.level / 90) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Constellation */}
                <div className="p-3 rounded-lg bg-card border border-border/70 space-y-2 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted-foreground">Constellation</span>
                    <span className="font-bold text-base">C{activeModalChar.constellation}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < activeModalChar.constellation ? "bg-gold-500" : "bg-muted/60"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Friendship */}
                <div className="p-3 rounded-lg bg-card border border-border/70 flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Friendship</span>
                  <span className="font-bold text-base">Lv. {activeModalChar.friendshipLevel}</span>
                </div>

                {/* Talents */}
                <div className="p-3 rounded-lg bg-card border border-border/70 space-y-2.5 text-xs">
                  <span className="font-semibold text-foreground">Talent Investment</span>
                  {talents.map((t) => (
                    <div key={t.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t.label}</span>
                        <span className="font-mono font-semibold text-foreground">{t.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gold-500/80"
                          style={{ width: `${Math.min(100, (t.value / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Equipped build */}
                <div className="p-3 rounded-lg bg-card border border-border/70 space-y-2 text-xs">
                  <span className="font-semibold text-foreground">Equipped Build</span>
                  <div>
                    <p className="text-muted-foreground">Weapon</p>
                    <p className="font-medium text-foreground">
                      {equipped?.equippedWeaponName ?? "Not tracked"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Artifact Set</p>
                    <p className="font-medium text-foreground">
                      {equipped?.equippedArtifactSet1 ?? "Not tracked"}
                    </p>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <section className="lg:overflow-y-auto p-5 space-y-5 min-w-0">
                {/* TAB 1: OVERVIEW */}
                {modalTab === "overview" && (
                  <div className="space-y-4">
                    {characterPlaystyles.length === 0 ? (
                      <div className="p-10 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                        Playstyles for {activeModalChar.name} are currently undergoing theorycrafting verification.
                      </div>
                    ) : (
                      <>
                        <div className="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-sm text-gold-700 dark:text-gold-300">
                              {characterPlaystyles.length} Combat Playstyle Archetype(s) Available
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              Ranked by how well your current build matches each theorycrafted guide.
                            </p>
                          </div>
                          <Button
                            variant="outline-gold"
                            size="sm"
                            onClick={() => setModalTab("playstyles")}
                            className="text-xs shrink-0"
                          >
                            View Full Details
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {rankedPlaystyles.map((style, idx) => {
                            const score = analysisReports[style.id]?.overallSuitabilityScore ?? 0;
                            return (
                              <button
                                key={style.id}
                                onClick={() => {
                                  setSelectedPlaystyleId(style.id);
                                  setModalTab("playstyles");
                                }}
                                className="text-left p-4 rounded-lg border border-border/70 bg-card hover:border-gold-500/40 transition-colors space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-sm text-foreground flex items-center gap-2">
                                      {style.name}
                                      {idx === 0 && (
                                        <Badge variant="gold" className="text-[10px]">
                                          Best match
                                        </Badge>
                                      )}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {style.combatRole} · {style.investmentLevel} Investment
                                    </p>
                                  </div>
                                  <span className="font-mono text-lg font-black text-gold-600 dark:text-gold-400">
                                    {score}%
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${scoreBarColor(score)}`}
                                    style={{ width: `${Math.min(100, score)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                  {style.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 2: PLAYSTYLE ARCHETYPES */}
                {modalTab === "playstyles" && (
                  <div className="space-y-4">
                    {characterPlaystyles.length === 0 ? (
                      <div className="p-10 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                        Playstyles for {activeModalChar.name} are currently undergoing theorycrafting verification.
                      </div>
                    ) : (
                      <>
                        {/* Playstyle Selector */}
                        <div className="flex flex-wrap gap-2">
                          {characterPlaystyles.map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setSelectedPlaystyleId(style.id)}
                              className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${activePlaystyle?.id === style.id
                                  ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold border-gold-500/40 shadow-sm"
                                  : "bg-muted/30 text-muted-foreground border-border/60 hover:text-foreground"
                                }`}
                            >
                              <span className="font-semibold block">{style.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {style.combatRole} · {style.investmentLevel} Investment
                              </span>
                            </button>
                          ))}
                        </div>

                        {activePlaystyle && (
                          <div className="space-y-4 text-xs">
                            {/* Description + Synergy side by side on wide screens */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-card border border-border/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-base text-foreground">{activePlaystyle.name}</h4>
                                  <Badge variant="gold" className="text-[10px]">
                                    {activePlaystyle.combatRole}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground leading-relaxed text-[13px]">
                                  {activePlaystyle.description}
                                </p>
                                <div className="pt-2 text-xs text-muted-foreground border-t border-border/50">
                                  <span className="font-semibold text-foreground">Mechanics: </span>
                                  {activePlaystyle.gameplayMechanics}
                                </div>
                              </div>

                              {analysisReport && (
                                <div className="p-4 rounded-lg bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/30 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                                      <Sparkles className="w-4 h-4 text-gold-500" />
                                      Personal Player Synergy Score
                                    </span>
                                    <span className="font-mono text-xl font-black text-gold-600 dark:text-gold-400">
                                      {analysisReport.overallSuitabilityScore}% Match
                                    </span>
                                  </div>

                                  <div className="space-y-1.5 text-[13px]">
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
                                    <div className="p-2.5 rounded bg-muted/40 border border-border/60 space-y-1">
                                      <p className="font-semibold text-foreground text-xs">Recommended Next Steps:</p>
                                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-xs">
                                        {analysisReport.upgradeChecklist.map((step, idx) => (
                                          <li key={idx}>{step}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Recommended Weapons + Artifact Sets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg border border-border/70 bg-card space-y-2.5">
                                <span className="font-bold text-sm text-foreground">Recommended Weapons</span>
                                <div className="space-y-2">
                                  {activePlaystyle.recommendedWeapons.map((w, idx) => (
                                    <div key={idx} className="p-2.5 rounded bg-muted/30 border border-border/50">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-foreground">{w.name}</span>
                                        <Badge variant="outline" className="text-[10px]">
                                          {w.tier}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">{w.whyRecommended}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-4 rounded-lg border border-border/70 bg-card space-y-2.5">
                                <span className="font-bold text-sm text-foreground">Recommended Artifact Sets</span>
                                <div className="space-y-2">
                                  {activePlaystyle.recommendedArtifacts.map((a, idx) => (
                                    <div key={idx} className="p-2.5 rounded bg-muted/30 border border-border/50">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-foreground">{a.setNames.join(" / ")}</span>
                                        <Badge variant="outline" className="text-[10px]">
                                          {a.pieceBonus}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">{a.whyRecommended}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Stat Priorities (full-width row) */}
                            <div className="p-4 rounded-lg border border-border/70 bg-card space-y-2.5">
                              <span className="font-bold text-sm text-foreground">Stat Priorities</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                                {[
                                  { label: "Sands", value: activePlaystyle.statPriorities.sandsMain.join(" / ") },
                                  { label: "Goblet", value: activePlaystyle.statPriorities.gobletMain.join(" / ") },
                                  { label: "Circlet", value: activePlaystyle.statPriorities.circletMain.join(" / ") },
                                  { label: "Substats", value: activePlaystyle.statPriorities.substatPriority.join(" > ") },
                                ].map((s) => (
                                  <div key={s.label} className="p-2.5 rounded bg-muted/30 border border-border/50">
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                      {s.label}
                                    </p>
                                    <p className="font-medium text-foreground mt-0.5">{s.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Standard Rotation Guide */}
                            {activePlaystyle.rotation.length > 0 && (
                              <div className="p-4 rounded-lg border border-border/70 bg-card space-y-2.5">
                                <span className="font-bold text-sm text-foreground">Standard Combat Rotation</span>
                                <div className="space-y-1.5">
                                  {activePlaystyle.rotation.map((r) => (
                                    <div key={r.stepNumber} className="flex items-start gap-2.5 text-xs">
                                      <span className="font-mono font-bold text-gold-600 dark:text-gold-400 w-5 shrink-0">
                                        {r.stepNumber}.
                                      </span>
                                      <div>
                                        <span className="font-semibold text-foreground">{r.characterName}: </span>
                                        <span className="text-muted-foreground">{r.action}</span>
                                        {r.notes && (
                                          <span className="text-muted-foreground/80 italic"> ({r.notes})</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Source Citation */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
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
              </section>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}