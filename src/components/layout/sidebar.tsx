"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Radar,
  Package,
  TrendingUp,
  Shield,
  Settings,
  Compass,
  Menu,
  X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HuTaoChibi } from "@/components/ui/genshin-chibi";
import { CharacterSprite } from "@/components/ui/character-sprite";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
    hasChibi: "hutao",
  },
  {
    title: "Characters",
    href: "/characters",
    icon: Users,
    badge: null,
  },
  {
    title: "Pull Planner",
    href: "/pull-planner",
    icon: Sparkles,
    badge: "Pity",
  },
  {
    title: "Banner Radar",
    href: "/banner-radar",
    icon: Radar,
    badge: "New",
  },
  {
    title: "Resources",
    href: "/resources",
    icon: Package,
    badge: null,
  },
  {
    title: "Progression",
    href: "/progression",
    icon: TrendingUp,
    badge: null,
    hasSprite: "furina",
  },
  {
    title: "Teams",
    href: "/teams",
    icon: Shield,
    badge: null,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-[#0b1426]/90 border-amber-500/30 text-amber-300 backdrop-blur shadow-md"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container matching screenshot */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-[#0a1222]/92 backdrop-blur-2xl border-r border-amber-500/20 transition-transform duration-300 lg:translate-x-0 shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-amber-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-gold-500 to-yellow-600 flex items-center justify-center text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                Character Getter
                <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
              </h1>
              <p className="text-[11px] text-muted-foreground font-serif italic">Teyvat Companion</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto relative">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all relative z-10",
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 via-gold-500/15 to-transparent text-amber-300 font-bold border border-amber-500/40 shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-amber-400" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Chibi mascot on Dashboard */}
                {item.hasChibi === "hutao" && (
                  <div className="absolute -top-3.5 -right-1 z-20 pointer-events-none animate-genshin-float">
                    <HuTaoChibi className="w-11 h-11 drop-shadow-md" />
                  </div>
                )}

                {/* Character sprite on Progression / Resources */}
                {item.hasSprite === "furina" && (
                  <div className="absolute -top-3.5 -right-0.5 z-20 pointer-events-none animate-genshin-float">
                    <CharacterSprite characterId="furina" size="sm" className="w-10 h-10" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info with Zhongli sprite */}
        <div className="p-4 border-t border-amber-500/15 bg-black/25 text-xs text-muted-foreground relative">
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  Milestone 2
                </span>
                <span className="text-amber-400 font-semibold text-[11px]">Resources & Teams</span>
              </div>
              <p className="text-[10px] text-muted-foreground/70">Independent Teyvat Companion</p>
            </div>

            {/* Character Sprite: Zhongli */}
            <div className="pointer-events-none transform -translate-y-1">
              <CharacterSprite characterId="zhongli" size="sm" className="w-11 h-11" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
