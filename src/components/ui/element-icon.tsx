/**
 * Genshin Impact Elemental Icon component.
 * Uses official elemental icons from /images/elements/ (sourced via Fandom wiki).
 * © miHoYo / HoYoverse. Used for non-commercial fan purposes.
 */
import { cn } from "@/lib/utils";

export type GenshinElement =
  | "Anemo"
  | "Geo"
  | "Electro"
  | "Dendro"
  | "Hydro"
  | "Pyro"
  | "Cryo"
  | "anemo"
  | "geo"
  | "electro"
  | "dendro"
  | "hydro"
  | "pyro"
  | "cryo";

const ELEMENT_CONFIG: Record<
  string,
  { icon: string; color: string; bg: string; label: string }
> = {
  anemo:   { icon: "/images/elements/anemo.png",   color: "text-teal-300",    bg: "bg-teal-500/20",    label: "Anemo" },
  geo:     { icon: "/images/elements/geo.png",     color: "text-yellow-400",  bg: "bg-yellow-500/20",  label: "Geo" },
  electro: { icon: "/images/elements/electro.png", color: "text-purple-400",  bg: "bg-purple-500/20",  label: "Electro" },
  dendro:  { icon: "/images/elements/dendro.png",  color: "text-green-400",   bg: "bg-green-500/20",   label: "Dendro" },
  hydro:   { icon: "/images/elements/hydro.png",   color: "text-blue-400",    bg: "bg-blue-500/20",    label: "Hydro" },
  pyro:    { icon: "/images/elements/pyro.png",    color: "text-red-400",     bg: "bg-red-500/20",     label: "Pyro" },
  cryo:    { icon: "/images/elements/cryo.png",    color: "text-cyan-300",    bg: "bg-cyan-500/20",    label: "Cryo" },
};

export type ElementIconSize = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<ElementIconSize, { px: number; cls: string }> = {
  xs: { px: 14, cls: "w-3.5 h-3.5" },
  sm: { px: 18, cls: "w-4.5 h-4.5" },
  md: { px: 24, cls: "w-6 h-6" },
  lg: { px: 32, cls: "w-8 h-8" },
};

interface ElementIconProps {
  element: GenshinElement | string;
  size?: ElementIconSize;
  showLabel?: boolean;
  showBg?: boolean;
  className?: string;
}

export function ElementIcon({
  element,
  size = "sm",
  showLabel = false,
  showBg = false,
  className,
}: ElementIconProps) {
  const key = element.toLowerCase();
  const config = ELEMENT_CONFIG[key];
  const { px, cls } = SIZE_MAP[size];

  if (!config) {
    // Unknown element: render text fallback
    return (
      <span
        className={cn("text-xs font-medium text-muted-foreground", className)}
        title={element}
      >
        {element}
      </span>
    );
  }

  const content = (
    <img
      src={config.icon}
      alt={`${config.label} element`}
      title={config.label}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      className={cn("object-contain shrink-0", cls)}
    />
  );

  if (showBg) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full p-1",
          config.bg,
          className
        )}
        title={config.label}
      >
        {content}
      </span>
    );
  }

  if (showLabel) {
    return (
      <span
        className={cn("inline-flex items-center gap-1.5", config.color, className)}
        title={config.label}
      >
        {content}
        <span className="text-xs font-medium">{config.label}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex", className)} title={config.label}>
      {content}
    </span>
  );
}

export function getElementColor(element: string): string {
  return ELEMENT_CONFIG[element.toLowerCase()]?.color ?? "text-muted-foreground";
}

export function getElementBg(element: string): string {
  return ELEMENT_CONFIG[element.toLowerCase()]?.bg ?? "bg-muted/20";
}
