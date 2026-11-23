// Elemental resonance rules & synergy definitions
// Pure mechanical data — no copyrighted descriptive text

export type Element = "Pyro" | "Hydro" | "Anemo" | "Electro" | "Dendro" | "Cryo" | "Geo";

export interface ElementalResonance {
  id: string;
  name: string;
  elements: Element[];
  requiredCount: number; // how many of that element needed
  effect: string;
  color: string;
}

export const ELEMENTAL_RESONANCES: ElementalResonance[] = [
  { id: "fervent-flames", name: "Fervent Flames", elements: ["Pyro"], requiredCount: 2, effect: "+25% ATK. Incoming Cryo duration reduced by 40%.", color: "red" },
  { id: "soothing-water", name: "Soothing Water", elements: ["Hydro"], requiredCount: 2, effect: "+25% Max HP. Incoming Pyro duration reduced by 40%.", color: "blue" },
  { id: "impetuous-winds", name: "Impetuous Winds", elements: ["Anemo"], requiredCount: 2, effect: "Decreased Stamina Consumption. Movement SPD +10%. Skill CD reduced 5%.", color: "teal" },
  { id: "high-voltage", name: "High Voltage", elements: ["Electro"], requiredCount: 2, effect: "Superconduct, Overloaded, Electro-Charged, Quicken, Aggravate, Hyperbloom, and Electro Swirl have a 100% chance to generate an Electro Elemental Particle.", color: "purple" },
  { id: "sprawling-greenery", name: "Sprawling Greenery", elements: ["Dendro"], requiredCount: 2, effect: "+50 EM. Quicken, Aggravate, and Spread increase EM by 30 for 6s. Bloom, Hyperbloom, and Burgeon increase EM by 20 for 6s.", color: "green" },
  { id: "shattering-ice", name: "Shattering Ice", elements: ["Cryo"], requiredCount: 2, effect: "+15% CRIT Rate vs Frozen or Cryo-affected enemies. Incoming Electro duration reduced 40%.", color: "sky" },
  { id: "enduring-rock", name: "Enduring Rock", elements: ["Geo"], requiredCount: 2, effect: "Shields +15% strength. +15% DMG when protected by shield. Crystallize Shields +150% absorption.", color: "yellow" },
  { id: "protective-canopy", name: "Protective Canopy", elements: ["Pyro","Hydro","Anemo","Electro","Dendro","Cryo","Geo"], requiredCount: 1, effect: "All Elemental RES +15%. Physical RES +15%.", color: "gray" },
];

export function detectResonances(elements: Element[]): ElementalResonance[] {
  const counts: Partial<Record<Element, number>> = {};
  for (const el of elements) counts[el] = (counts[el] ?? 0) + 1;

  const active: ElementalResonance[] = [];

  // Check standard dual-element resonances
  for (const res of ELEMENTAL_RESONANCES.slice(0, 7)) {
    const el = res.elements[0];
    if ((counts[el] ?? 0) >= res.requiredCount) active.push(res);
  }

  // Protective Canopy — all 4 elements are different
  const unique = new Set(elements).size;
  if (unique >= 4 && active.length === 0) {
    const canopy = ELEMENTAL_RESONANCES.find((r) => r.id === "protective-canopy");
    if (canopy) active.push(canopy);
  }

  return active;
}

export interface TeamSlot {
  characterId: string;
  role: "Main DPS" | "Sub DPS" | "Support" | "Healer" | "Shielder" | "Flex";
}

export interface TeamComposition {
  id: string;
  name: string;
  description: string;
  slots: TeamSlot[];
  reactionFocus: string;
  difficulty: "Easy" | "Medium" | "Advanced";
}

export const PRESET_TEAMS: TeamComposition[] = [
  {
    id: "raiden-national",
    name: "Raiden National",
    description: "Classic premier team. Raiden drives Electro, Bennett buffs, Xiangling applies off-field Pyro, Xingqiu applies off-field Hydro for Vaporize.",
    slots: [
      { characterId: "raiden-shogun", role: "Main DPS" },
      { characterId: "xiangling", role: "Sub DPS" },
      { characterId: "xingqiu", role: "Sub DPS" },
      { characterId: "bennett", role: "Healer" },
    ],
    reactionFocus: "Overloaded + Vaporize",
    difficulty: "Medium",
  },
  {
    id: "furina-hyperbloom",
    name: "Furina Hyperbloom",
    description: "Nahida applies Dendro, Kuki triggers Hyperbloom, Furina buffs via HP drain + heal loop, Kazuha groups and VV shreds.",
    slots: [
      { characterId: "nahida", role: "Sub DPS" },
      { characterId: "furina", role: "Support" },
      { characterId: "kuki-shinobu", role: "Main DPS" },
      { characterId: "kaedehara-kazuha", role: "Support" },
    ],
    reactionFocus: "Hyperbloom",
    difficulty: "Medium",
  },
  {
    id: "neuv-vape",
    name: "Neuvillette Vaporize",
    description: "Neuvillette carries with charged attacks. Furina amplifies via HP mechanics. Zhongli shields. Kazuha groups and VV shreds.",
    slots: [
      { characterId: "neuvillette", role: "Main DPS" },
      { characterId: "furina", role: "Support" },
      { characterId: "zhongli", role: "Shielder" },
      { characterId: "kaedehara-kazuha", role: "Support" },
    ],
    reactionFocus: "Vaporize",
    difficulty: "Easy",
  },
  {
    id: "ayaka-freeze",
    name: "Ayaka Freeze",
    description: "Ayaka DPS, Xingqiu/Kokomi apply Hydro for Freeze, Kazuha groups and amplifies Cryo DMG.",
    slots: [
      { characterId: "kamisato-ayaka", role: "Main DPS" },
      { characterId: "xingqiu", role: "Sub DPS" },
      { characterId: "kaedehara-kazuha", role: "Support" },
      { characterId: "bennett", role: "Healer" },
    ],
    reactionFocus: "Freeze + Melt",
    difficulty: "Easy",
  },
];
