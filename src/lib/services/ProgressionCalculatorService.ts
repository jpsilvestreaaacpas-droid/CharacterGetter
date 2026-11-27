import { CHARACTER_PROGRESSION_CATALOG } from "@/lib/data/character-progression-catalog";

const ASCENSION_PHASES = [
  { phase: 1, moraCost: 20000, expBooksNeeded: 6 },
  { phase: 2, moraCost: 40000, expBooksNeeded: 29 },
  { phase: 3, moraCost: 60000, expBooksNeeded: 29 },
  { phase: 4, moraCost: 80000, expBooksNeeded: 43 },
  { phase: 5, moraCost: 100000, expBooksNeeded: 60 },
  { phase: 6, moraCost: 120000, expBooksNeeded: 171 },
];

const TALENT_UPGRADE_COSTS = [
  { toLevel: 2, moraCost: 12500, crownRequired: false },
  { toLevel: 3, moraCost: 17500, crownRequired: false },
  { toLevel: 4, moraCost: 25000, crownRequired: false },
  { toLevel: 5, moraCost: 30000, crownRequired: false },
  { toLevel: 6, moraCost: 37500, crownRequired: false },
  { toLevel: 7, moraCost: 120000, crownRequired: false },
  { toLevel: 8, moraCost: 260000, crownRequired: false },
  { toLevel: 9, moraCost: 450000, crownRequired: false },
  { toLevel: 10, moraCost: 700000, crownRequired: true },
];

export interface EffectiveTalentLevels {
  baseNormal: number;
  baseSkill: number;
  baseBurst: number;
  effectiveNormal: number;
  effectiveSkill: number;
  effectiveBurst: number;
}

export interface ProgressionDeltaResult {
  moraRequired: number;
  expRequired: number;
  herosWitEquivalent: number;
  crownsRequired: number;
  ascensionPhasesNeeded: number[];
  talentUpgradesCount: number;
}

export class ProgressionCalculatorService {
  /**
   * Separates base talent levels from constellation-adjusted effective levels (+3 at C3/C5).
   * Never mutates the base talent level.
   */
  static getEffectiveTalentLevels(
    characterId: string,
    base: { normal: number; skill: number; burst: number },
    constellation: number
  ): EffectiveTalentLevels {
    const def = CHARACTER_PROGRESSION_CATALOG[characterId.toLowerCase()];
    let normalBoost = 0;
    let skillBoost = 0;
    let burstBoost = 0;

    if (def) {
      if (constellation >= 3 && def.constellationTalentBoosts.c3Target) {
        if (def.constellationTalentBoosts.c3Target === "Normal") normalBoost += 3;
        if (def.constellationTalentBoosts.c3Target === "Skill") skillBoost += 3;
        if (def.constellationTalentBoosts.c3Target === "Burst") burstBoost += 3;
      }
      if (constellation >= 5 && def.constellationTalentBoosts.c5Target) {
        if (def.constellationTalentBoosts.c5Target === "Normal") normalBoost += 3;
        if (def.constellationTalentBoosts.c5Target === "Skill") skillBoost += 3;
        if (def.constellationTalentBoosts.c5Target === "Burst") burstBoost += 3;
      }
    }

    return {
      baseNormal: base.normal,
      baseSkill: base.skill,
      baseBurst: base.burst,
      effectiveNormal: base.normal + normalBoost,
      effectiveSkill: base.skill + skillBoost,
      effectiveBurst: base.burst + burstBoost,
    };
  }

  /**
   * Calculates exact remaining requirements from current -> target progression.
   * Never calculates from Lv.1 when partial progression already exists.
   */
  static calculateProgressionDelta(input: {
    currentAscension: number;
    targetAscension: number;
    currentTalents: [number, number, number];
    targetTalents: [number, number, number];
  }): ProgressionDeltaResult {
    let moraRequired = 0;
    let expRequired = 0;
    let crownsRequired = 0;
    const ascensionPhasesNeeded: number[] = [];
    let talentUpgradesCount = 0;

    // 1. Ascension phases strictly between currentAscension and targetAscension
    const startPhase = Math.max(0, Math.min(6, input.currentAscension));
    const endPhase = Math.max(startPhase, Math.min(6, input.targetAscension));

    for (const phase of ASCENSION_PHASES) {
      if (phase.phase > startPhase && phase.phase <= endPhase) {
        ascensionPhasesNeeded.push(phase.phase);
        moraRequired += phase.moraCost;
        expRequired += phase.expBooksNeeded * 20000;
      }
    }

    // 2. Talent upgrades strictly between current and target for each talent
    for (let i = 0; i < 3; i++) {
      const cur = Math.max(1, Math.min(10, input.currentTalents[i]));
      const tgt = Math.max(cur, Math.min(10, input.targetTalents[i]));
      for (let lvl = cur + 1; lvl <= tgt; lvl++) {
        const cost = TALENT_UPGRADE_COSTS.find((c) => c.toLevel === lvl);
        if (cost) {
          moraRequired += cost.moraCost;
          crownsRequired += cost.crownRequired ? 1 : 0;
          talentUpgradesCount += 1;
        }
      }
    }

    return {
      moraRequired,
      expRequired,
      herosWitEquivalent: Math.ceil(expRequired / 20000),
      crownsRequired,
      ascensionPhasesNeeded,
      talentUpgradesCount,
    };
  }
}
