import { describe, it, expect } from "vitest";
import { CalculationService, SOURCES } from "@/lib/services/calculation-service";

describe("Centralized Calculation & Evidence Source System", () => {
  describe("M1: Wish Power & Resource Totals", () => {
    it("converts Primogems at 160:1 with exact leftover calculation", () => {
      const result = CalculationService.calculateWishPower(14880, 12);
      expect(result.value.wishesFromPrimos).toBe(93);
      expect(result.value.leftoverPrimos).toBe(0);
      expect(result.value.totalWishes).toBe(105);
      expect(result.meta.verificationStatus).toBe("VERIFIED");
      expect(result.meta.sources[0].id).toBe("hoyoverse-official");
      expect(result.meta.sources[0].priorityRank).toBe(1);
    });

    it("handles non-multiples of 160 accurately", () => {
      const result = CalculationService.calculateWishPower(165, 0);
      expect(result.value.wishesFromPrimos).toBe(1);
      expect(result.value.leftoverPrimos).toBe(5);
      expect(result.value.totalWishes).toBe(1);
    });
  });

  describe("M1: Roster Statistics & Aggregation", () => {
    it("aggregates roster counts and computes average level correctly", () => {
      const characters = [
        { rarity: 5, level: 90, friendshipLevel: 10 },
        { rarity: 5, level: 90, friendshipLevel: 10 },
        { rarity: 4, level: 60, friendshipLevel: 5 },
      ];
      const result = CalculationService.calculateRosterSummary(characters);
      expect(result.value.totalOwned).toBe(3);
      expect(result.value.fiveStars).toBe(2);
      expect(result.value.fourStars).toBe(1);
      expect(result.value.maxLevelCount).toBe(2);
      expect(result.value.maxFriendshipCount).toBe(2);
      expect(result.value.avgLevel).toBe(80);
    });
  });

  describe("M2: Ascension Material Requirements", () => {
    it("calculates exact ascension material requirements from Phase 0 to 6", () => {
      const result = CalculationService.calculateAscensionMaterialRequirement(0, 6, 5);
      expect(result.value.phasesNeeded).toBe(6);
      expect(result.value.mora).toBe(420000); // 20k+40k+60k+80k+100k+120k
      expect(result.value.bossMaterials).toBe(46); // 0+2+4+8+12+20
      expect(result.value.localSpecialties).toBe(168); // 3+10+20+30+45+60
      expect(result.meta.sources.some((s) => s.id === "kqm-tcl")).toBe(true);
    });
  });

  describe("M3: Pity & Guarantee Thresholds", () => {
    it("calculates 50/50 worst-case threshold for character event banner", () => {
      const result = CalculationService.calculatePityGuarantees(64, false, "CHARACTER_EVENT");
      expect(result.value.wishesToNext5Star).toBe(26);
      expect(result.value.wishesToGuaranteedTarget).toBe(116); // 26 + 90
      expect(result.value.primogemsForNext5Star).toBe(4160);
      expect(result.value.primogemsForGuaranteedTarget).toBe(18560);
      expect(result.value.pullsToSoftPity).toBe(10); // 74 - 64
      expect(result.meta.verificationStatus).toBe("VERIFIED");
    });

    it("calculates guaranteed status threshold correctly", () => {
      const result = CalculationService.calculatePityGuarantees(64, true, "CHARACTER_EVENT");
      expect(result.value.wishesToNext5Star).toBe(26);
      expect(result.value.wishesToGuaranteedTarget).toBe(26); // only 1 5★ needed
      expect(result.value.primogemsForGuaranteedTarget).toBe(4160);
    });

    it("respects weapon banner 80 hard pity and 63 soft pity", () => {
      const result = CalculationService.calculatePityGuarantees(20, false, "WEAPON_EVENT");
      expect(result.value.hardPityThreshold).toBe(80);
      expect(result.value.softPityThreshold).toBe(63);
      expect(result.value.wishesToNext5Star).toBe(60);
      expect(result.value.pullsToSoftPity).toBe(43);
    });
  });

  describe("M3: Savings Forecast Modeling", () => {
    it("accurately models savings with Welkin Moon and commissions", () => {
      const result = CalculationService.calculateSavingsForecast({
        daysRemaining: 42,
        dailyCommissions: 60,
        welkinActive: true,
        battlePassActive: false,
        eventsPrimos: 2000,
        abyssPrimos: 1200,
        starglitterFates: 5,
      });

      // 42 * (60 + 90) = 6300
      // + 2000 + 1200 = 9500 primos = 59 wishes
      // + 5 fates = 64 wishes
      expect(result.value.dailyIncome).toBe(150);
      expect(result.value.projectedPrimos).toBe(9500);
      expect(result.value.totalProjectedWishes).toBe(64);
      expect(result.meta.verificationStatus).toBe("CORROBORATED");
    });
  });
});
