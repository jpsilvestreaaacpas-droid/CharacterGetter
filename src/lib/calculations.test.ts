import { describe, it, expect } from "vitest";
import {
  primogemsToWishes,
  primogemsRemainder,
  totalAvailableWishes,
  wishesToTarget,
  pityPercentage,
  calculateRosterStats,
  PRIMOGEMS_PER_WISH,
} from "./calculations";

describe("Primogem & Wish Calculations", () => {
  it("converts primogems to wishes accurately (160 primogems = 1 wish)", () => {
    expect(primogemsToWishes(160)).toBe(1);
    expect(primogemsToWishes(320)).toBe(2);
    expect(primogemsToWishes(1600)).toBe(10);
    expect(primogemsToWishes(14880)).toBe(93);
    expect(primogemsToWishes(0)).toBe(0);
    expect(primogemsToWishes(-100)).toBe(0);
    expect(primogemsToWishes(159)).toBe(0);
  });

  it("calculates remaining primogems after max conversion", () => {
    expect(primogemsRemainder(160)).toBe(0);
    expect(primogemsRemainder(200)).toBe(40);
    expect(primogemsRemainder(14880)).toBe(0);
    expect(primogemsRemainder(14895)).toBe(15);
  });

  it("calculates total available wishes from primogems + direct fates", () => {
    // 14880 primos = 93 wishes. + 12 intertwined fates = 105 total
    expect(totalAvailableWishes(14880, 12)).toBe(105);
    expect(totalAvailableWishes(0, 10)).toBe(10);
    expect(totalAvailableWishes(1600, 0)).toBe(10);
    expect(totalAvailableWishes(0, 0)).toBe(0);
  });

  it("calculates wishes needed to guarantee target character", () => {
    // When guaranteed at 64 pity, need 90 - 64 = 26 wishes
    const guaranteed = wishesToTarget(64, true, 90);
    expect(guaranteed.wishesToNext5Star).toBe(26);
    expect(guaranteed.wishesToGuaranteedTarget).toBe(26);
    expect(guaranteed.primogemsNeeded).toBe(26 * PRIMOGEMS_PER_WISH);

    // When on 50/50 at 64 pity:
    // Next 5-star is at 26 pulls. If 50/50 is lost, guaranteed at next 90 pulls = 26 + 90 = 116 pulls.
    const notGuaranteed = wishesToTarget(64, false, 90);
    expect(notGuaranteed.wishesToNext5Star).toBe(26);
    expect(notGuaranteed.wishesToGuaranteedTarget).toBe(116);
    expect(notGuaranteed.primogemsNeeded).toBe(116 * PRIMOGEMS_PER_WISH);
  });

  it("computes pity progress percentage safely", () => {
    expect(pityPercentage(0, 90)).toBe(0);
    expect(pityPercentage(45, 90)).toBe(50);
    expect(pityPercentage(90, 90)).toBe(100);
    expect(pityPercentage(64, 90)).toBe(71); // 64 / 90 = 71.1%
    expect(pityPercentage(100, 90)).toBe(100); // capped at 100
  });

  it("aggregates character roster statistics", () => {
    const sample = [
      { rarity: 5, level: 90 },
      { rarity: 5, level: 80 },
      { rarity: 4, level: 90 },
      { rarity: 4, level: 70 },
    ];
    const stats = calculateRosterStats(sample);
    expect(stats.totalOwned).toBe(4);
    expect(stats.fiveStars).toBe(2);
    expect(stats.fourStars).toBe(2);
    expect(stats.maxLevelCount).toBe(2);
    expect(stats.avgLevel).toBe(83); // (90+80+90+70) / 4 = 82.5 -> 83
  });

  it("handles empty roster stats gracefully", () => {
    const stats = calculateRosterStats([]);
    expect(stats.totalOwned).toBe(0);
    expect(stats.fiveStars).toBe(0);
    expect(stats.fourStars).toBe(0);
    expect(stats.maxLevelCount).toBe(0);
    expect(stats.avgLevel).toBe(0);
  });
});
