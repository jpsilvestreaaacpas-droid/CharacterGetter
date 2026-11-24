"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RegionalBackground } from "@/components/layout/regional-background";
import { AlertCircle } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-full bg-[#070d19] text-foreground flex relative overflow-x-hidden selection:bg-amber-500/25 selection:text-amber-200">
      {/* Regional Landscape Artwork Background Layer */}
      <RegionalBackground />

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main layout container */}
      <div className="flex-1 min-w-0 max-w-full lg:pl-64 flex flex-col min-h-screen relative z-10">
        {/* Top Demo Data Notice Banner */}
        <div className="bg-[#0b1426]/90 border-b border-amber-500/20 px-3 sm:px-6 py-1.5 text-xs text-amber-200/90 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] leading-tight truncate sm:whitespace-normal">
              <strong className="font-semibold text-amber-300">Demo Mode:</strong>{" "}
              <span className="hidden sm:inline">Displaying sample traveler data. This does not represent actual player account credentials.</span>
              <span className="sm:hidden">Displaying sample traveler data.</span>
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[9px] uppercase tracking-wider text-amber-400/70 shrink-0 ml-2">
            Sample Traveler Lumine
          </span>
        </div>

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
