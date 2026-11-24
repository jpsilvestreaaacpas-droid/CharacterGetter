import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AlertCircle } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070d19] text-foreground flex relative overflow-x-hidden">
      {/* Background Mountain Silhouette & Ambient Flora Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        {/* Subtle mountain ridges silhouette along bottom */}
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 right-0 w-full h-72 text-[#08152c] fill-current preserve-3d"
          preserveAspectRatio="none"
        >
          <path d="M0,224L60,208C120,192,240,160,360,176C480,192,600,256,720,240C840,224,960,128,1080,138C1200,149,1320,267,1380,320L1440,320L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          <path d="M0,280L80,260C160,240,320,200,480,210C640,220,800,280,960,270C1120,260,1280,180,1360,160L1440,140L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" opacity="0.5" />
        </svg>

        {/* Glowing turquoise/cyan flora light pools */}
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main layout container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen relative z-10">
        {/* Top Demo Data Notice Banner */}
        <div className="bg-[#0b1426]/90 border-b border-amber-500/20 px-6 py-1.5 text-xs text-amber-200/90 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong className="font-semibold text-amber-300">Demo Mode:</strong> Displaying sample traveler data. This does not represent actual player account credentials or confidential game data.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-wider text-amber-400/70">
            Sample Traveler Lumine
          </span>
        </div>

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
