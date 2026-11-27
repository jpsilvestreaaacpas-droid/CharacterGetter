"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CharacterCard } from "@/components/ui/character-card";
import { CANONICAL_CHARACTERS } from "@/lib/data/canonical-characters";
import { characterCatalogRepo } from "@/lib/repositories/CharacterCatalogRepository";
import { playerCharacterRepo } from "@/lib/repositories/PlayerCharacterRepository";
import type { GameCharacterType } from "@/lib/data/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ElementIcon } from "@/components/ui/element-icon";
import { getDemoData } from "@/lib/data/demo-provider";
import { getPlaystylesForCharacter } from "@/lib/data/playstyles";
import { analyzePlayerBuildAgainstPlaystyle } from "@/lib/playstyles/analyzer";
import {
  Plus, Search, Sparkles, Swords, X,
} from "lucide-react";

const ELEMENTS = ["All", "Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];
const RARITIES = ["All", "5-Star", "4-Star"];
const WEAPON_TYPES = ["All", "Sword", "Claymore", "Polearm", "Bow", "Catalyst"];


type DemoCharacter = ReturnType<typeof getDemoData>["characters"][number];
type OwnedCharacter = DemoCharacter & { weaponName?: string; ascension?: number };
type AnalysisReport = ReturnType<typeof analyzePlayerBuildAgainstPlaystyle>;

function toBuildInput(char: OwnedCharacter) {
  return {
    characterId: char.characterId,
    level: char.level,
    constellation: char.constellation,
    talentNormal: char.talentNormal,
    talentSkill: char.talentSkill,
    talentBurst: char.talentBurst,
    equippedWeaponName: char.weaponName || undefined,
    equippedArtifactSet1: char.characterId === "furina" ? "Golden Troupe" : undefined,
  };
}

function scoreBarColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-gold-500";
  return "bg-amber-500";
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getAscension(level: number) {
  if (level > 80) return 6;
  if (level > 70) return 5;
  if (level > 60) return 4;
  if (level > 50) return 3;
  if (level > 40) return 2;
  if (level > 20) return 1;
  return 0;
}

const TAB_BASE = "text-xs px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5";
const TAB_ACTIVE = "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold";
const TAB_IDLE = "text-muted-foreground hover:text-foreground";

function Portrait({ urls, name, element }: { urls: (string | undefined)[]; name: string; element: string }) {
  const list = urls.filter(Boolean) as string[];
  const [index, setIndex] = React.useState(0);

  if (index < list.length) {
    return (
      <img
        key={list[index]}
        src={list[index]}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setIndex((i) => i + 1)}
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-muted-foreground">
      {element !== "None" ? <ElementIcon element={element as any} size="md" /> : name.charAt(0)}
    </div>
  );
}


export default function CharactersPage() {
  const [characters, setCharacters] = React.useState<OwnedCharacter[]>(() => {
    const list = getDemoData().characters as OwnedCharacter[];
    const withWeapons: OwnedCharacter[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].characterId === "furina") {
        withWeapons.push({ ...list[i], weaponName: "Fleuve Cendre Ferryman" });
      } else {
        withWeapons.push(list[i]);
      }
    }
    return withWeapons;
  });

  const [selectedElement, setSelectedElement] = React.useState("All");
  const [selectedRarity, setSelectedRarity] = React.useState("All");
  const [selectedWeaponType, setSelectedWeaponType] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Add panel + edit state
  const [showAddPanel, setShowAddPanel] = React.useState(false);
  const [addSearch, setAddSearch] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    weaponName: "",
    level: 1,
    constellation: 0,
    talentNormal: 1,
    talentSkill: 1,
    talentBurst: 1,
  });

  // Modal State
  const [activeModalChar, setActiveModalChar] = React.useState<OwnedCharacter | null>(null);
  const [modalTab, setModalTab] = React.useState<"overview" | "playstyles">("overview");
  const [selectedPlaystyleId, setSelectedPlaystyleId] = React.useState<string | null>(null);

  const characterPlaystyles = React.useMemo(
    () => (activeModalChar ? getPlaystylesForCharacter(activeModalChar.characterId) : []),
    [activeModalChar]
  );
  const activePlaystyle =
    characterPlaystyles.find((p) => p.id === selectedPlaystyleId) ?? characterPlaystyles[0];

  const ownedIds = React.useMemo(() => characters.map((c) => c.characterId), [characters]);

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
      if (e.key === "Escape") {
        setActiveModalChar(null);
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeModalChar]);



  // Hide the sidebar while either modal is open
  const anyModalOpen = !!activeModalChar || showAddPanel;
  React.useEffect(() => {
    if (!anyModalOpen) return;
    document.body.dataset.modalOpen = "true";
    return () => {
      delete document.body.dataset.modalOpen;
    };
  }, [anyModalOpen]);

  // Catalog characters that are not owned yet
  const availableToAdd: GameCharacterType[] = [];
  for (let i = 0; i < CANONICAL_CHARACTERS.length; i++) {
    const entry = CANONICAL_CHARACTERS[i];
    const alreadyOwned = ownedIds.includes(entry.id);
    const matches = entry.name.toLowerCase().includes(addSearch.toLowerCase());
    if (!alreadyOwned && matches) availableToAdd.push(entry);
  }

  function closeModal() {
    setActiveModalChar(null);
    setIsEditing(false);
  }

  function startEditing(char: OwnedCharacter) {
    setDraft({
      weaponName: char.weaponName ?? "",
      level: char.level,
      constellation: char.constellation,
      talentNormal: char.talentNormal,
      talentSkill: char.talentSkill,
      talentBurst: char.talentBurst,
    });
    setIsEditing(true);
  }

  function saveEdits() {
    if (!activeModalChar) return;
    const newLevel = clamp(draft.level, 1, 90);
    const updated: OwnedCharacter = {
      ...activeModalChar,
      weaponName: draft.weaponName.trim(),
      level: newLevel,
      ascension: getAscension(newLevel),
      constellation: clamp(draft.constellation, 0, 6),
      talentNormal: clamp(draft.talentNormal, 1, 10),
      talentSkill: clamp(draft.talentSkill, 1, 10),
      talentBurst: clamp(draft.talentBurst, 1, 10),
    };
    const newList: OwnedCharacter[] = [];
    for (let i = 0; i < characters.length; i++) {
      if (characters[i].characterId === updated.characterId) {
        newList.push(updated);
      } else {
        newList.push(characters[i]);
      }
    }
    setCharacters(newList);
    setActiveModalChar(updated);
    setIsEditing(false);
  }

  const [sharedCatalog, setSharedCatalog] = React.useState<GameCharacterType[]>(CANONICAL_CHARACTERS);
  const [catalogSource, setCatalogSource] = React.useState<"firestore" | "cache" | "builtin">("builtin");

  React.useEffect(() => {
    characterCatalogRepo
      .getCharacters()
      .then((res) => {
        setSharedCatalog(res.characters);
        setCatalogSource(res.source);
      })
      .catch(console.error);
  }, []);

  const ownedIdSet = React.useMemo(
    () => new Set(characters.map((c) => c.characterId)),
    [characters]
  );

  const addableCharacters = React.useMemo(() => {
    const q = addSearch.trim().toLowerCase();
    return sharedCatalog.filter((c) => {
      if (ownedIdSet.has(c.id)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.element.toLowerCase().includes(q) ||
        c.weaponType.toLowerCase().includes(q)
      );
    });
  }, [sharedCatalog, ownedIdSet, addSearch]);

  const ADD_PAGE_SIZE = 12;
  const [addPage, setAddPage] = React.useState(0);

  // back to page 1 whenever the search changes
  React.useEffect(() => {
    setAddPage(0);
  }, [addSearch]);

  const addTotalPages = Math.max(1, Math.ceil(addableCharacters.length / ADD_PAGE_SIZE));
  const safeAddPage = Math.min(addPage, addTotalPages - 1); // handles the list shrinking after an add
  const pagedAddable = addableCharacters.slice(
    safeAddPage * ADD_PAGE_SIZE,
    (safeAddPage + 1) * ADD_PAGE_SIZE
  );

  async function addCharacter(base: GameCharacterType) {
    try {
      await playerCharacterRepo.addCharacter(base.id);
    } catch {
      // ignore if already in Dexie
    }
    const newChar = {
      characterId: base.id,
      name: base.name,
      title: base.title,
      element: base.element,
      weaponType: base.weaponType,
      rarity: base.rarity,
      level: 1,
      ascension: 0,
      constellation: 0,
      friendshipLevel: 1,
      talentNormal: 1,
      talentSkill: 1,
      talentBurst: 1,
      weaponName: "",
      isTarget: false,
      acquiredAt: new Date().toISOString(),
    } as unknown as OwnedCharacter;

    setCharacters([...characters, newChar]);
    setShowAddPanel(false);
    setAddSearch("");
    setActiveModalChar(newChar);
    setModalTab("overview");
    setSelectedPlaystyleId(null);
    startEditing(newChar);
  }

  const filteredCharacters = characters.filter((char) => {
    const matchesElement = selectedElement === "All" || char.element === selectedElement;
    const matchesRarity =
      selectedRarity === "All" ||
      (selectedRarity === "5-Star" && char.rarity === 5) ||
      (selectedRarity === "4-Star" && char.rarity === 4);
    const matchesWeaponType =
      selectedWeaponType === "All" || char.weaponType === selectedWeaponType;
    const matchesSearch =
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (char.title?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    return matchesElement && matchesRarity && matchesWeaponType && matchesSearch;
  });

  const talents = activeModalChar
    ? [
      { label: "Normal Attack", value: activeModalChar.talentNormal },
      { label: "Elemental Skill", value: activeModalChar.talentSkill },
      { label: "Elemental Burst", value: activeModalChar.talentBurst },
    ]
    : [];

  const equipped = activeModalChar ? toBuildInput(activeModalChar) : null;

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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            Character Roster & Playstyles
            <span className="text-base font-normal text-muted-foreground font-serif italic">
              ({characters.length} Registered)
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage owned characters, explore multi-role playstyles, and evaluate build synergy.
          </p>
        </div>
        <Button onClick={() => setShowAddPanel(true)} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Add Character
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border/70 shadow-sm min-w-0">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
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

          {/* Weapon Type Toggles */}
          <div className="flex flex-wrap items-center rounded-lg border border-border/80 p-0.5 bg-muted/30">
            {WEAPON_TYPES.map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWeaponType(w)}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-md transition-colors ${selectedWeaponType === w
                  ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {w}
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
              setSelectedWeaponType("All");
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
            className="w-full max-w-7xl max-h-[88vh] sm:h-[75vh] flex flex-col rounded-xl sm:rounded-2xl border border-gold-500/40 bg-card shadow-2xl overflow-hidden"
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
      {/* Add Character Modal (from Shared Firestore Catalog) */}
      {showAddPanel && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowAddPanel(false)}
        >
          <div
            style={{ width: "min(1200px, 100vw)", height: "min(75vh, 100vh)" }}

            className="cg-wide-modal flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  Add Character from Shared Catalog
                  <Badge variant="outline" className="text-[10px]">
                    {catalogSource === "firestore" ? "Firestore Live" : catalogSource === "cache" ? "Cached" : "Built-in"}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {addableCharacters.length} unowned characters available
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowAddPanel(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="Search by name, element, or weapon type..."
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 auto-rows-fr gap-3">
              {pagedAddable.map((char) => {
                const portraitUrl = (char as { portraitUrl?: string }).portraitUrl;
                const iconName = portraitUrl?.split("/").pop(); // "UI_AvatarIcon_Aino.png"
                const enkaUrl = iconName ? `https://enka.network/ui/${iconName}` : undefined;
                const hasElement = (char.element as string) !== "None";
                console.log(char);
                return (
                  <div
                    key={char.id}
                    className="flex h-full min-h-[14rem] flex-col overflow-hidden rounded-xl border border-border/70 bg-background/60 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="relative flex-1 min-h-0 bg-muted">

                      <Portrait urls={[enkaUrl, portraitUrl]} name={char.name} element={char.element} />
                    </div>

                    <div className="space-y-2 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{char.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          {hasElement && (
                            <>
                              <ElementIcon element={char.element} size="xs" />
                              <span>{char.element}</span>
                              <span>·</span>
                            </>
                          )}
                          <span>{char.weaponType}</span>
                          <span>·</span>
                          <span>{char.rarity}★</span>
                        </p>
                      </div>
                      <Button size="sm" onClick={() => addCharacter(char)} className="w-full gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}
              {addableCharacters.length === 0 && (
                <p className="col-span-full text-center text-xs text-muted-foreground py-8">
                  No matching unowned characters found.
                </p>
              )}
            </div>
            {addTotalPages > 1 && (
              <div className="flex items-center justify-between gap-3 p-3 border-t border-border text-xs text-muted-foreground">
                <span>
                  {safeAddPage * ADD_PAGE_SIZE + 1}–
                  {Math.min((safeAddPage + 1) * ADD_PAGE_SIZE, addableCharacters.length)} of {addableCharacters.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safeAddPage === 0}
                    onClick={() => setAddPage(safeAddPage - 1)}
                  >
                    Prev
                  </Button>
                  <span>
                    Page {safeAddPage + 1} / {addTotalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safeAddPage >= addTotalPages - 1}
                    onClick={() => setAddPage(safeAddPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}