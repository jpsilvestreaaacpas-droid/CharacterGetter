"use client";

import * as React from "react";
import { useRegionalBackground } from "@/components/theme/background-context";

export function RegionalBackground() {
  const { backgroundData } = useRegionalBackground();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Underlying Regional Background Artwork */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform scale-[1.02]"
        style={{
          backgroundImage: `url('${backgroundData.image}')`,
          backgroundPosition: "center 30%",
        }}
      />

      {/* 2. Tuned Readability Scrim / Dark Gradient Overlays */}
      {/* Top Scrim (for Header & Breadcrumb clarity) */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#060b17]/95 via-[#070d19]/80 to-transparent" />

      {/* Center Atmospheric Contrast Layer (preserves artwork visibility without lowering text contrast) */}
      <div className="absolute inset-0 bg-[#070d19]/65 backdrop-blur-[2px]" />

      {/* Bottom Ground/Horizon Scrim */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#060b17]/95 via-[#081224]/75 to-transparent" />

      {/* Left Sidebar Shadow Scrim */}
      <div className="absolute inset-y-0 left-0 w-80 bg-gradient-to-r from-[#060b17]/90 to-transparent" />
    </div>
  );
}
