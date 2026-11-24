/**
 * M3 - Pull Planner Data, History, and Savings Projections
 * Tracks wish logs, pity breakdowns across banners, and savings forecasts.
 */

export interface WishLogItem {
  id: string;
  bannerType: "CHARACTER_EVENT" | "WEAPON_EVENT" | "STANDARD";
  name: string;
  itemType: "character" | "weapon";
  rarity: 3 | 4 | 5;
  pityCount: number;
  date: string;
  won5050?: boolean;
}

export interface SavingsProjectionPlan {
  daysRemaining: number;
  dailyCommissionsPrimos: number;
  welkinActive: boolean;
  battlePassActive: boolean;
  eventsEstimatedPrimos: number;
  abyssEstimatedPrimos: number;
  starglitterFates: number;
}

export const DEMO_WISH_HISTORY: WishLogItem[] = [
  {
    id: "wish-001",
    bannerType: "CHARACTER_EVENT",
    name: "Furina",
    itemType: "character",
    rarity: 5,
    pityCount: 78,
    date: "2024-03-15",
    won5050: true,
  },
  {
    id: "wish-002",
    bannerType: "CHARACTER_EVENT",
    name: "Charlotte",
    itemType: "character",
    rarity: 4,
    pityCount: 9,
    date: "2024-03-15",
  },
  {
    id: "wish-003",
    bannerType: "CHARACTER_EVENT",
    name: "Mona",
    itemType: "character",
    rarity: 5,
    pityCount: 76,
    date: "2024-01-08",
    won5050: false,
  },
  {
    id: "wish-004",
    bannerType: "CHARACTER_EVENT",
    name: "Raiden Shogun",
    itemType: "character",
    rarity: 5,
    pityCount: 81,
    date: "2024-01-10",
    won5050: true,
  },
  {
    id: "wish-005",
    bannerType: "CHARACTER_EVENT",
    name: "Chevreuse",
    itemType: "character",
    rarity: 4,
    pityCount: 8,
    date: "2024-01-10",
  },
  {
    id: "wish-006",
    bannerType: "WEAPON_EVENT",
    name: "Splendor of Tranquil Waters",
    itemType: "weapon",
    rarity: 5,
    pityCount: 68,
    date: "2024-03-16",
    won5050: true,
  },
  {
    id: "wish-007",
    bannerType: "STANDARD",
    name: "Jean",
    itemType: "character",
    rarity: 5,
    pityCount: 75,
    date: "2023-11-20",
  },
];

/**
 * Calculates projected Primogems and total wishes over a future duration.
 */
export function calculateSavingsProjection(plan: SavingsProjectionPlan): {
  projectedPrimos: number;
  projectedFates: number;
  totalProjectedWishes: number;
  dailyRate: number;
} {
  const {
    daysRemaining,
    dailyCommissionsPrimos,
    welkinActive,
    battlePassActive,
    eventsEstimatedPrimos,
    abyssEstimatedPrimos,
    starglitterFates,
  } = plan;

  const welkinDaily = welkinActive ? 90 : 0;
  const dailyTotal = dailyCommissionsPrimos + welkinDaily;
  const baseDailyGains = dailyTotal * daysRemaining;

  const battlePassPrimos = battlePassActive ? 680 + 4 * 160 : 0; // 680 primos + 4 intertwined fates
  const totalPrimos = baseDailyGains + eventsEstimatedPrimos + abyssEstimatedPrimos + battlePassPrimos;

  const extraFates = starglitterFates + (battlePassActive ? 4 : 0);
  const wishesFromPrimos = Math.floor(totalPrimos / 160);
  const totalWishes = wishesFromPrimos + extraFates;

  return {
    projectedPrimos: totalPrimos,
    projectedFates: extraFates,
    totalProjectedWishes: totalWishes,
    dailyRate: dailyTotal,
  };
}

/**
 * Calculates historical 5-star summary from wish history.
 */
export function summarizeWishHistory(history: WishLogItem[]) {
  const fiveStars = history.filter((w) => w.rarity === 5);
  const characterEvent5Stars = fiveStars.filter((w) => w.bannerType === "CHARACTER_EVENT");

  const total5Stars = fiveStars.length;
  const avgPity =
    total5Stars > 0
      ? Math.round(fiveStars.reduce((acc, curr) => acc + curr.pityCount, 0) / total5Stars)
      : 0;

  const fiftyFiftyPulls = characterEvent5Stars.filter((w) => w.won5050 !== undefined);
  const wonCount = fiftyFiftyPulls.filter((w) => w.won5050 === true).length;
  const winRate =
    fiftyFiftyPulls.length > 0 ? Math.round((wonCount / fiftyFiftyPulls.length) * 100) : 50;

  return {
    total5Stars,
    avgPity,
    wonCount,
    lostCount: fiftyFiftyPulls.length - wonCount,
    winRate,
    history,
  };
}
