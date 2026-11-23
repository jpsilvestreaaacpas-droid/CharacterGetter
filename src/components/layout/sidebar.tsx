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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
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
          variant="outline-gold"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-card/90 backdrop-blur shadow-md"
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

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-card border-r border-gold-500/20 transition-transform duration-300 lg:translate-x-0 shadow-lg lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-border/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 flex items-center justify-center text-stone-900 shadow-gold-sm font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              Character Getter
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                M2
              </span>
            </h1>
            <p className="text-xs text-muted-foreground font-serif italic">Teyvat Companion</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gold-500/15 text-gold-600 dark:text-gold-400 font-semibold border border-gold-500/30 shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-gold-600 dark:text-gold-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-border/70 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px]">Milestone 2</span>
            <span className="text-gold-600 dark:text-gold-400 font-medium">Resources & Teams</span>
          </div>
          <p className="text-[10px] text-muted-foreground/80">Independent Genshin Companion</p>
        </div>
      </aside>
    </>
  );
}
