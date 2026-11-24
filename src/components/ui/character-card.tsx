import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ElementIcon } from "@/components/ui/element-icon";
import { Star, Shield, Zap } from "lucide-react";

export type ElementType = "Pyro" | "Hydro" | "Anemo" | "Electro" | "Dendro" | "Cryo" | "Geo";
export type WeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";

export interface CharacterCardProps {
  id: string;
  name: string;
  title?: string;
  element: ElementType;
  weaponType: WeaponType;
  rarity: 4 | 5;
  level?: number;
  constellation?: number;
  avatarUrl?: string;
  isTarget?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CharacterCard({
  id,
  name,
  title,
  element,
  weaponType,
  rarity,
  level = 1,
  constellation = 0,
  isTarget = false,
  onClick,
  className,
}: CharacterCardProps) {
  const elementBadgeVariant = element.toLowerCase() as
    | "pyro"
    | "hydro"
    | "anemo"
    | "electro"
    | "dendro"
    | "cryo"
    | "geo";

  const isFiveStar = rarity === 5;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1",
        isFiveStar
          ? "border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-card to-card hover:border-amber-500/60 hover:shadow-gold-sm"
          : "border-purple-500/30 bg-gradient-to-b from-purple-500/5 via-card to-card hover:border-purple-500/60",
        isTarget && "ring-2 ring-gold-500 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {/* Top Banner Indicator */}
      <div
        className={cn(
          "h-1.5 w-full",
          isFiveStar
            ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600"
            : "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-600"
        )}
      />

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-bold text-base tracking-tight text-foreground group-hover:text-gold-500 transition-colors">
              {name}
            </h4>
            {title && (
              <p className="text-xs text-muted-foreground italic line-clamp-1">{title}</p>
            )}
          </div>
          <Badge variant={elementBadgeVariant} className="text-[11px] capitalize flex items-center gap-1 pl-1.5 pr-2 py-0.5">
            <ElementIcon element={element} size="xs" />
            <span>{element}</span>
          </Badge>
        </div>

        {/* Visual Element & Rarity Badge */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: rarity }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3.5 h-3.5 fill-current",
                  isFiveStar ? "text-amber-500" : "text-purple-400"
                )}
              />
            ))}
          </div>
          <span className="font-mono text-xs">{weaponType}</span>
        </div>

        {/* Progression Footer */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            Lv. <span className="font-mono">{level}</span>
            <span className="text-muted-foreground">/90</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-muted font-mono font-medium text-[11px]">
            C{constellation}
          </span>
        </div>
      </div>
    </Card>
  );
}
