import {
  evaluateBannerProbability,
  RadarEvidenceItem,
  ProbabilityEvaluationResult,
  PredictionStatus,
  ConfidenceLevel,
} from "../radar/probability-engine";
import { CANONICAL_CHARACTERS } from "./canonical-characters";

export interface BannerPrediction {
  id: string;
  characterId: string;
  characterName: string;
  rarity: number;
  element: string;
  weaponType: string;
  estimatedVersion: string;
  estimatedPhase: 1 | 2;
  bannerType: "CHARACTER_EVENT" | "CHRONICLED_WISH";
  isRerun: boolean;
  evidence: RadarEvidenceItem[];
  evaluation: ProbabilityEvaluationResult;
  lastUpdated: string;
}

// Canonical community sources with historical accuracy records
export const COMMUNITY_SOURCES = {
  homdgcat: {
    id: "homdgcat",
    name: "HomDGCat Datamines",
    platform: "Community" as const,
    historicalAccuracy: 0.94,
  },
  chalice: {
    id: "chalice",
    name: "Team Chalice",
    platform: "Discord" as const,
    historicalAccuracy: 0.88,
  },
  foul: {
    id: "foul",
    name: "Uncle Foul (Beta Leak Archive)",
    platform: "X" as const,
    historicalAccuracy: 0.86,
  },
  white: {
    id: "white",
    name: "White Leak Aggregator",
    platform: "Reddit" as const,
    historicalAccuracy: 0.65,
  },
  hoyoverse: {
    id: "hoyoverse",
    name: "HoYoverse Special Program",
    platform: "Official" as const,
    historicalAccuracy: 1.0,
    isOfficial: true,
  },
};

// Seed predictions for current & upcoming versions
const RAW_PREDICTIONS: Omit<BannerPrediction, "characterName" | "rarity" | "element" | "weaponType" | "evaluation">[] = [
  {
    id: "pred-mavuika-5-3",
    characterId: "mavuika",
    estimatedVersion: "5.3",
    estimatedPhase: 1,
    bannerType: "CHARACTER_EVENT",
    isRerun: false,
    lastUpdated: "2024-12-20T10:00:00Z",
    evidence: [
      {
        id: "ev-mav-1",
        source: COMMUNITY_SOURCES.hoyoverse,
        url: "https://genshin.hoyoverse.com/en/news/detail/503-special-program",
        publishedAt: "2024-12-20T12:00:00Z",
        stance: "Supports",
        claimType: "Official Teaser",
        credibilityScore: 1.0,
      },
    ],
  },
  {
    id: "pred-furina-5-4",
    characterId: "furina",
    estimatedVersion: "5.4",
    estimatedPhase: 1,
    bannerType: "CHARACTER_EVENT",
    isRerun: true,
    lastUpdated: "2025-01-10T14:00:00Z",
    evidence: [
      {
        id: "ev-fur-1",
        source: COMMUNITY_SOURCES.homdgcat,
        url: "https://homdgcat.wiki/gi/char#furina",
        publishedAt: "2025-01-08T09:00:00Z",
        stance: "Supports",
        claimType: "Beta Datamine",
        credibilityScore: 0.95,
      },
      {
        id: "ev-fur-2",
        source: COMMUNITY_SOURCES.chalice,
        url: "https://discord.com/channels/chalice-leaks/5-4-lineup",
        publishedAt: "2025-01-09T18:00:00Z",
        stance: "Supports",
        claimType: "Event Leak",
        credibilityScore: 0.88,
      },
    ],
  },
  {
    id: "pred-zhongli-5-4",
    characterId: "zhongli",
    estimatedVersion: "5.4",
    estimatedPhase: 2,
    bannerType: "CHARACTER_EVENT",
    isRerun: true,
    lastUpdated: "2025-01-12T16:00:00Z",
    evidence: [
      {
        id: "ev-zh-1",
        source: COMMUNITY_SOURCES.chalice,
        url: "https://discord.com/channels/chalice/banner-lineup",
        publishedAt: "2025-01-11T12:00:00Z",
        stance: "Supports",
        claimType: "Insider Whisper",
        credibilityScore: 0.80,
      },
      {
        id: "ev-zh-2",
        source: COMMUNITY_SOURCES.white,
        url: "https://reddit.com/r/Genshin_Impact_Leaks/comments/zhongli_54",
        publishedAt: "2025-01-12T04:00:00Z",
        stance: "Supports",
        claimType: "Speculation",
        credibilityScore: 0.65,
      },
      {
        id: "ev-zh-contra",
        source: COMMUNITY_SOURCES.foul,
        url: "https://x.com/foul_leaks/status/zhongli_doubt",
        publishedAt: "2025-01-12T15:00:00Z",
        stance: "Contradicts",
        claimType: "Insider Whisper",
        credibilityScore: 0.75,
      },
    ],
  },
  {
    id: "pred-neuvillette-5-5",
    characterId: "neuvillette",
    estimatedVersion: "5.5",
    estimatedPhase: 1,
    bannerType: "CHARACTER_EVENT",
    isRerun: true,
    lastUpdated: "2025-01-15T08:00:00Z",
    evidence: [
      {
        id: "ev-neuv-1",
        source: COMMUNITY_SOURCES.foul,
        url: "https://x.com/foul_leaks/status/neuvillette_rerun",
        publishedAt: "2025-01-14T20:00:00Z",
        stance: "Supports",
        claimType: "Story Leak",
        credibilityScore: 0.85,
      },
    ],
  },
  {
    id: "pred-raiden-5-5",
    characterId: "raiden-shogun",
    estimatedVersion: "5.5",
    estimatedPhase: 2,
    bannerType: "CHARACTER_EVENT",
    isRerun: true,
    lastUpdated: "2025-01-05T12:00:00Z",
    evidence: [
      {
        id: "ev-raid-1",
        source: COMMUNITY_SOURCES.white,
        url: "https://reddit.com/r/Genshin_Impact_Leaks/comments/raiden_55",
        publishedAt: "2024-11-01T10:00:00Z", // Stale test case (>60 days)
        stance: "Supports",
        claimType: "Speculation",
        credibilityScore: 0.40,
      },
    ],
  },
];

export function getBannerPredictions(): BannerPrediction[] {
  return RAW_PREDICTIONS.map((p) => {
    const canon = CANONICAL_CHARACTERS.find((c) => c.id === p.characterId);
    const evaluation = evaluateBannerProbability(p.evidence);

    return {
      ...p,
      characterName: canon?.name ?? (p.characterId === "mavuika" ? "Mavuika" : p.characterId),
      rarity: canon?.rarity ?? 5,
      element: canon?.element ?? (p.characterId === "mavuika" ? "Pyro" : "Anemo"),
      weaponType: canon?.weaponType ?? (p.characterId === "mavuika" ? "Claymore" : "Sword"),
      evaluation,
    };
  });
}
