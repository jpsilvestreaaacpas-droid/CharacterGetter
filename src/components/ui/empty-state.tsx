import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-gold-500/30 bg-card/50",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 mb-4 shadow-gold-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-lg text-foreground tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      {actionLabel && (
        <Button variant="outline-gold" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
