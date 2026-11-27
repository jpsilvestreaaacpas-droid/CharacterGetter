export type WeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";

export interface WeaponLevelBreakpoint {
  level: number;
  ascensionPhase: number;
  baseAtk: number;
  secondaryStatValue: number;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  weaponType: WeaponType;
  rarity: 3 | 4 | 5;
  secondaryStatType: string;
  passiveName: string;
  passiveDescription: string;
  refinementValues: Record<number, string>; // 1..5
  breakpoints: WeaponLevelBreakpoint[];
  ascensionMaterials: Record<number, { itemId: string; quantity: number }[]>; // phase 1..6
  source: string;
  verificationStatus: "VERIFIED" | "CORROBORATED" | "UNVERIFIED";
  gameVersion: string;
  updatedAt: string;
}

export const WEAPON_CATALOG: WeaponDefinition[] = [
  {
    id: "crimson-moons-semblance",
    name: "Crimson Moon's Semblance",
    weaponType: "Polearm",
    rarity: 5,
    secondaryStatType: "CRIT Rate",
    passiveName: "Ashen Sun's Shadow",
    passiveDescription:
      "Grants a Bond of Life equal to 25% of Max HP when a Charged Attack hits an opponent. Increases DMG dealt by 12%–28% when the equipping character has a Bond of Life.",
    refinementValues: {
      1: "12% DMG (24% at >=30% Max HP Bond of Life)",
      2: "16% DMG (32% at >=30% Max HP Bond of Life)",
      3: "20% DMG (40% at >=30% Max HP Bond of Life)",
      4: "24% DMG (48% at >=30% Max HP Bond of Life)",
      5: "28% DMG (56% at >=30% Max HP Bond of Life)",
    },
    breakpoints: [
      { level: 1, ascensionPhase: 0, baseAtk: 48, secondaryStatValue: 4.8 },
      { level: 20, ascensionPhase: 0, baseAtk: 133, secondaryStatValue: 8.5 },
      { level: 40, ascensionPhase: 1, baseAtk: 261, secondaryStatValue: 12.4 },
      { level: 50, ascensionPhase: 2, baseAtk: 341, secondaryStatValue: 14.3 },
      { level: 60, ascensionPhase: 3, baseAtk: 423, secondaryStatValue: 16.2 },
      { level: 70, ascensionPhase: 4, baseAtk: 506, secondaryStatValue: 18.2 },
      { level: 80, ascensionPhase: 5, baseAtk: 590, secondaryStatValue: 20.1 },
      { level: 90, ascensionPhase: 6, baseAtk: 674, secondaryStatValue: 22.1 },
    ],
    ascensionMaterials: {
      1: [{ itemId: "mora", quantity: 10000 }],
      2: [{ itemId: "mora", quantity: 20000 }],
      3: [{ itemId: "mora", quantity: 30000 }],
      4: [{ itemId: "mora", quantity: 45000 }],
      5: [{ itemId: "mora", quantity: 55000 }],
      6: [{ itemId: "mora", quantity: 65000 }],
    },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "4.6",
    updatedAt: "2026-11-25T00:00:00Z",
  },
  {
    id: "splendor-of-tranquil-waters",
    name: "Splendor of Tranquil Waters",
    weaponType: "Sword",
    rarity: 5,
    secondaryStatType: "CRIT DMG",
    passiveName: "Dawn and Dusk by the Lake",
    passiveDescription:
      "When the equipping character's current HP increases or decreases, Elemental Skill DMG dealt will be increased by 8%–16% for 6s (max 3 stacks).",
    refinementValues: {
      1: "8% Skill DMG per stack, 14% Max HP",
      2: "10% Skill DMG per stack, 17.5% Max HP",
      3: "12% Skill DMG per stack, 21% Max HP",
      4: "14% Skill DMG per stack, 24.5% Max HP",
      5: "16% Skill DMG per stack, 28% Max HP",
    },
    breakpoints: [
      { level: 1, ascensionPhase: 0, baseAtk: 44, secondaryStatValue: 19.2 },
      { level: 90, ascensionPhase: 6, baseAtk: 542, secondaryStatValue: 88.2 },
    ],
    ascensionMaterials: {
      1: [{ itemId: "mora", quantity: 10000 }],
      6: [{ itemId: "mora", quantity: 65000 }],
    },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "4.2",
    updatedAt: "2026-11-25T00:00:00Z",
  },
  {
    id: "favonius-lance",
    name: "Favonius Lance",
    weaponType: "Polearm",
    rarity: 4,
    secondaryStatType: "Energy Recharge",
    passiveName: "Windfall",
    passiveDescription:
      "CRIT Hits have a 60%–100% chance to generate a small amount of Elemental Particles, which will regenerate 6 Energy for the character.",
    refinementValues: {
      1: "60% chance, 12s CD",
      2: "70% chance, 10.5s CD",
      3: "80% chance, 9s CD",
      4: "90% chance, 7.5s CD",
      5: "100% chance, 6s CD",
    },
    breakpoints: [
      { level: 1, ascensionPhase: 0, baseAtk: 44, secondaryStatValue: 6.7 },
      { level: 90, ascensionPhase: 6, baseAtk: 565, secondaryStatValue: 30.6 },
    ],
    ascensionMaterials: {
      1: [{ itemId: "mora", quantity: 5000 }],
      6: [{ itemId: "mora", quantity: 45000 }],
    },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "1.0",
    updatedAt: "2026-11-25T00:00:00Z",
  },
  {
    id: "wolf-gravestone",
    name: "Wolf's Gravestone",
    weaponType: "Claymore",
    rarity: 5,
    secondaryStatType: "ATK%",
    passiveName: "Wolfish Tracker",
    passiveDescription: "Increases ATK by 20%–40%. On hit against opponents with less than 30% HP, increases all party members' ATK by 40%–80%.",
    refinementValues: {
      1: "20% ATK / 40% Party ATK",
      2: "25% ATK / 50% Party ATK",
      3: "30% ATK / 60% Party ATK",
      4: "35% ATK / 70% Party ATK",
      5: "40% ATK / 80% Party ATK",
    },
    breakpoints: [
      { level: 1, ascensionPhase: 0, baseAtk: 46, secondaryStatValue: 10.8 },
      { level: 90, ascensionPhase: 6, baseAtk: 608, secondaryStatValue: 49.6 },
    ],
    ascensionMaterials: {
      1: [{ itemId: "mora", quantity: 10000 }],
      6: [{ itemId: "mora", quantity: 65000 }],
    },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "1.0",
    updatedAt: "2026-11-25T00:00:00Z",
  },
  {
    id: "aqua-simulacra",
    name: "Aqua Simulacra",
    weaponType: "Bow",
    rarity: 5,
    secondaryStatType: "CRIT DMG",
    passiveName: "The Cleansing Form",
    passiveDescription: "HP is increased by 16%–32%. When there are opponents nearby, DMG dealt by the wielder is increased by 20%–40%.",
    refinementValues: {
      1: "16% HP, 20% DMG",
      2: "20% HP, 25% DMG",
      3: "24% HP, 30% DMG",
      4: "28% HP, 35% DMG",
      5: "32% HP, 40% DMG",
    },
    breakpoints: [
      { level: 1, ascensionPhase: 0, baseAtk: 44, secondaryStatValue: 19.2 },
      { level: 90, ascensionPhase: 6, baseAtk: 542, secondaryStatValue: 88.2 },
    ],
    ascensionMaterials: {
      1: [{ itemId: "mora", quantity: 10000 }],
      6: [{ itemId: "mora", quantity: 65000 }],
    },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "2.7",
    updatedAt: "2026-11-25T00:00:00Z",
  },
  {
    id: "thrilling-tales-of-dragon-slayers",
    name: "Thrilling Tales of Dragon Slayers",
    weaponType: "Catalyst",
    rarity: 3,
    secondaryStatType: "HP%",
    passiveName: "Heritage",
    passiveDescription: "When switching characters, the new character taking the field has their ATK increased by 24%–48% for 10s.",
    refinementValues: {
      1: "24% ATK",
      2: "30% ATK",
      3: "36% ATK",
      4: "42% ATK",
      5: "48% ATK",
    },
    breakpoints: [
      { level: 1, ascensionPhase: 0, baseAtk: 39, secondaryStatValue: 7.7 },
      { level: 90, ascensionPhase: 6, baseAtk: 401, secondaryStatValue: 35.2 },
    ],
    ascensionMaterials: {
      1: [{ itemId: "mora", quantity: 5000 }],
      6: [{ itemId: "mora", quantity: 30000 }],
    },
    source: "HoYoWiki / Genshin Impact Official",
    verificationStatus: "VERIFIED",
    gameVersion: "1.0",
    updatedAt: "2026-11-25T00:00:00Z",
  },
];
