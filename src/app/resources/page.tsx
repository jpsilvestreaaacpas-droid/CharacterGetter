import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Coins, Gem, Sparkles } from "lucide-react";

export default function ResourcesPage() {
  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Resource Inventory
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
              Milestone 2 Preview
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track Mora, EXP books, character ascension gems, and talent materials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/70 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Mora</p>
            <p className="text-lg font-bold font-mono">5,842,100</p>
          </div>
        </Card>

        <Card className="p-4 border-border/70 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Hero&#39;s Wit</p>
            <p className="text-lg font-bold font-mono">428 Books</p>
          </div>
        </Card>

        <Card className="p-4 border-border/70 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Mystic Ore</p>
            <p className="text-lg font-bold font-mono">1,820</p>
          </div>
        </Card>

        <Card className="p-4 border-border/70 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gold-500/10 text-gold-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Crown of Insight</p>
            <p className="text-lg font-bold font-mono">6 Crowns</p>
          </div>
        </Card>
      </div>

      <EmptyState
        title="Resource Tracker Module in Development"
        description="Milestone 1 establishes the design system and dashboard. Full inventory sync, automatic farming route planner, and resin calculation are scheduled for Milestone 2."
        icon={Package}
      />
    </AppShell>
  );
}
