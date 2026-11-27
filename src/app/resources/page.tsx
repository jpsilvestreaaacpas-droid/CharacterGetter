"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Coins, Package, Gem, Sparkles, BookOpen, Crown,
  TrendingUp, Minus, Plus, RefreshCw, AlertCircle,
} from "lucide-react";
import { RESOURCE_CATALOGUE, ResourceDefinition } from "@/lib/data/resources";
import { usePlayerResources } from "@/lib/hooks/use-local-player";
import { Pagination } from "@/components/ui/pagination";

// Demo resource quantities (M2 uses live DB in future; here we show interactive client state)
type ResourceEntry = ResourceDefinition & { quantity: number; target: number };

const CATEGORY_LABELS: Record<string, string> = {
  currency: "Currency",
  exp: "EXP Books",
  ascension_gem: "Ascension Gems",
  talent_book: "Talent Books",
  talent_boss: "Boss Materials & Crowns",
  boss_material: "Boss Materials",
  common_material: "Common Materials",
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Coins, Package, Gem, Sparkles, BookOpen, Crown,
};

const DEMO_QUANTITIES: Record<string, { quantity: number; target: number }> = {
  mora: { quantity: 5842100, target: 10000000 },
  primogems: { quantity: 14880, target: 0 },
  "intertwined-fate": { quantity: 12, target: 0 },
  "heros-wit": { quantity: 428, target: 600 },
  "adventurers-experience": { quantity: 44, target: 0 },
  "wanderers-advice": { quantity: 12, target: 0 },
  "agnidus-agate-chunk": { quantity: 6, target: 12 },
  "varunada-lazurite-chunk": { quantity: 3, target: 6 },
  "vajrada-amethyst-chunk": { quantity: 8, target: 6 },
  "nagadus-emerald-chunk": { quantity: 2, target: 9 },
  "shivada-jade-chunk": { quantity: 4, target: 9 },
  "teachings-of-freedom": { quantity: 0, target: 9 },
  "guide-to-freedom": { quantity: 15, target: 20 },
  "philosophies-of-freedom": { quantity: 8, target: 16 },
  "teachings-of-ballad": { quantity: 3, target: 9 },
  "guide-to-ballad": { quantity: 9, target: 20 },
  "philosophies-of-ballad": { quantity: 4, target: 16 },
  "crown-of-insight": { quantity: 6, target: 10 },
  "shadow-of-the-warrior": { quantity: 2, target: 4 },
};

const PAGE_SIZE = 9;
// Categories that get paginated ("all" is the All tab)
const PAGINATED = new Set(["all", "talent_book", "talent_boss", "boss_material"]);

export default function ResourcesPage() {
  const { resources: storedResources, upsertResource } = usePlayerResources();

  const resources: ResourceEntry[] = React.useMemo(() => {
    const byId = new Map(storedResources.map((r) => [r.itemId, r]));
    return RESOURCE_CATALOGUE.map((r) => {
      const saved = byId.get(r.id);
      return {
        ...r,
        quantity: saved?.quantity ?? 0,
        target: saved?.targetQuantity ?? 0,
      };
    });
  }, [storedResources]);

  const [filter, setFilter] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    setPage(0);
  }, [filter, activeCategory]);

  const categories = ["all", ...Array.from(new Set(RESOURCE_CATALOGUE.map((r) => r.category)))];

  const filtered = resources.filter((r) => {
    const matchCat = activeCategory === "all" || r.category === activeCategory;
    const matchSearch = r.name.toLowerCase().includes(filter.toLowerCase());
    return matchCat && matchSearch;
  });

  const paginate = PAGINATED.has(activeCategory);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = paginate
    ? filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
    : filtered;

  function adjust(id: string, delta: number) {
    const item = resources.find((r) => r.id === id);
    if (!item) return;
    const nextQty = Math.max(0, item.quantity + delta);
    upsertResource({
      itemId: item.id,
      name: item.name,
      category: item.category,
      quantity: nextQty,
      targetQuantity: item.target,
    }).catch(console.error);
  }

  function setQuantity(id: string, val: number) {
    const item = resources.find((r) => r.id === id);
    if (!item || !Number.isFinite(val)) return;
    const nextQty = Math.max(0, Math.floor(val));
    upsertResource({
      itemId: item.id,
      name: item.name,
      category: item.category,
      quantity: nextQty,
      targetQuantity: item.target,
    }).catch(console.error);
  }

  const totalMora = resources.find((r) => r.id === "mora")?.quantity ?? 0;
  const totalWits = resources.find((r) => r.id === "heros-wit")?.quantity ?? 0;
  const totalCrowns = resources.find((r) => r.id === "crown-of-insight")?.quantity ?? 0;
  const totalFates = resources.find((r) => r.id === "intertwined-fate")?.quantity ?? 0;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Resource Inventory
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
              Milestone 2
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track Mora, EXP books, ascension gems, and talent materials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Demo Data — quantities shown are illustrative
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Mora", value: totalMora.toLocaleString(), icon: Coins, color: "amber" },
          { label: "Hero's Wit", value: `${totalWits} Books`, icon: BookOpen, color: "orange" },
          { label: "Crowns", value: `${totalCrowns} Crowns`, icon: Crown, color: "yellow" },
          { label: "Intertwined Fates", value: `${totalFates} Fates`, icon: Sparkles, color: "purple" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 border-border/70 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-${s.color}-500/10 text-${s.color}-500`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">{s.label}</p>
                <p className="text-sm font-bold font-mono">{s.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search resources…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${activeCategory === cat
                ? "bg-gold-500/20 text-gold-600 dark:text-gold-400 border-gold-500/40"
                : "bg-muted/40 text-muted-foreground border-border/60 hover:border-border"
                }`}
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((r) => {
          const Icon = ICON_MAP[r.icon] ?? Package;
          const hasTarget = r.target > 0;
          const pct = hasTarget ? Math.min(100, Math.round((r.quantity / r.target) * 100)) : null;
          const isMet = hasTarget && r.quantity >= r.target;

          return (
            <Card key={r.id} className="p-4 border-border/70 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-${r.color}-500/10 text-${r.color}-500`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[r.category] ?? r.category}</p>
                  </div>
                </div>
                {hasTarget && (
                  <Badge variant={isMet ? "default" : "secondary"} className="text-xs">
                    {isMet ? "✓ Met" : `${pct}%`}
                  </Badge>
                )}
              </div>

              {/* Progress bar */}
              {hasTarget && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-muted/60">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isMet ? "bg-green-500" : "bg-gold-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    Target: {r.target.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Quantity adjuster */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => adjust(r.id, -1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  min={0}
                  value={r.quantity}
                  onChange={(e) => setQuantity(r.id, parseInt(e.target.value) || 0)}
                  className="h-7 text-center font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => adjust(r.id, 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {paginate && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
          <span>
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
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
      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No resources match your search.
        </div>
      )}
    </AppShell>
  );
}
