// Ascension cost tables — no copyrighted assets, only mechanical game data

export interface AscensionCost {
  phase: number; // 0→1 through 5→6
  levelCap: number; // new max level after ascension
  mora: number;
  gemSliver: number;
  gemFragment: number;
  gemChunk: number;
  gemGemstone: number;
  bossMaterial: number;
  localSpecialty: number;
  commonMaterial: number; // lowest tier count
}

// Standard 5-star character ascension costs
export const ASCENSION_COSTS_5STAR: AscensionCost[] = [
  { phase: 1, levelCap: 40, mora: 20000, gemSliver: 1, gemFragment: 0, gemChunk: 0, gemGemstone: 0, bossMaterial: 0, localSpecialty: 3, commonMaterial: 3 },
  { phase: 2, levelCap: 50, mora: 40000, gemSliver: 0, gemFragment: 3, gemChunk: 0, gemGemstone: 0, bossMaterial: 2, localSpecialty: 10, commonMaterial: 15 },
  { phase: 3, levelCap: 60, mora: 60000, gemSliver: 0, gemFragment: 6, gemChunk: 0, gemGemstone: 0, bossMaterial: 4, localSpecialty: 20, commonMaterial: 12 },
  { phase: 4, levelCap: 70, mora: 80000, gemSliver: 0, gemFragment: 0, gemChunk: 3, gemGemstone: 0, bossMaterial: 8, localSpecialty: 30, commonMaterial: 18 },
  { phase: 5, levelCap: 80, mora: 100000, gemSliver: 0, gemFragment: 0, gemChunk: 6, gemGemstone: 0, bossMaterial: 12, localSpecialty: 45, commonMaterial: 12 },
  { phase: 6, levelCap: 90, mora: 120000, gemSliver: 0, gemFragment: 0, gemChunk: 0, gemGemstone: 6, bossMaterial: 20, localSpecialty: 60, commonMaterial: 24 },
];

// Standard 4-star character ascension costs
export const ASCENSION_COSTS_4STAR: AscensionCost[] = [
  { phase: 1, levelCap: 40, mora: 12500, gemSliver: 1, gemFragment: 0, gemChunk: 0, gemGemstone: 0, bossMaterial: 0, localSpecialty: 3, commonMaterial: 3 },
  { phase: 2, levelCap: 50, mora: 25000, gemSliver: 0, gemFragment: 3, gemChunk: 0, gemGemstone: 0, bossMaterial: 2, localSpecialty: 10, commonMaterial: 15 },
  { phase: 3, levelCap: 60, mora: 37500, gemSliver: 0, gemFragment: 6, gemChunk: 0, gemGemstone: 0, bossMaterial: 4, localSpecialty: 20, commonMaterial: 12 },
  { phase: 4, levelCap: 70, mora: 50000, gemSliver: 0, gemFragment: 0, gemChunk: 3, gemGemstone: 0, bossMaterial: 8, localSpecialty: 30, commonMaterial: 18 },
  { phase: 5, levelCap: 80, mora: 62500, gemSliver: 0, gemFragment: 0, gemChunk: 6, gemGemstone: 0, bossMaterial: 12, localSpecialty: 45, commonMaterial: 12 },
  { phase: 6, levelCap: 90, mora: 75000, gemSliver: 0, gemFragment: 0, gemChunk: 0, gemGemstone: 6, bossMaterial: 20, localSpecialty: 60, commonMaterial: 24 },
];

export interface TalentCost {
  level: number; // 1→2 through 9→10
  mora: number;
  teachingBooks: number;
  guideBooks: number;
  philosophyBooks: number;
  commonMaterialLow: number;
  commonMaterialMid: number;
  commonMaterialHigh: number;
  weeklyBossDrop: number; // only levels 7+
  crownOfInsight: number; // only level 9→10
}

