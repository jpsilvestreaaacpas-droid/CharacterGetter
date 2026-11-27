export interface CharacterStatBreakpoint {
  level: number;
  ascensionPhase: number;
  levelCap: number;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  ascensionBonusValue: number;
}

export interface AbilityScalingRule {
  abilityName: string;
  slot: "Normal" | "Skill" | "Burst" | "Passive";
  scalingAttribute: "ATK" | "Max HP" | "DEF" | "Elemental Mastery" | "Bond of Life";
  formula: string;
  conditions?: string;
  source: string;
}

export interface CharacterProgressionDefinition {
  characterId: string;
  ascensionStatType: string;
  baseCritRate: number; // 5.0%
  baseCritDmg: number; // 50.0%
  breakpoints: CharacterStatBreakpoint[];
  abilityScalings: AbilityScalingRule[];
  constellationTalentBoosts: {
    c3Target?: "Normal" | "Skill" | "Burst";
    c5Target?: "Normal" | "Skill" | "Burst";
  };
  source: string;
  verificationStatus: "VERIFIED" | "CORROBORATED" | "UNVERIFIED";
  gameVersion: string;
}

export const CHARACTER_PROGRESSION_CATALOG: Record<string, CharacterProgressionDefinition> = {
  arlecchino: {
    characterId: "arlecchino",
    ascensionStatType: "CRIT DMG",
    baseCritRate: 5.0,
    baseCritDmg: 50.0,
    breakpoints: [
      { level: 1, ascensionPhase: 0, levelCap: 20, baseHp: 1020, baseAtk: 27, baseDef: 60, ascensionBonusValue: 0 },
      { level: 20, ascensionPhase: 0, levelCap: 20, baseHp: 2646, baseAtk: 69, baseDef: 155, ascensionBonusValue: 0 },
      { level: 40, ascensionPhase: 1, levelCap: 40, baseHp: 5797, baseAtk: 151, baseDef: 339, ascensionBonusValue: 0 },
      { level: 50, ascensionPhase: 2, levelCap: 50, baseHp: 7495, baseAtk: 196, baseDef: 438, ascensionBonusValue: 9.6 },
      { level: 60, ascensionPhase: 3, levelCap: 60, baseHp: 9389, baseAtk: 245, baseDef: 549, ascensionBonusValue: 19.2 },
      { level: 70, ascensionPhase: 4, levelCap: 70, baseHp: 11297, baseAtk: 295, baseDef: 660, ascensionBonusValue: 19.2 },
      { level: 80, ascensionPhase: 5, levelCap: 80, baseHp: 13219, baseAtk: 345, baseDef: 773, ascensionBonusValue: 28.8 },
      { level: 90, ascensionPhase: 6, levelCap: 90, baseHp: 13103, baseAtk: 342, baseDef: 765, ascensionBonusValue: 38.4 },
    ],
    abilityScalings: [
      {
        abilityName: "Invitation to a Beheading (Masque of the Red Death)",
        slot: "Normal",
        scalingAttribute: "Bond of Life",
        formula: "Normal Attack DMG + (ATK * Bond of Life % * Masque Multiplier)",
        conditions: "Active when Bond of Life >= 30% of Max HP",
        source: "HoYoWiki / KQM Theorycrafting Library",
      },
      {
        abilityName: "All Is Ash",
        slot: "Skill",
        scalingAttribute: "ATK",
        formula: "Skill DMG * ATK",
        source: "HoYoWiki",
      },
    ],
    constellationTalentBoosts: { c3Target: "Normal", c5Target: "Burst" },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "4.6",
  },
  furina: {
    characterId: "furina",
    ascensionStatType: "CRIT Rate",
    baseCritRate: 5.0,
    baseCritDmg: 50.0,
    breakpoints: [
      { level: 1, ascensionPhase: 0, levelCap: 20, baseHp: 1192, baseAtk: 19, baseDef: 54, ascensionBonusValue: 0 },
      { level: 90, ascensionPhase: 6, levelCap: 90, baseHp: 15307, baseAtk: 244, baseDef: 696, ascensionBonusValue: 19.2 },
    ],
    abilityScalings: [
      {
        abilityName: "Salon Solitaire (Salon Members)",
        slot: "Skill",
        scalingAttribute: "Max HP",
        formula: "Max HP * Salon Member Multiplier * (1 + 0.1 * HP-draining allies)",
        conditions: "Ousia alignment; drains party HP above 50%",
        source: "HoYoWiki / KQM Theorycrafting Library",
      },
      {
        abilityName: "Let the People Rejoice",
        slot: "Burst",
        scalingAttribute: "Max HP",
        formula: "Max HP * Burst Multiplier + Fanfare DMG Bonus",
        source: "HoYoWiki",
      },
    ],
    constellationTalentBoosts: { c3Target: "Burst", c5Target: "Skill" },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "4.2",
  },
  zhongli: {
    characterId: "zhongli",
    ascensionStatType: "Geo DMG Bonus",
    baseCritRate: 5.0,
    baseCritDmg: 50.0,
    breakpoints: [
      { level: 1, ascensionPhase: 0, levelCap: 20, baseHp: 1144, baseAtk: 20, baseDef: 57, ascensionBonusValue: 0 },
      { level: 90, ascensionPhase: 6, levelCap: 90, baseHp: 14695, baseAtk: 251, baseDef: 738, ascensionBonusValue: 28.8 },
    ],
    abilityScalings: [
      {
        abilityName: "Dominus Lapidis (Jade Shield)",
        slot: "Skill",
        scalingAttribute: "Max HP",
        formula: "Base Shield + (Max HP * Shield Absorption %)",
        source: "HoYoWiki",
      },
      {
        abilityName: "Dominance of Earth",
        slot: "Passive",
        scalingAttribute: "Max HP",
        formula: "Normal/Charged/Plunge +1.39% Max HP; Stone Stele +1.9% Max HP; Planet Befall +33% Max HP",
        conditions: "Unlocked at Ascension Phase 4",
        source: "HoYoWiki / KQM Theorycrafting Library",
      },
    ],
    constellationTalentBoosts: { c3Target: "Skill", c5Target: "Burst" },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "1.1",
  },
};
