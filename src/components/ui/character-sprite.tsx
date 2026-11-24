"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type CharacterSpriteId = "furina" | "raiden" | "raidenshogun" | "venti" | "zhongli";

export interface CharacterSpriteProps {
  characterId: CharacterSpriteId | string;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  className?: string;
  alt?: string;
  animated?: boolean;
}

const SPRITE_PATHS: Record<string, string> = {
  furina: "/images/sprites/furina.png",
  raiden: "/images/sprites/raiden.png",
  raidenshogun: "/images/sprites/raiden.png",
  venti: "/images/sprites/venti.png",
  zhongli: "/images/sprites/zhongli.png",
};

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
  custom: "",
};

export function CharacterSprite({
  characterId,
  size = "md",
  className,
  alt,
  animated = false,
}: CharacterSpriteProps) {
  const spriteSrc = SPRITE_PATHS[characterId.toLowerCase()];

  if (!spriteSrc) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 select-none",
        SIZE_CLASSES[size],
        animated && "animate-genshin-float",
        className
      )}
    >
      <img
        src={spriteSrc}
        alt={alt || `${characterId} sprite`}
        className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform duration-200"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}
