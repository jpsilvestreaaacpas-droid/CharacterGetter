import React from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-4xl font-bold text-gold-500">404</h1>
        <p className="text-muted-foreground">This page doesn&apos;t exist in Teyvat.</p>
        <Link
          to="/dashboard"
          className="text-sm text-gold-500 underline underline-offset-4 hover:text-gold-400"
        >
          Return to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
