export const PRIMOGEMS_PER_WISH = 160;
export const HARD_PITY_CHARACTER = 90;
export const SOFT_PITY_CHARACTER = 74;
export const HARD_PITY_WEAPON = 80;
export const SOFT_PITY_WEAPON = 63;

/**
 * Calculates how many wishes can be converted from primogems.
 */
export function primogemsToWishes(primogems: number): number {
  if (primogems <= 0 || isNaN(primogems)) return 0;
  return Math.floor(primogems / PRIMOGEMS_PER_WISH);
}

/**
 * Calculates remaining primogems after maximum possible wish conversion.
 */
export function primogemsRemainder(primogems: number): number {
  if (primogems <= 0 || isNaN(primogems)) return 0;
  return primogems % PRIMOGEMS_PER_WISH;
}

/**
 * Calculates total wishes available from both direct Intertwined Fates and convertible Primogems.
 */
export function totalAvailableWishes(primogems: number, intertwinedFates: number): number {
  const wishesFromPrimos = primogemsToWishes(primogems);
  const directFates = Math.max(0, intertwinedFates || 0);
  return wishesFromPrimos + directFates;
}

/**
 * Calculates wishes needed to guarantee next 5-star character from current pity state.
 * @param currentPity current pulls into the banner (0-89)
 * @param isGuaranteed whether the next 5-star is guaranteed banner rate-up (i.e. lost previous 50/50)
 */
export function wishesToTarget(
  currentPity: number,
  isGuaranteed: boolean,
  maxPity: number = HARD_PITY_CHARACTER
): {
  wishesToNext5Star: number;
  wishesToGuaranteedTarget: number;
  primogemsNeeded: number;
} {
  const safePity = Math.max(0, Math.min(currentPity, maxPity));
  const wishesToNext5Star = maxPity - safePity;

  // If guaranteed, only need to reach next 5-star. If 50/50, worst-case requires 2 full hard pities.
  const wishesToGuaranteedTarget = isGuaranteed
    ? wishesToNext5Star
    : wishesToNext5Star + maxPity;

  return {
    wishesToNext5Star,
    wishesToGuaranteedTarget,
    primogemsNeeded: wishesToGuaranteedTarget * PRIMOGEMS_PER_WISH,
  };
}

/**
 * Computes progress percentage towards max pity for progress bars.
 */
export function pityPercentage(currentPity: number, maxPity: number = HARD_PITY_CHARACTER): number {
  if (currentPity <= 0) return 0;
  return Math.min(100, Math.round((currentPity / maxPity) * 100));
}

/**
 * Aggregates statistics for owned characters.
 */
export function calculateRosterStats(characters: Array<{ rarity: number; level: number }>): {
  totalOwned: number;
  fiveStars: number;
  fourStars: number;
  maxLevelCount: number; // Level 90
  avgLevel: number;
} {
  const totalOwned = characters.length;
  if (totalOwned === 0) {
    return { totalOwned: 0, fiveStars: 0, fourStars: 0, maxLevelCount: 0, avgLevel: 0 };
  }

  const fiveStars = characters.filter((c) => c.rarity === 5).length;
  const fourStars = characters.filter((c) => c.rarity === 4).length;
  const maxLevelCount = characters.filter((c) => c.level >= 90).length;
  const totalLevel = characters.reduce((acc, c) => acc + c.level, 0);

  return {
    totalOwned,
    fiveStars,
    fourStars,
    maxLevelCount,
    avgLevel: Math.round(totalLevel / totalOwned),
  };
}
