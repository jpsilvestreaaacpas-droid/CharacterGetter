import { describe, it, expect } from "vitest";
import { analyzePlayerBuildAgainstPlaystyle, PlayerCharacterState } from "./analyzer";
import { CANONICAL_PLAYSTYLES } from "../data/playstyles";

const furinaPlaystyle = CANONICAL_PLAYSTYLES.find((p) => p.id === "furina-subdps")!;

describe("analyzePlayerBuildAgainstPlaystyle", () => {
  it("rewards optimal build with high suitability score", () => {
    const optimalFurina: PlayerCharacterState = {
      characterId: "furina",
      level: 90,
      constellation: 2,
      talentNormal: 6,
      talentSkill: 10,
      talentBurst: 10,
      equippedWeaponName: "Splendor of Tranquil Waters",
      equippedArtifactSet1: "Golden Troupe",
    };

    const ownedRoster = ["furina", "neuvillette", "kaedehara-kazuha", "zhongli"];
    const report = analyzePlayerBuildAgainstPlaystyle(optimalFurina, furinaPlaystyle, ownedRoster);

    expect(report.overallSuitabilityScore).toBeGreaterThanOrEqual(95);
    expect(report.weaponAssessment.isOptimal).toBe(true);
    expect(report.artifactAssessment.setMatch).toBe("Perfect 4pc");
    expect(report.teamCompatibility.compatiblePresetTeams[0].isFullTeamOwned).toBe(true);
  });

  it("identifies suboptimal weapon and missing artifacts", () => {
    const unbuiltFurina: PlayerCharacterState = {
      characterId: "furina",
      level: 70,
      constellation: 0,
      talentNormal: 1,
      talentSkill: 4,
      talentBurst: 4,
      equippedWeaponName: "Dull Blade", // unsuitable weapon
    };

    const report = analyzePlayerBuildAgainstPlaystyle(unbuiltFurina, furinaPlaystyle, []);

    expect(report.overallSuitabilityScore).toBeLessThan(70);
    expect(report.weaponAssessment.isOptimal).toBe(false);
    expect(report.artifactAssessment.setMatch).toBe("Not Set");
    expect(report.upgradeChecklist.length).toBeGreaterThan(0);
  });

  it("calculates active constellation benefits accurately", () => {
    const c2Furina: PlayerCharacterState = {
      characterId: "furina",
      level: 90,
      constellation: 2,
      talentNormal: 6,
      talentSkill: 9,
      talentBurst: 9,
    };

    const report = analyzePlayerBuildAgainstPlaystyle(c2Furina, furinaPlaystyle, []);
    expect(report.constellationImpact.activeBuffs.length).toBe(2);
    expect(report.constellationImpact.nextPowerSpike).toContain("C6");
  });
});
