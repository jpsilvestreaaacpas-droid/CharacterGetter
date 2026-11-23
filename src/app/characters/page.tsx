"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CharacterCard } from "@/components/ui/character-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { getDemoData } from "@/lib/data/demo-provider";
import { Search, Filter, Sparkles, Star } from "lucide-react";

const ELEMENTS = ["All", "Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];
const RARITIES = ["All", "5-Star", "4-Star"];

export default function CharactersPage() {
  const { characters } = getDemoData();
  const [selectedElement, setSelectedElement] = React.useState("All");
  const [selectedRarity, setSelectedRarity] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeModalChar, setActiveModalChar] = React.useState<(typeof characters)[0] | null>(null);

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
            Character Roster
            <span className="text-sm font-normal text-muted-foreground font-serif italic">
              ({characters.length} Registered)
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage owned characters, constellations, talent levels, and ascension milestones.
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
            onClick={() => setActiveModalChar(char)}
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

      {/* Character Details Modal */}
      {activeModalChar && (
        <Dialog
          open={!!activeModalChar}
          onOpenChange={(open) => {
            if (!open) setActiveModalChar(null);
          }}
          title={activeModalChar.name}
          description={activeModalChar.title}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={activeModalChar.element.toLowerCase() as any}>
                {activeModalChar.element}
              </Badge>
              <Badge variant={activeModalChar.rarity === 5 ? "rarity-5" : "rarity-4"}>
                {activeModalChar.rarity}-Star {activeModalChar.weaponType}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {activeModalChar.region}
              </span>
            </div>

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
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Normal Attack: {activeModalChar.talentNormal}</span>
                <span>Elemental Skill: {activeModalChar.talentSkill}</span>
                <span>Elemental Burst: {activeModalChar.talentBurst}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic text-center">
              Demonstration data synchronized from the local character repository.
            </p>
          </div>
        </Dialog>
      )}
    </AppShell>
  );
}
