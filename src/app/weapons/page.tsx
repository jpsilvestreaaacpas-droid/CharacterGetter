import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { weaponCatalogRepo, SharedWeaponSummary } from "@/lib/repositories/WeaponCatalogRepository";
import { usePlayerWeapons } from "@/lib/hooks/use-local-player";
import { playerWeaponRepo } from "@/lib/repositories/PlayerWeaponRepository";
import { WeaponCompatibilityService } from "@/lib/services/WeaponCompatibilityService";
import { getDemoData } from "@/lib/data/demo-provider";
import { Sword, Search, Plus, Trash2, Star, X, Shield } from "lucide-react";

const WEAPON_TYPES = ["All", "Sword", "Claymore", "Polearm", "Bow", "Catalyst"] as const;
const RARITIES = ["All", "5", "4", "3"] as const;
const PAGE_SIZE = 12;


export default function WeaponsPage() {
  const { weapons: ownedWeapons } = usePlayerWeapons();
  const { characters } = getDemoData();

  const [catalog, setCatalog] = React.useState<SharedWeaponSummary[]>([]);
  const [catalogSource, setCatalogSource] = React.useState<"firestore" | "cache" | "builtin">("builtin");
  const [loading, setLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("All");
  const [rarityFilter, setRarityFilter] = React.useState<string>("All");
  const [ownershipFilter, setOwnershipFilter] = React.useState<"All" | "Owned" | "Unowned">("All");
  const [sortBy, setSortBy] = React.useState<"rarity" | "name" | "atk">("rarity");

  const [selectedWeapon, setSelectedWeapon] = React.useState<SharedWeaponSummary | null>(null);

  const [page, setPage] = React.useState(0);
  React.useEffect(() => {
    setPage(0);
  }, [search, typeFilter, rarityFilter, ownershipFilter, sortBy]);

  React.useEffect(() => {
    setLoading(true);
    weaponCatalogRepo
      .getWeapons()
      .then((res) => {
        setCatalog(res.weapons);
        setCatalogSource(res.source);
      })
      .finally(() => setLoading(false));
  }, []);

  const ownedByWeaponId = React.useMemo(() => {
    const map = new Map<string, typeof ownedWeapons>();
    for (const w of ownedWeapons) {
      const list = map.get(w.weaponId) ?? [];
      list.push(w);
      map.set(w.weaponId, list);
    }
    return map;
  }, [ownedWeapons]);

  const filteredCatalog = React.useMemo(() => {
    
    const q = search.trim().toLowerCase();
    return catalog
      .filter((w) => {
        if (typeFilter !== "All" && w.weaponType !== typeFilter) return false;
        if (rarityFilter !== "All" && String(w.rarity) !== rarityFilter) return false;
        const ownedCount = ownedByWeaponId.get(w.id)?.length ?? 0;
        if (ownershipFilter === "Owned" && ownedCount === 0) return false;
        if (ownershipFilter === "Unowned" && ownedCount > 0) return false;
        if (q && !w.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rarity") return b.rarity - a.rarity || a.name.localeCompare(b.name);
        if (sortBy === "atk") return (b.baseAtk ?? 0) - (a.baseAtk ?? 0);
        return a.name.localeCompare(b.name);
      });
  }, [catalog, typeFilter, rarityFilter, ownershipFilter, search, sortBy, ownedByWeaponId]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedCatalog = filteredCatalog.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const selectedOwnedCopies = selectedWeapon ? ownedByWeaponId.get(selectedWeapon.id) ?? [] : [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <Sword className="w-7 h-7 text-amber-400" />
              Weapons
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {catalog.length} catalog weapons · {ownedWeapons.length} owned instances in local Dexie inventory
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto text-xs px-3 py-1">
            {catalogSource === "firestore"
              ? "Firestore Live"
              : catalogSource === "cache"
                ? "Offline Cache"
                : "Built-in Fallback"}
          </Badge>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search weapons by name..."
                className="pl-9"
              />
            </div>
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value as "All" | "Owned" | "Unowned")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="All">All Ownership</option>
              <option value="Owned">Owned Only</option>
              <option value="Unowned">Unowned Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rarity" | "name" | "atk")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="rarity">Sort: Rarity</option>
              <option value="name">Sort: Name</option>
              <option value="atk">Sort: Base ATK</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {WEAPON_TYPES.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={typeFilter === t ? "default" : "outline"}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RARITIES.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={rarityFilter === r ? "default" : "outline"}
                  onClick={() => setRarityFilter(r)}
                >
                  {r === "All" ? "All ★" : `${r}★`}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Weapon Collection Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading shared weapon catalog...
          </div>
        ) : filteredCatalog.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No weapons match your current filters.
            </CardContent>
          </Card>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {pagedCatalog.map((w) => {
              const copies = ownedByWeaponId.get(w.id) ?? [];
              const equippedCopy = copies.find((c) => c.equippedTo);
              return (
                <Card
                  key={w.id}
                  onClick={() => setSelectedWeapon(w)}
                  className="cursor-pointer hover:border-amber-500/50 transition-colors flex flex-col justify-between"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {w.iconUrl ? (
                        <img
                          src={w.iconUrl}
                          alt={w.name}
                          className="w-16 h-16 rounded-xl object-contain bg-muted/60 p-1 shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Sword className="w-7 h-7 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-2">
                          {w.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <span className="text-amber-400 font-medium flex items-center gap-0.5">
                            {w.rarity}
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </span>
                          <span>·</span>
                          <span>{w.weaponType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border/50">
                      <div className="flex justify-between">
                        <span>Base ATK</span>
                        <span className="font-mono text-foreground">{w.baseAtk ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{w.secondaryStatType || "Secondary"}</span>
                        <span className="font-mono text-foreground">{w.secondaryStatValue || "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {copies.length > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          Owned ({copies.length}){equippedCopy ? ` · Equipped` : ""}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unowned</span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          playerWeaponRepo.addWeapon({ weaponId: w.id, level: 1, ascension: 0, refinement: 1 });
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
              <span>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filteredCatalog.length)} of {filteredCatalog.length}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                  Prev
                </Button>
                <span>
                  Page {safePage + 1} / {totalPages}
                </span>
                <Button size="sm" variant="outline" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Weapon Detail & Owned Copies Modal */}
      {selectedWeapon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedWeapon(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {selectedWeapon.iconUrl ? (
                  <img
                    src={selectedWeapon.iconUrl}
                    alt={selectedWeapon.name}
                    className="w-20 h-20 rounded-xl object-contain bg-muted/60 p-1.5"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                    <Sword className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedWeapon.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedWeapon.rarity}★ {selectedWeapon.weaponType} · {selectedWeapon.secondaryStatType || "No secondary stat"}
                  </p>
                  {selectedWeapon.gameVersion && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Version {selectedWeapon.gameVersion} · {selectedWeapon.source}
                    </p>
                  )}
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelectedWeapon(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  Your Owned Copies ({selectedOwnedCopies.length})
                </h3>
                <Button
                  size="sm"
                  onClick={() =>
                    playerWeaponRepo.addWeapon({
                      weaponId: selectedWeapon.id,
                      level: 1,
                      ascension: 0,
                      refinement: 1,
                    })
                  }
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Copy to Inventory
                </Button>
              </div>

              {selectedOwnedCopies.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  You do not own any copies of {selectedWeapon.name} yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedOwnedCopies.map((copy, idx) => {
                    const compatibleChars = characters.filter((c) =>
                      WeaponCompatibilityService.isCompatible(c.weaponType, String(selectedWeapon.weaponType))
                    );
                    return (
                      <Card key={copy.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Copy #{idx + 1}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => playerWeaponRepo.deleteWeapon(copy.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Level (1–90)</label>
                            <Input
                              type="number"
                              min={1}
                              max={90}
                              value={copy.level}
                              onChange={(e) =>
                                playerWeaponRepo.updateWeapon(copy.id, {
                                  level: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Refinement (1–5)</label>
                            <Input
                              type="number"
                              min={1}
                              max={5}
                              value={copy.refinement}
                              onChange={(e) =>
                                playerWeaponRepo.updateWeapon(copy.id, {
                                  refinement: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Equipped By
                            </label>
                            <select
                              value={copy.equippedTo ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) playerWeaponRepo.unequipWeapon(copy.id);
                                else playerWeaponRepo.equipWeapon(copy.id, val);
                              }}
                              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                            >
                              <option value="">Unequipped</option>
                              {compatibleChars.map((c) => (
                                <option key={c.id ?? c.name} value={c.id ?? c.name.toLowerCase()}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
