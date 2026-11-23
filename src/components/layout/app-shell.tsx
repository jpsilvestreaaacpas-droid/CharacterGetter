import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AlertCircle } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main layout container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Demo Data Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong className="font-semibold">Demo Mode:</strong> Displaying sample traveler data.
              This does not represent actual player account credentials or confidential game data.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-amber-700/80 dark:text-amber-400/80">
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
