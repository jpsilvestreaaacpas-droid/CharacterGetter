// Canonical resource catalogue — game reference data only, no player quantities here

export type ResourceCategory =
  | "currency"
  | "exp"
  | "ascension_gem"
  | "boss_material"
  | "talent_book"
  | "talent_boss"
  | "local_specialty"
  | "common_material"
  | "weapon_material";

export interface ResourceDefinition {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class
}

export const RESOURCE_CATALOGUE: ResourceDefinition[] = [
  // ── Currency ─────────────────────────────────────────────────────────
  { id: "mora", name: "Mora", category: "currency", description: "Primary in-game currency used for virtually all upgrades.", icon: "Coins", color: "amber" },
  { id: "primogems", name: "Primogems", category: "currency", description: "Premium currency used to obtain Intertwined Fates.", icon: "Gem", color: "blue" },
  { id: "intertwined-fate", name: "Intertwined Fate", category: "currency", description: "Used on Character and Weapon Event Wishes.", icon: "Sparkles", color: "purple" },

  // ── EXP Books ────────────────────────────────────────────────────────
  { id: "heros-wit", name: "Hero's Wit", category: "exp", description: "Provides 20,000 Character EXP.", icon: "BookOpen", color: "orange" },
  { id: "adventurers-experience", name: "Adventurer's Experience", category: "exp", description: "Provides 5,000 Character EXP.", icon: "BookOpen", color: "blue" },
  { id: "wanderers-advice", name: "Wanderer's Advice", category: "exp", description: "Provides 1,000 Character EXP.", icon: "BookOpen", color: "teal" },

  // ── Ascension Gems ───────────────────────────────────────────────────
  { id: "agnidus-agate-chunk", name: "Agnidus Agate Chunk", category: "ascension_gem", description: "Pyro ascension gem (Chunk tier).", icon: "Gem", color: "red" },
  { id: "varunada-lazurite-chunk", name: "Varunada Lazurite Chunk", category: "ascension_gem", description: "Hydro ascension gem (Chunk tier).", icon: "Gem", color: "blue" },
  { id: "vayuda-turquoise-chunk", name: "Vayuda Turquoise Chunk", category: "ascension_gem", description: "Anemo ascension gem (Chunk tier).", icon: "Gem", color: "teal" },
  { id: "vajrada-amethyst-chunk", name: "Vajrada Amethyst Chunk", category: "ascension_gem", description: "Electro ascension gem (Chunk tier).", icon: "Gem", color: "purple" },
  { id: "nagadus-emerald-chunk", name: "Nagadus Emerald Chunk", category: "ascension_gem", description: "Dendro ascension gem (Chunk tier).", icon: "Gem", color: "green" },
  { id: "shivada-jade-chunk", name: "Shivada Jade Chunk", category: "ascension_gem", description: "Cryo ascension gem (Chunk tier).", icon: "Gem", color: "sky" },
  { id: "prithiva-topaz-chunk", name: "Prithiva Topaz Chunk", category: "ascension_gem", description: "Geo ascension gem (Chunk tier).", icon: "Gem", color: "yellow" },

  // ── Talent Books ─────────────────────────────────────────────────────
  { id: "teachings-of-freedom", name: "Teachings of Freedom", category: "talent_book", description: "Mon/Thu talent book — Freedom series.", icon: "BookOpen", color: "teal" },
  { id: "guide-to-freedom", name: "Guide to Freedom", category: "talent_book", description: "Mon/Thu talent book — Freedom series (★★★).", icon: "BookOpen", color: "teal" },
  { id: "philosophies-of-freedom", name: "Philosophies of Freedom", category: "talent_book", description: "Mon/Thu talent book — Freedom series (★★★★).", icon: "BookOpen", color: "teal" },
  { id: "teachings-of-ballad", name: "Teachings of Ballad", category: "talent_book", description: "Wed/Sat talent book — Ballad series.", icon: "BookOpen", color: "purple" },
  { id: "guide-to-ballad", name: "Guide to Ballad", category: "talent_book", description: "Wed/Sat talent book — Ballad series (★★★).", icon: "BookOpen", color: "purple" },
  { id: "philosophies-of-ballad", name: "Philosophies of Ballad", category: "talent_book", description: "Wed/Sat talent book — Ballad series (★★★★).", icon: "BookOpen", color: "purple" },
  { id: "teachings-of-gold", name: "Teachings of Gold", category: "talent_book", description: "Tue/Fri talent book — Gold series.", icon: "BookOpen", color: "amber" },
  { id: "guide-to-gold", name: "Guide to Gold", category: "talent_book", description: "Tue/Fri talent book — Gold series (★★★).", icon: "BookOpen", color: "amber" },
  { id: "philosophies-of-gold", name: "Philosophies of Gold", category: "talent_book", description: "Tue/Fri talent book — Gold series (★★★★).", icon: "BookOpen", color: "amber" },

  // ── Boss / Crown ──────────────────────────────────────────────────────
  { id: "crown-of-insight", name: "Crown of Insight", category: "talent_boss", description: "Required to level any talent from 9 to 10.", icon: "Crown", color: "gold" },
  { id: "shadow-of-the-warrior", name: "Shadow of the Warrior", category: "talent_boss", description: "Raiden Shogun talent boss drop.", icon: "Zap", color: "purple" },
  { id: "tail-of-boreas", name: "Tail of Boreas", category: "talent_boss", description: "Wolf of the North weekly drop.", icon: "Wind", color: "sky" },
];

export function getResourceById(id: string): ResourceDefinition | undefined {
  return RESOURCE_CATALOGUE.find((r) => r.id === id);
}

export function getResourcesByCategory(category: ResourceCategory): ResourceDefinition[] {
  return RESOURCE_CATALOGUE.filter((r) => r.category === category);
}
