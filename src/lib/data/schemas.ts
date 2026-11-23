import { z } from "zod";

export const ElementSchema = z.enum([
  "Pyro",
  "Hydro",
  "Anemo",
  "Electro",
  "Dendro",
  "Cryo",
  "Geo",
]);

export const WeaponTypeSchema = z.enum([
  "Sword",
  "Claymore",
  "Polearm",
  "Bow",
  "Catalyst",
]);

export const RegionSchema = z.enum([
  "Mondstadt",
  "Liyue",
  "Inazuma",
  "Sumeru",
  "Fontaine",
  "Natlan",
  "Snezhnaya",
  "Other",
]);

export const GameCharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().optional(),
  rarity: z.union([z.literal(4), z.literal(5)]),
  element: ElementSchema,
  weaponType: WeaponTypeSchema,
  region: RegionSchema,
  releaseVersion: z.string().optional(),
  baseHp: z.number().int().positive().optional(),
  baseAtk: z.number().int().positive().optional(),
  baseDef: z.number().int().positive().optional(),
  iconUrl: z.string().url().optional(),
  splashUrl: z.string().url().optional(),
});

export type GameCharacterType = z.infer<typeof GameCharacterSchema>;

export const PlayerCharacterSchema = z.object({
  id: z.string().optional(),
  characterId: z.string().min(1),
  level: z.number().int().min(1).max(90),
  ascension: z.number().int().min(0).max(6),
  constellation: z.number().int().min(0).max(6),
  friendshipLevel: z.number().int().min(1).max(10),
  talentNormal: z.number().int().min(1).max(10),
  talentSkill: z.number().int().min(1).max(10),
  talentBurst: z.number().int().min(1).max(10),
  isTarget: z.boolean().default(false),
  acquiredAt: z.string().datetime().optional(),
});

export type PlayerCharacterType = z.infer<typeof PlayerCharacterSchema>;

export const PityTrackerSchema = z.object({
  bannerType: z.enum(["CHARACTER_EVENT", "WEAPON_EVENT", "STANDARD", "CHRONICLED"]),
  currentPity: z.number().int().min(0).max(90),
  maxPity: z.number().int().default(90),
  isGuaranteed: z.boolean().default(false),
  targetCharacterId: z.string().optional(),
});

export type PityTrackerType = z.infer<typeof PityTrackerSchema>;

export const PlayerProfileSchema = z.object({
  id: z.string().optional(),
  travelerName: z.string().min(1),
  adventureRank: z.number().int().min(1).max(60),
  worldLevel: z.number().int().min(1).max(9),
  signature: z.string().max(100).optional(),
  primogems: z.number().int().min(0),
  intertwinedFates: z.number().int().min(0),
  acquaintFates: z.number().int().min(0),
  isDemo: z.boolean().default(false),
  characters: z.array(PlayerCharacterSchema).default([]),
  pityTrackers: z.array(PityTrackerSchema).default([]),
});

export type PlayerProfileType = z.infer<typeof PlayerProfileSchema>;

// Community Dataset Import Schema
export const CommunityDatasetImportSchema = z.object({
  schemaVersion: z.string(),
  exportedAt: z.string().datetime(),
  characters: z.array(GameCharacterSchema),
});

export type CommunityDatasetImportType = z.infer<typeof CommunityDatasetImportSchema>;
