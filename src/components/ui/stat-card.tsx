import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: string;
  highlight?: "gold" | "pyro" | "hydro" | "anemo" | "electro" | "dendro" | "cryo" | "geo" | "default";
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  highlight = "default",
  className,
}: StatCardProps) {
  const highlightStyles = {
    gold: "border-gold-500/35 bg-gradient-to-br from-gold-500/10 via-card to-card hover:border-gold-500/60 shadow-gold-sm",
    pyro: "border-red-500/30 bg-gradient-to-br from-red-500/10 via-card to-card",
    hydro: "border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card to-card",
    anemo: "border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-card to-card",
    electro: "border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-card to-card",
    dendro: "border-lime-500/30 bg-gradient-to-br from-lime-500/10 via-card to-card",
    cryo: "border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-card to-card",
    geo: "border-amber-600/30 bg-gradient-to-br from-amber-600/10 via-card to-card",
    default: "border-border/80 hover:border-gold-500/30",
  }[highlight];

  return (
    <Card className={cn("overflow-hidden transition-all duration-200", highlightStyles, className)}>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
            {subValue && (
              <span className="text-xs text-muted-foreground font-medium">({subValue})</span>
            )}
          </div>
          {trend && (
            <p className="text-xs text-gold-600 dark:text-gold-400 font-medium flex items-center gap-1 mt-1">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
