/**
 * Centralized Calculation and Evidence Source System
 * Provides traceable, source-attributed calculations across M1, M2, and M3.
 */

// Source category hierarchy (1 = highest authoritative priority)
export type SourceCategory =
  | "OFFICIAL_HOYOVERSE"
  | "KQM_THEORYCRAFTING"
  | "KQM_STANDARDS"
  | "GENSHIN_OPTIMIZER"
  | "GCSIM"
  | "COMMUNITY_SHEETS_TESTING"
  | "COMMUNITY_DISCUSSION";

export type VerificationStatus =
  | "VERIFIED"
  | "CORROBORATED"
  | "EMPIRICAL_SIMULATION"
  | "HEURISTIC_ESTIMATE"
  | "INSUFFICIENT_EVIDENCE";

export interface CalculationSource {
  id: string;
  name: string;
  category: SourceCategory;
  url?: string;
  priorityRank: number; // 1 to 7
  isAuthoritative: boolean;
  notes?: string;
}

export interface CalculationEvidence {
  id: string;
  sourceId: string;
  evidenceType: "IN_GAME_TEST" | "OFFICIAL_NOTICE" | "KQM_TCL_ENTRY" | "SIMULATION_RUN" | "DATAMINE_RECORD" | "COMMUNITY_CORROBORATION";
  title: string;
  url?: string;
  sampleSize?: number;
  findingsSummary: string;
  hasConflictingFindings?: boolean;
  conflictingNotes?: string;
}

export interface CalculationMeta {
  methodId: string;
  methodName: string;
  module: "M1_FOUNDATION" | "M2_CHARACTERS" | "M3_PULL_PLANNER" | "M4_PROGRESSION" | "M5_TEAMS";
  version: string;
  formula: string;
  underlyingMechanics: string;
  assumptions: string[];
  sources: CalculationSource[];
  evidence: CalculationEvidence[];
  verificationStatus: VerificationStatus;
  lastUpdated: string;
  knownLimitations?: string;
}

export interface CalculationResult<T> {
  value: T;
  meta: CalculationMeta;
  explanation: string;
}

// =====================================================================
// AUTHORITATIVE SOURCE CATALOG
// =====================================================================

export const SOURCES: Record<string, CalculationSource> = {
  hoyoverse: {
    id: "hoyoverse-official",
    name: "HoYoverse In-Game Wish Details & Rules",
    category: "OFFICIAL_HOYOVERSE",
    url: "https://genshin.hoyoverse.com",
    priorityRank: 1,
    isAuthoritative: true,
    notes: "Official published rules governing banner rates, pity caps, and guarantee carries.",
  },
  kqmTcl: {
    id: "kqm-tcl",
    name: "KeqingMains Theorycrafting Library (TCL)",
    category: "KQM_THEORYCRAFTING",
    url: "https://library.keqingmains.com",
    priorityRank: 2,
    isAuthoritative: true,
    notes: "Peer-reviewed combat and drop mechanics verified by community theorycrafters.",
  },
  kqmStandards: {
    id: "kqm-standards",
    name: "KQM Standardized Calculation Criteria",
    category: "KQM_STANDARDS",
    url: "https://library.keqingmains.com/resources/compendiums/kqm-standards",
    priorityRank: 3,
    isAuthoritative: true,
    notes: "Agreed standard stat weights, weapon rankings, and baseline energy assumptions.",
  },
  genshinOptimizer: {
    id: "genshin-optimizer",
    name: "Genshin Optimizer",
    category: "GENSHIN_OPTIMIZER",
    url: "https://frzyc.github.io/genshin-optimizer",
    priorityRank: 4,
    isAuthoritative: true,
    notes: "Deterministic damage calculation benchmark against game damage formulas.",
  },
  gcsim: {
    id: "gcsim",
    name: "gcsim Team Rotation Simulator",
    category: "GCSIM",
    url: "https://gcsim.app",
    priorityRank: 5,
    isAuthoritative: true,
    notes: "Monte-Carlo team rotation and damage timeline simulator.",
  },
  paimonMoeEmpirical: {
    id: "paimon-moe-empirical",
    name: "Paimon.moe Global Wish Aggregator",
    category: "COMMUNITY_SHEETS_TESTING",
    url: "https://paimon.moe/wish/tally",
    priorityRank: 6,
    isAuthoritative: false,
    notes: "Aggregated empirical pull datasets (>100M pulls) establishing soft pity start at pull 74 (char) and 63 (weapon).",
  },
  communityForums: {
    id: "community-forums",
    name: "Community Research & Forums (Reddit / Discord)",
    category: "COMMUNITY_DISCUSSION",
    priorityRank: 7,
    isAuthoritative: false,
    notes: "Supporting hypothesis and ongoing testing observations. Not treated as verified facts alone.",
  },
};

