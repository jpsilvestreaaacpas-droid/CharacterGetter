"use client";

import * as React from "react";

export type RegionalBackgroundId = "mondstadt" | "inazuma" | "teyvat";

export interface RegionalBackgroundOption {
  id: RegionalBackgroundId;
  name: string;
  region: string;
  image: string;
  accentColor: string;
  description: string;
}

export const REGIONAL_BACKGROUNDS: RegionalBackgroundOption[] = [
  {
    id: "mondstadt",
    name: "Mondstadt Night",
    region: "Mondstadt",
    image: "/images/backgrounds/mondstadt.jpg",
    accentColor: "#38bdf8",
    description: "Serene celestial blue night with glowing Anemo flora and distant towers.",
  },
  {
    id: "inazuma",
    name: "Inazuma Night",
    region: "Inazuma",
    image: "/images/backgrounds/inazuma.jpg",
    accentColor: "#a855f7",
    description: "Mystic purple Electro starlight over Mount Yougou and sacred sakura.",
  },
  {
    id: "teyvat",
    name: "Teyvat Horizon",
    region: "Teyvat",
    image: "/images/backgrounds/teyvat.jpg",
    accentColor: "#f59e0b",
    description: "Panoramic Teyvat vista overlooking ancient ruins, skies, and distant peaks.",
  },
];

interface BackgroundContextType {
  currentBackground: RegionalBackgroundId;
  setBackground: (bg: RegionalBackgroundId) => void;
  backgroundData: RegionalBackgroundOption;
}

const BackgroundContext = React.createContext<BackgroundContextType | undefined>(undefined);

const STORAGE_KEY = "character_getter_regional_background";

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [currentBackground, setCurrentBackgroundState] = React.useState<RegionalBackgroundId>("mondstadt");

  // Load from local storage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as RegionalBackgroundId;
      if (saved && (saved === "mondstadt" || saved === "inazuma" || saved === "teyvat")) {
        setCurrentBackgroundState(saved);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const setBackground = (bg: RegionalBackgroundId) => {
    setCurrentBackgroundState(bg);
    try {
      localStorage.setItem(STORAGE_KEY, bg);
    } catch {
      // Ignore
    }
  };

  const backgroundData =
    REGIONAL_BACKGROUNDS.find((b) => b.id === currentBackground) ?? REGIONAL_BACKGROUNDS[0];

  return (
    <BackgroundContext.Provider value={{ currentBackground, setBackground, backgroundData }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useRegionalBackground() {
  const ctx = React.useContext(BackgroundContext);
  if (!ctx) {
    // Graceful fallback if outside provider
    return {
      currentBackground: "mondstadt" as RegionalBackgroundId,
      setBackground: () => {},
      backgroundData: REGIONAL_BACKGROUNDS[0],
    };
  }
  return ctx;
}
