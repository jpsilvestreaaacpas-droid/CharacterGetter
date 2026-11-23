"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-gold-500/35 bg-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="font-semibold text-lg text-foreground tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}
