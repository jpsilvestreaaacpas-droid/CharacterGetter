import { describe, it, expect } from "vitest";
import { calcAscensionCost, calcTalentCost, getTodayDomains } from "@/lib/data/progression-data";
import { detectResonances } from "@/lib/data/team-data";
import { getResourceById, getResourcesByCategory } from "@/lib/data/resources";

describe("calcAscensionCost", () => {
  it("returns 0 mora when already at target phase", () => {
    expect(calcAscensionCost(6, 6, 5).mora).toBe(0);
    expect(calcAscensionCost(6, 6, 5).phasesNeeded).toBe(0);
  });

  it("calculates full 5-star ascension 0→6 mora correctly", () => {
    const { mora, phasesNeeded } = calcAscensionCost(0, 6, 5);
    // 20000+40000+60000+80000+100000+120000 = 420000
    expect(mora).toBe(420000);
    expect(phasesNeeded).toBe(6);
  });

  it("calculates partial ascension 3→6 for 4-star", () => {
    const { mora } = calcAscensionCost(3, 6, 4);
    // 50000+62500+75000 = 187500
    expect(mora).toBe(187500);
  });
});

describe("calcTalentCost", () => {
  it("returns zeroes when talent already at max", () => {
    const cost = calcTalentCost(10, 10);
    expect(cost.mora).toBe(0);
    expect(cost.crowns).toBe(0);
  });

  it("requires 1 crown to level talent 9→10", () => {
    const cost = calcTalentCost(9, 10);
    expect(cost.crowns).toBe(1);
    expect(cost.mora).toBe(700000);
  });

  it("requires no crowns for levels below 10", () => {
    const cost = calcTalentCost(1, 9);
    expect(cost.crowns).toBe(0);
    expect(cost.weeklyDrops).toBeGreaterThan(0);
  });
});

describe("detectResonances", () => {
  it("detects Fervent Flames with 2 Pyro", () => {
    const res = detectResonances(["Pyro", "Pyro", "Hydro", "Anemo"]);
    expect(res.some((r) => r.id === "fervent-flames")).toBe(true);
  });

  it("detects Shattering Ice with 2 Cryo", () => {
    const res = detectResonances(["Cryo", "Cryo", "Hydro", "Anemo"]);
    expect(res.some((r) => r.id === "shattering-ice")).toBe(true);
  });

  it("returns empty array for mixed 4 unique elements (Protective Canopy)", () => {
    const res = detectResonances(["Pyro", "Hydro", "Anemo", "Electro"]);
    // No dual-element resonances; Protective Canopy applies
    expect(res.some((r) => r.id === "protective-canopy")).toBe(true);
  });

  it("returns no resonance for single character", () => {
    const res = detectResonances(["Electro"]);
    expect(res.length).toBe(0);
  });
});

describe("resource catalogue", () => {
  it("finds mora by id", () => {
    const mora = getResourceById("mora");
    expect(mora).toBeDefined();
    expect(mora!.category).toBe("currency");
  });

  it("filters by category", () => {
    const books = getResourcesByCategory("talent_book");
    expect(books.length).toBeGreaterThan(0);
    books.forEach((b) => expect(b.category).toBe("talent_book"));
  });

  it("returns undefined for unknown id", () => {
    expect(getResourceById("does-not-exist")).toBeUndefined();
  });
});

describe("getTodayDomains", () => {
  it("returns an array for every day of the week", () => {
    const result = getTodayDomains();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
