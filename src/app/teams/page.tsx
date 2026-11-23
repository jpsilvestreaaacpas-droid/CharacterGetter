import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles } from "lucide-react";

export default function TeamsPage() {
  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Team Compositions
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
              Milestone 3 Preview
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synergy matrix, elemental resonance calculations, and rotation guides.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sample Team 1 */}
        <Card className="p-4 border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">Raiden National</h4>
            <Badge variant="pyro">Overloaded & Vaporize</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-muted/40 border border-border/60">Raiden</div>
            <div className="p-2 rounded bg-muted/40 border border-border/60">Xiangling</div>
            <div className="p-2 rounded bg-muted/40 border border-border/60">Xingqiu</div>
            <div className="p-2 rounded bg-muted/40 border border-border/60">Bennett</div>
          </div>
        </Card>

        {/* Sample Team 2 */}
        <Card className="p-4 border-border/70 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">Furina Hyperbloom</h4>
            <Badge variant="dendro">Hyperbloom</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-muted/40 border border-border/60">Nahida</div>
            <div className="p-2 rounded bg-muted/40 border border-border/60">Furina</div>
            <div className="p-2 rounded bg-muted/40 border border-border/60">Kuki Shinobu</div>
            <div className="p-2 rounded bg-muted/40 border border-border/60">Kazuha</div>
          </div>
        </Card>
      </div>

      <EmptyState
        title="Team Builder in Development"
        description="The team synergy analyzer, elemental resonance calculator, and energy recharge threshold simulator are slated for Milestone 3."
        icon={Shield}
      />
    </AppShell>
  );
}