export const TALENT_COSTS: TalentCost[] = [
  { level: 2, mora: 12500, teachingBooks: 3, guideBooks: 0, philosophyBooks: 0, commonMaterialLow: 6, commonMaterialMid: 0, commonMaterialHigh: 0, weeklyBossDrop: 0, crownOfInsight: 0 },
  { level: 3, mora: 17500, teachingBooks: 0, guideBooks: 2, philosophyBooks: 0, commonMaterialLow: 0, commonMaterialMid: 3, commonMaterialHigh: 0, weeklyBossDrop: 0, crownOfInsight: 0 },
  { level: 4, mora: 25000, teachingBooks: 0, guideBooks: 4, philosophyBooks: 0, commonMaterialLow: 0, commonMaterialMid: 4, commonMaterialHigh: 0, weeklyBossDrop: 0, crownOfInsight: 0 },
  { level: 5, mora: 30000, teachingBooks: 0, guideBooks: 6, philosophyBooks: 0, commonMaterialLow: 0, commonMaterialMid: 6, commonMaterialHigh: 0, weeklyBossDrop: 0, crownOfInsight: 0 },
  { level: 6, mora: 37500, teachingBooks: 0, guideBooks: 9, philosophyBooks: 0, commonMaterialLow: 0, commonMaterialMid: 9, commonMaterialHigh: 0, weeklyBossDrop: 0, crownOfInsight: 0 },
  { level: 7, mora: 120000, teachingBooks: 0, guideBooks: 0, philosophyBooks: 4, commonMaterialLow: 0, commonMaterialMid: 0, commonMaterialHigh: 4, weeklyBossDrop: 1, crownOfInsight: 0 },
  { level: 8, mora: 260000, teachingBooks: 0, guideBooks: 0, philosophyBooks: 6, commonMaterialLow: 0, commonMaterialMid: 0, commonMaterialHigh: 6, weeklyBossDrop: 1, crownOfInsight: 0 },
  { level: 9, mora: 450000, teachingBooks: 0, guideBooks: 0, philosophyBooks: 12, commonMaterialLow: 0, commonMaterialMid: 0, commonMaterialHigh: 9, weeklyBossDrop: 2, crownOfInsight: 0 },
  { level: 10, mora: 700000, teachingBooks: 0, guideBooks: 0, philosophyBooks: 16, commonMaterialLow: 0, commonMaterialMid: 0, commonMaterialHigh: 12, weeklyBossDrop: 2, crownOfInsight: 1 },
];

/**
 * Returns cumulative ascension cost from current phase to target phase.
 */
export function calcAscensionCost(
  currentPhase: number,
  targetPhase: number,
  rarity: 4 | 5
): { mora: number; phasesNeeded: number } {
  const table = rarity === 5 ? ASCENSION_COSTS_5STAR : ASCENSION_COSTS_4STAR;
  let mora = 0;
  for (let p = currentPhase + 1; p <= targetPhase; p++) {
    const row = table.find((r) => r.phase === p);
    if (row) mora += row.mora;
  }
  return { mora, phasesNeeded: Math.max(0, targetPhase - currentPhase) };
}

/**
 * Returns cumulative talent upgrade cost from current level to target level.
 */
export function calcTalentCost(
  currentLevel: number,
  targetLevel: number
): { mora: number; philosophyBooks: number; guideBooks: number; weeklyDrops: number; crowns: number } {
  let mora = 0, philosophyBooks = 0, guideBooks = 0, weeklyDrops = 0, crowns = 0;
  for (let lv = currentLevel + 1; lv <= targetLevel; lv++) {
    const row = TALENT_COSTS.find((r) => r.level === lv);
    if (row) {
      mora += row.mora;
      philosophyBooks += row.philosophyBooks;
      guideBooks += row.guideBooks;
      weeklyDrops += row.weeklyBossDrop;
      crowns += row.crownOfInsight;
    }
  }
  return { mora, philosophyBooks, guideBooks, weeklyDrops, crowns };
}

// Day-of-week domain schedule (0=Sun, 1=Mon… 6=Sat)
export const DOMAIN_SCHEDULE: Record<number, { name: string; books: string[] }[]> = {
  0: [{ name: "All Domains Open", books: ["All books available Sunday"] }],
  1: [{ name: "Forsaken Rift", books: ["Freedom", "Remembrance"] }, { name: "Taishan Mansion", books: ["Prosperity", "Diligence"] }, { name: "Violet Court", books: ["Transience", "Elegance"] }],
  2: [{ name: "Forsaken Rift", books: ["Resistance", "Praxis"] }, { name: "Taishan Mansion", books: ["Gold", "Ingenuity"] }, { name: "Violet Court", books: ["Light", "Teachings of Light"] }],
  3: [{ name: "Forsaken Rift", books: ["Ballad", "Equity"] }, { name: "Taishan Mansion", books: ["Diligence", "Prosperity"] }, { name: "Violet Court", books: ["Elegance", "Transience"] }],
  4: [{ name: "Forsaken Rift", books: ["Freedom", "Remembrance"] }, { name: "Taishan Mansion", books: ["Prosperity", "Diligence"] }, { name: "Violet Court", books: ["Transience", "Elegance"] }],
  5: [{ name: "Forsaken Rift", books: ["Resistance", "Praxis"] }, { name: "Taishan Mansion", books: ["Gold", "Ingenuity"] }, { name: "Violet Court", books: ["Light"] }],
  6: [{ name: "Forsaken Rift", books: ["Ballad", "Equity"] }, { name: "Taishan Mansion", books: ["Diligence", "Prosperity"] }, { name: "Violet Court", books: ["Elegance", "Transience"] }],
};

export function getTodayDomains(): { name: string; books: string[] }[] {
  const day = new Date().getDay();
  return DOMAIN_SCHEDULE[day] ?? [];
}
