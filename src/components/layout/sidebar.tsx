"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  CalendarHeart,
  Package,
  TrendingUp,
  UserRoundCog,
  Settings,
  Compass,
  Menu,
  X,
  Star,
  Sword,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatEmojiImg } from "@/components/theme/chat-emoji-context";
import { preloadRoute } from "@/App";

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null, slot: "sidebar_dashboard" as const },
  { title: "Characters", href: "/characters", icon: Users, badge: null, slot: "sidebar_character" as const },
  { title: "Pull Planner", href: "/pull-planner", icon: Sparkles, badge: "Pity", slot: "sidebar_pull" as const },
  { title: "Banner Radar", href: "/banner-radar", icon: CalendarHeart, badge: "New", slot: "sidebar_banner" as const },
  { title: "Resources", href: "/resources", icon: Package, badge: null, slot: "sidebar_resources" as const },
  { title: "Progression", href: "/progression", icon: TrendingUp, badge: null, slot: "sidebar_progression" as const },
  { title: "Weapons", href: "/weapons", icon: Sword, badge: null, slot: "sidebar_resources" as const },
  { title: "Teams", href: "/teams", icon: UserRoundCog, badge: null, slot: "sidebar_teams" as const },
  { title: "Settings", href: "/settings", icon: Settings, badge: null, slot: "sidebar_settings" as const },
];

export const Sidebar = React.memo(function Sidebar({ className }: { className?: string }) {
  const { pathname } = useLocation();
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

        <aside
          className={cn(
            "fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 bg-[#101B35]/95 backdrop-blur-2xl border-r border-[#D7B66D]/25 shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0",
            className
          )}
        >
          
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-[#D7B66D]/20 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2D38A] via-[#D7B66D] to-[#A98326] flex items-center justify-center text-[#101B35] shadow-[0_0_12px_rgba(242,211,138,0.4)] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-[18px] leading-tight tracking-tight text-[#EAEAF0] flex items-center gap-1.5 whitespace-nowrap">
                Character Getter
                <Star className="w-3.5 h-3.5 text-[#F2D38A] fill-[#F2D38A] shrink-0" />
              </h1>
              <p className="text-[13.5px] text-[#AEBBD0] font-serif italic truncate">Teyvat Companion</p>
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
                  to={item.href}
                  onMouseEnter={() => preloadRoute(item.href)}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 min-h-[44px] py-2.5 rounded-xl text-[15.5px] font-medium transition-all relative z-10 whitespace-nowrap",
                    isActive
                      ? "bg-gradient-to-r from-[#D7B66D]/25 via-[#D7B66D]/12 to-transparent text-[#F2D38A] font-semibold border border-[#D7B66D]/45 shadow-[inset_0_0_12px_rgba(215,182,109,0.18)]"
                      : "text-[#AEBBD0] hover:bg-[#1C3154]/80 hover:text-[#EAEAF0]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-colors",
                        isActive ? "text-[#F2D38A]" : "text-[#AEBBD0] group-hover:text-[#EAEAF0]"
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D7B66D]/20 text-[#F2D38A] border border-[#D7B66D]/35 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Chat emoji decoration on active nav items with assigned slots */}
                {"slot" in item && item.slot && isActive && (
                  <div className="absolute -top-2.5 right-1 z-20 pointer-events-none animate-genshin-float">
                    <ChatEmojiImg slot={item.slot} size={32} animate={false} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D7B66D]/20 bg-[#0c152a]/70 text-[13px] text-[#AEBBD0] relative">
          <div className="flex items-end justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#D7B66D]/15 text-[#F2D38A] border border-[#D7B66D]/30">
                  Local-First
                </span>
                <span className="text-[#F2D38A] font-semibold text-[13px]">Teyvat Archive</span>
              </div>
              <p className="text-[12px] text-[#AEBBD0]/80 truncate">Independent Companion</p>
            </div>

            {/* Chat emoji decoration in footer */}
            <ChatEmojiImg slot="sidebar_footer" size={34} animate={false} />
          </div>
        </div>
      </aside>
    </>
  );
});
