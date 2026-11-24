import { describe, it, expect } from "vitest";
import {
  calculateSavingsProjection,
  summarizeWishHistory,
  DEMO_WISH_HISTORY,
} from "@/lib/radar/pull-history-data";

describe("M3 Pull Planner Logic", () => {
  it("calculates savings projections correctly with Welkin", () => {
    const res = calculateSavingsProjection({
      daysRemaining: 30,
      dailyCommissionsPrimos: 60,
      welkinActive: true,
      battlePassActive: false,
      eventsEstimatedPrimos: 1000,
      abyssEstimatedPrimos: 600,
      starglitterFates: 5,
    });

    // 30 days * (60 + 90) = 4500
    // + 1000 + 600 = 6100 primos = 38 wishes
    // + 5 fates = 43 wishes
    expect(res.projectedPrimos).toBe(6100);
    expect(res.totalProjectedWishes).toBe(38 + 5);
    expect(res.dailyRate).toBe(150);
  });

  it("summarizes wish history metrics correctly", () => {
    const summary = summarizeWishHistory(DEMO_WISH_HISTORY);
    expect(summary.total5Stars).toBe(5);
    expect(summary.avgPity).toBeGreaterThan(60);
    expect(summary.winRate).toBeGreaterThanOrEqual(0);
  });
});
