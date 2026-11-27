import { describe, it, expect } from "vitest";
import { CHARACTER_PROGRESSION_CATALOG } from "@/lib/data/character-progression-catalog";
import { WEAPON_CATALOG } from "@/lib/data/weapon-catalog";
import { ProgressionCalculatorService } from "@/lib/services/ProgressionCalculatorService";
import { WeaponCompatibilityService } from "@/lib/services/WeaponCompatibilityService";
import { MaterialRequirementService } from "@/lib/services/MaterialRequirementService";

describe("Character Progression & Weapon System", () => {
  it("validates exact Lv.90 ascension stat bonuses for Arlecchino, Furina, and Zhongli", () => {
    const arle90 = CHARACTER_PROGRESSION_CATALOG.arlecchino.breakpoints.find((b) => b.level === 90);
    const furina90 = CHARACTER_PROGRESSION_CATALOG.furina.breakpoints.find((b) => b.level === 90);
    const zhongli90 = CHARACTER_PROGRESSION_CATALOG.zhongli.breakpoints.find((b) => b.level === 90);

    expect(CHARACTER_PROGRESSION_CATALOG.arlecchino.ascensionStatType).toBe("CRIT DMG");
    expect(arle90?.ascensionBonusValue).toBe(38.4);

    expect(CHARACTER_PROGRESSION_CATALOG.furina.ascensionStatType).toBe("CRIT Rate");
    expect(furina90?.ascensionBonusValue).toBe(19.2);

    expect(CHARACTER_PROGRESSION_CATALOG.zhongli.ascensionStatType).toBe("Geo DMG Bonus");
    expect(zhongli90?.ascensionBonusValue).toBe(28.8);
  });

  it("separates base talent levels from constellation-adjusted effective levels", () => {
    const c2 = ProgressionCalculatorService.getEffectiveTalentLevels(
      "arlecchino",
      { normal: 8, skill: 8, burst: 8 },
      2
    );
    expect(c2.baseNormal).toBe(8);
    expect(c2.effectiveNormal).toBe(8);

    const c3 = ProgressionCalculatorService.getEffectiveTalentLevels(
      "arlecchino",
      { normal: 8, skill: 8, burst: 8 },
      3
    );
    expect(c3.baseNormal).toBe(8);
    expect(c3.effectiveNormal).toBe(11);
    expect(c3.effectiveBurst).toBe(8);
  });

  it("calculates progression delta strictly from current to target (never from Lv.1)", () => {
    const fromZero = ProgressionCalculatorService.calculateProgressionDelta({
      currentAscension: 0,
      targetAscension: 6,
      currentTalents: [1, 1, 1],
      targetTalents: [10, 10, 10],
    });

    const fromMid = ProgressionCalculatorService.calculateProgressionDelta({
      currentAscension: 4,
      targetAscension: 6,
      currentTalents: [8, 8, 8],
      targetTalents: [10, 10, 10],
    });

    expect(fromMid.moraRequired).toBeLessThan(fromZero.moraRequired);
    expect(fromMid.ascensionPhasesNeeded).toEqual([5, 6]);
    expect(fromMid.crownsRequired).toBe(3);
  });

  it("checks weapon compatibility across all 5 weapon types", () => {
    const types = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"] as const;
    for (const t of types) {
      const w = WEAPON_CATALOG.find((item) => item.weaponType === t);
      expect(w).toBeDefined();
      expect(WeaponCompatibilityService.isCompatible(t, w!.weaponType)).toBe(true);
      expect(WeaponCompatibilityService.isCompatible(t === "Sword" ? "Bow" : "Sword", w!.weaponType)).toBe(false);
    }
  });

  it("computes remaining materials using centralized inventory", () => {
    const result = MaterialRequirementService.computeRemaining(
      [
        { itemId: "mora", quantity: 1000000 },
        { itemId: "crown-of-insight", quantity: 3 },
      ],
      [
        { itemId: "mora", name: "Mora", category: "currency", quantity: 400000, targetQuantity: 0, updatedAt: "" },
        { itemId: "crown-of-insight", name: "Crown", category: "talent_boss", quantity: 5, targetQuantity: 0, updatedAt: "" },
      ]
    );

    expect(result[0].remainingQuantity).toBe(600000);
    expect(result[1].remainingQuantity).toBe(0);
  });
});
