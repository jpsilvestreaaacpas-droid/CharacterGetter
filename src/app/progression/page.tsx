import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight, Award, Compass } from "lucide-react";

export default function ProgressionPage() {
  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Character Progression
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
              Milestone 2 Preview
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ascension targets, talent priority roadmaps, and farming day schedules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border/70 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gold-500/10 text-gold-500">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Ascension 6 Target</p>
            <p className="text-base font-bold text-foreground">5 Characters Pending</p>
          </div>
        </Card>

        <Card className="p-4 border-border/70 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Crowns Used</p>
            <p className="text-base font-bold text-foreground">8 Talents Maxed</p>
          </div>
        </Card>

        <Card className="p-4 border-border/70 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-500">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Domain Schedule</p>
            <p className="text-base font-bold text-foreground">Ballad / Light Today</p>
          </div>
        </Card>
      </div>

      <EmptyState
        title="Progression Roadmaps Scheduled for Milestone 2"
        description="The foundation and dashboard provide the overview of your character roster. Detailed per-character talent calculators, ascension material cost breakdowns, and domain rotation schedules will be delivered in Milestone 2."
        icon={TrendingUp}
      />
    </AppShell>
  );
}