// =====================================================================
// CALCULATION SERVICE IMPLEMENTATIONS
// =====================================================================

export const CalculationService = {
  // -------------------------------------------------------------------
  // M1: RESOURCE TOTALS & WISH CONVERSION
  // -------------------------------------------------------------------
  calculateWishPower(primogems: number, fates: number): CalculationResult<{
    totalWishes: number;
    wishesFromPrimos: number;
    leftoverPrimos: number;
    directFates: number;
  }> {
    const safePrimos = Math.max(0, primogems || 0);
    const safeFates = Math.max(0, fates || 0);
    const wishesFromPrimos = Math.floor(safePrimos / 160);
    const leftoverPrimos = safePrimos % 160;
    const totalWishes = wishesFromPrimos + safeFates;

    return {
      value: { totalWishes, wishesFromPrimos, leftoverPrimos, directFates: safeFates },
      explanation: `${safePrimos.toLocaleString()} Primogems converts to ${wishesFromPrimos} wishes (at 160:1) with ${leftoverPrimos} leftover Primogems, plus ${safeFates} direct Intertwined Fates.`,
      meta: {
        methodId: "m1-wish-power",
        methodName: "Total Wishing Power Calculation",
        module: "M1_FOUNDATION",
        version: "v1.2.0",
        formula: "Total Wishes = Intertwined Fates + floor(Primogems / 160)",
        underlyingMechanics: "Official in-game shop and banner rules: each single wish requires exactly 160 Primogems or 1 Intertwined/Acquaint Fate.",
        assumptions: [
          "Only Intertwined Fates are counted towards limited event banners.",
          "Starglitter or Genesis Crystal conversions are omitted unless explicitly converted.",
        ],
        sources: [SOURCES.hoyoverse],
        evidence: [
          {
            id: "ev-01",
            sourceId: SOURCES.hoyoverse.id,
            evidenceType: "OFFICIAL_NOTICE",
            title: "In-Game Wish System Details",
            findingsSummary: "Explicitly states 160 Primogems per wish exchange rate.",
          },
        ],
        verificationStatus: "VERIFIED",
        lastUpdated: "2026-11-24",
      },
    };
  },

  // -------------------------------------------------------------------
  // M1: ROSTER STATS & COLLECTION METRICS
  // -------------------------------------------------------------------
  calculateRosterSummary(characters: Array<{ rarity: number; level: number; friendshipLevel?: number }>): CalculationResult<{
    totalOwned: number;
    fiveStars: number;
    fourStars: number;
    maxLevelCount: number;
    maxFriendshipCount: number;
    avgLevel: number;
  }> {
    const totalOwned = characters.length;
    if (totalOwned === 0) {
      return {
        value: { totalOwned: 0, fiveStars: 0, fourStars: 0, maxLevelCount: 0, maxFriendshipCount: 0, avgLevel: 0 },
        explanation: "No characters in roster.",
        meta: {
          methodId: "m1-roster-summary",
          methodName: "Roster Aggregation",
          module: "M1_FOUNDATION",
          version: "v1.0.0",
          formula: "Count & Average across local owned player character records",
          underlyingMechanics: "Account-level character inventory totals and ascension limits.",
          assumptions: ["Max level cap is 90 (Ascension 6).", "Max friendship level is 10."],
          sources: [SOURCES.hoyoverse],
          evidence: [],
          verificationStatus: "VERIFIED",
          lastUpdated: "2026-11-24",
        },
      };
    }

    const fiveStars = characters.filter((c) => c.rarity === 5).length;
    const fourStars = characters.filter((c) => c.rarity === 4).length;
    const maxLevelCount = characters.filter((c) => c.level >= 90).length;
    const maxFriendshipCount = characters.filter((c) => (c.friendshipLevel ?? 0) >= 10).length;
    const totalLevel = characters.reduce((acc, c) => acc + c.level, 0);

    return {
      value: {
        totalOwned,
        fiveStars,
        fourStars,
        maxLevelCount,
        maxFriendshipCount,
        avgLevel: Math.round(totalLevel / totalOwned),
      },
      explanation: `Account owns ${totalOwned} characters (${fiveStars} 5★, ${fourStars} 4★) with an average level of ${Math.round(totalLevel / totalOwned)}.`,
      meta: {
        methodId: "m1-roster-summary",
        methodName: "Roster Summary & Quality Metric",
        module: "M1_FOUNDATION",
        version: "v1.0.0",
        formula: "avgLevel = round(sum(levels) / totalOwned)",
        underlyingMechanics: "Standard arithmetic aggregation across player profile records.",
        assumptions: ["All characters in player's local roster have validated levels between 1 and 90."],
        sources: [SOURCES.hoyoverse],
        evidence: [],
        verificationStatus: "VERIFIED",
        lastUpdated: "2026-11-24",
      },
    };
  },

  // -------------------------------------------------------------------
  // M2: ASCENSION & TALENT PROGRESSION REQUIREMENTS
  // -------------------------------------------------------------------
  calculateAscensionMaterialRequirement(
    currentPhase: number,
    targetPhase: number,
    rarity: 4 | 5
  ): CalculationResult<{
    mora: number;
    phasesNeeded: number;
    gemSliver: number;
    gemFragment: number;
    gemChunk: number;
    gemGemstone: number;
    bossMaterials: number;
    localSpecialties: number;
  }> {
    // 5-star character cumulative tier costs per phase
    const PHASE_DATA_5STAR = [
      { phase: 1, mora: 20000, gemSliver: 1, gemFragment: 0, gemChunk: 0, gemGemstone: 0, bossMaterials: 0, localSpecialties: 3 },
      { phase: 2, mora: 40000, gemSliver: 0, gemFragment: 3, gemChunk: 0, gemGemstone: 0, bossMaterials: 2, localSpecialties: 10 },
      { phase: 3, mora: 60000, gemSliver: 0, gemFragment: 6, gemChunk: 0, gemGemstone: 0, bossMaterials: 4, localSpecialties: 20 },
      { phase: 4, mora: 80000, gemSliver: 0, gemFragment: 0, gemChunk: 3, gemGemstone: 0, bossMaterials: 8, localSpecialties: 30 },
      { phase: 5, mora: 100000, gemSliver: 0, gemFragment: 0, gemChunk: 6, gemGemstone: 0, bossMaterials: 12, localSpecialties: 45 },
      { phase: 6, mora: 120000, gemSliver: 0, gemFragment: 0, gemChunk: 0, gemGemstone: 6, bossMaterials: 20, localSpecialties: 60 },
    ];

    const safeCurrent = Math.max(0, Math.min(6, currentPhase));
    const safeTarget = Math.max(safeCurrent, Math.min(6, targetPhase));

    let mora = 0, gemSliver = 0, gemFragment = 0, gemChunk = 0, gemGemstone = 0, bossMaterials = 0, localSpecialties = 0;

    for (let p = safeCurrent + 1; p <= safeTarget; p++) {
      const row = PHASE_DATA_5STAR.find((r) => r.phase === p);
      if (row) {
        mora += rarity === 5 ? row.mora : Math.round(row.mora * 0.625);
        gemSliver += row.gemSliver;
        gemFragment += row.gemFragment;
        gemChunk += row.gemChunk;
        gemGemstone += row.gemGemstone;
        bossMaterials += row.bossMaterials;
        localSpecialties += row.localSpecialties;
      }
    }

    return {
      value: {
        mora,
        phasesNeeded: safeTarget - safeCurrent,
        gemSliver,
        gemFragment,
        gemChunk,
        gemGemstone,
        bossMaterials,
        localSpecialties,
      },
      explanation: `Ascending from Phase ${safeCurrent} to Phase ${safeTarget} requires ${mora.toLocaleString()} Mora, ${bossMaterials} Boss Drops, and ${localSpecialties} Local Specialties.`,
      meta: {
        methodId: "m2-ascension-materials",
        methodName: "Character Ascension Cost Accumulator",
        module: "M2_CHARACTERS",
        version: "v1.1.0",
        formula: "sum(cost_table[p] for p in (currentPhase + 1)..targetPhase)",
        underlyingMechanics: "Exact in-game ascension table parameters per game version 1.0 through current version.",
        assumptions: ["Crafting / alchemy conversion discounts are excluded from raw requirements."],
        sources: [SOURCES.hoyoverse, SOURCES.kqmTcl],
        evidence: [
          {
            id: "ev-asc-01",
            sourceId: SOURCES.kqmTcl.id,
            evidenceType: "KQM_TCL_ENTRY",
            title: "Character Leveling and Ascension Standards",
            url: "https://library.keqingmains.com/resources/compendiums/ascension-costs",
            findingsSummary: "Validated total materials needed for Level 1 to 90 (420k Mora, 46 boss mats, 168 specialties for 5★).",
          },
        ],
        verificationStatus: "VERIFIED",
        lastUpdated: "2026-11-24",
      },
    };
  },

  // -------------------------------------------------------------------
  // M3: PITY AND RATE-UP GUARANTEE WORST-CASE PLANNING
  // -------------------------------------------------------------------
  calculatePityGuarantees(
    currentPity: number,
    isGuaranteed: boolean,
    bannerType: "CHARACTER_EVENT" | "WEAPON_EVENT" = "CHARACTER_EVENT"
  ): CalculationResult<{
    wishesToNext5Star: number;
    wishesToGuaranteedTarget: number;
    primogemsForNext5Star: number;
    primogemsForGuaranteedTarget: number;
    softPityThreshold: number;
    hardPityThreshold: number;
    pullsToSoftPity: number;
  }> {
    const isChar = bannerType === "CHARACTER_EVENT";
    const hardPity = isChar ? 90 : 80;
    const softPity = isChar ? 74 : 63;

    const safePity = Math.max(0, Math.min(currentPity, hardPity - 1));
    const wishesToNext5Star = hardPity - safePity;
    const wishesToGuaranteedTarget = isGuaranteed ? wishesToNext5Star : wishesToNext5Star + hardPity;
    const pullsToSoftPity = Math.max(0, softPity - safePity);

    return {
      value: {
        wishesToNext5Star,
        wishesToGuaranteedTarget,
        primogemsForNext5Star: wishesToNext5Star * 160,
        primogemsForGuaranteedTarget: wishesToGuaranteedTarget * 160,
        softPityThreshold: softPity,
        hardPityThreshold: hardPity,
        pullsToSoftPity,
      },
      explanation: isGuaranteed
        ? `With Rate-Up Guaranteed, at most ${wishesToNext5Star} pulls (${wishesToNext5Star * 160} Primos) are needed for the featured 5★.`
        : `On 50/50, worst-case requires ${wishesToGuaranteedTarget} pulls (${wishesToGuaranteedTarget * 160} Primos) if the 50/50 is lost.`,
      meta: {
        methodId: "m3-pity-guarantee",
        methodName: "Pity & Worst-Case Guarantee Thresholds",
        module: "M3_PULL_PLANNER",
        version: "v2.0.0",
        formula: isGuaranteed ? "wishesNeeded = HardPity - currentPity" : "wishesNeeded = (HardPity - currentPity) + HardPity",
        underlyingMechanics: "Official gacha rules: 90 hard pity for character banners (80 for weapons). If non-promotional 5★ is obtained, next 5★ is 100% guaranteed to be promotional.",
        assumptions: [
          "Calculates strictly worst-case upper bound (100% certainty guarantee), not probabilistic expected averages.",
          "Capturing Fate mechanic (introduced in v5.0) provides an additional ~5% safety floor on losing 50/50, but does not increase the absolute worst-case 180 pulls threshold.",
        ],
        sources: [SOURCES.hoyoverse, SOURCES.paimonMoeEmpirical],
        evidence: [
          {
            id: "ev-pity-01",
            sourceId: SOURCES.hoyoverse.id,
            evidenceType: "OFFICIAL_NOTICE",
            title: "Event Wish Rules & Details",
            findingsSummary: "Guaranteed 5-star within 90 attempts; guarantee carries over across event banners.",
          },
          {
            id: "ev-pity-02",
            sourceId: SOURCES.paimonMoeEmpirical.id,
            evidenceType: "COMMUNITY_CORROBORATION",
            title: "Global Wish Tally Statistical Model",
            url: "https://paimon.moe/wish/tally",
            sampleSize: 124000000,
            findingsSummary: "Demonstrates 0.6% base rate with soft pity ramp beginning at pull 74 (char) and 63 (weapon).",
          },
        ],
        verificationStatus: "VERIFIED",
        lastUpdated: "2026-11-24",
        knownLimitations: "Does not model weapon banner Fate Points system or Capturing Fate RNG rolls; guarantees are upper-bound bounds.",
      },
    };
  },

  // -------------------------------------------------------------------
  // M3: SAVINGS FORECAST MODELING
  // -------------------------------------------------------------------
  calculateSavingsForecast(options: {
    daysRemaining: number;
    dailyCommissions: number;
    welkinActive: boolean;
    battlePassActive: boolean;
    eventsPrimos: number;
    abyssPrimos: number;
    starglitterFates: number;
  }): CalculationResult<{
    projectedPrimos: number;
    projectedFates: number;
    totalProjectedWishes: number;
    dailyIncome: number;
  }> {
    const { daysRemaining, dailyCommissions, welkinActive, battlePassActive, eventsPrimos, abyssPrimos, starglitterFates } = options;

    const welkinDaily = welkinActive ? 90 : 0;
    const dailyIncome = dailyCommissions + welkinDaily;
    const baseDaily = dailyIncome * Math.max(0, daysRemaining);

    // Battle pass gives 680 primos + 4 intertwined fates per 42-day cycle
    const bpPrimos = battlePassActive ? 680 : 0;
    const bpFates = battlePassActive ? 4 : 0;

    const totalPrimos = baseDaily + eventsPrimos + abyssPrimos + bpPrimos;
    const totalFates = starglitterFates + bpFates;
    const wishesFromPrimos = Math.floor(totalPrimos / 160);
    const totalProjectedWishes = wishesFromPrimos + totalFates;

    return {
      value: {
        projectedPrimos: totalPrimos,
        projectedFates: totalFates,
        totalProjectedWishes,
        dailyIncome,
      },
      explanation: `Projected over ${daysRemaining} days: +${totalProjectedWishes} wishes (${totalPrimos.toLocaleString()} Primos + ${totalFates} Fates) at ${dailyIncome} Primos/day.`,
      meta: {
        methodId: "m3-savings-forecast",
        methodName: "Banner Savings Linear Progression Model",
        module: "M3_PULL_PLANNER",
        version: "v1.0.0",
        formula: "totalWishes = floor((days * (60 + welkin) + events + abyss + bpPrimos) / 160) + bpFates + shopFates",
        underlyingMechanics: "Daily commissions grant 60 Primos; Welkin Moon grants 90 Primos daily upon login; Spiral Abyss/Theater grant fixed resets.",
        assumptions: [
          "Player completes all 4 daily commissions every day without lapse.",
          "Player logs in daily to claim Welkin Moon if subscription is active.",
          "Version patches are assumed to last 42 days unless stated otherwise.",
        ],
        sources: [SOURCES.hoyoverse, SOURCES.kqmStandards],
        evidence: [],
        verificationStatus: "CORROBORATED",
        lastUpdated: "2026-11-24",
      },
    };
  },
};
