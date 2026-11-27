import Dexie, { Table } from "dexie";

// --- V1 Legacy Interfaces (preserved for backward compatibility & migration) ---
export interface LocalPlayerProfile {
  id: string; // 'default-traveler'
  travelerName: string;
  avatarId?: string;
  adventureRank: number;
  worldLevel: number;
  signature?: string;
  primogems: number;
  intertwinedFates: number;
  acquaintFates: number;
  updatedAt: string;
}

export interface LocalPlayerTarget {
  id?: number;
  characterId: string;
  priority: number; // 1 = highest
  targetVersion?: string;
  maxPullsBudget?: number;
  notes?: string;
  createdAt: string;
}

export interface LocalPlayerInventory {
  id?: number;
  itemId: string;
  category: string;
  quantity: number;
  targetQuantity: number;
  updatedAt: string;
}

export interface LocalEquippedBuild {
  id?: number;
  characterId: string;
  playstyleId: string;
  equippedWeapon?: {
    name: string;
    level: number;
    refinement: number;
  };
  equippedArtifacts?: {
    set1Name: string;
    set2Name?: string;
    sandsMainStat: string;
    gobletMainStat: string;
    circletMainStat: string;
  };
  characterLevel: number;
  constellation: number;
  talentNormal: number;
  talentSkill: number;
  talentBurst: number;
  notes?: string;
  updatedAt: string;
}

export interface LocalPityTracker {
  id?: number;
  bannerType: "CHARACTER_EVENT" | "WEAPON_EVENT" | "STANDARD" | "CHRONICLED";
  currentPity: number;
  isGuaranteed: boolean;
  targetCharacterId?: string;
  updatedAt: string;
}

export interface LocalRadarWatchlist {
  id?: number;
  characterId: string;
  alertThreshold: number; // probability % threshold
  notes?: string;
  createdAt: string;
}

// --- V2 Canonical Player Tables ---
export interface LocalResourceRecord {
  itemId: string; // Primary key - prevents duplicate inventory records
  name: string;
  category: string;
  quantity: number;
  targetQuantity: number;
  updatedAt: string;
}

export interface LocalCharacterRecord {
  characterId: string; // Primary key
  owned: boolean;
  constellation: number;
  obtainedAt?: string;
  updatedAt: string;
}

export interface LocalCharacterProgression {
  characterId: string; // Primary key
  level: number;
  ascension: number;
  friendshipLevel?: number;
  talentNormal: number;
  talentSkill: number;
  talentBurst: number;
  targetLevel: number;
  targetAscension: number;
  targetTalentNormal: number;
  targetTalentSkill: number;
  targetTalentBurst: number;
  updatedAt: string;
}

export interface LocalWeaponRecord {
  id: string; // Primary key
  weaponId: string;
  name: string;
  level: number;
  ascension: number;
  refinement: number;
  equippedTo?: string;
  updatedAt: string;
}

export interface LocalArtifactRecord {
  id: string; // Primary key
  setName: string;
  slot: "flower" | "plume" | "sands" | "goblet" | "circlet";
  mainStat: string;
  level: number;
  rarity: number;
  equippedTo?: string;
  updatedAt: string;
}

export interface LocalWishHistoryRecord {
  id?: number;
  bannerType: "CHARACTER_EVENT" | "WEAPON_EVENT" | "STANDARD" | "CHRONICLED";
  itemName: string;
  characterId?: string;
  rarity: 3 | 4 | 5;
  pityAtPull: number;
  isFeatured?: boolean;
  timestamp: string;
}

export interface LocalBannerTracking {
  bannerType: "CHARACTER_EVENT" | "WEAPON_EVENT" | "STANDARD" | "CHRONICLED"; // Primary key
  currentPity: number;
  isGuaranteed: boolean;
  epitomizedPathPoints?: number;
  targetCharacterId?: string;
  updatedAt: string;
}

export interface LocalTeamRecord {
  id?: number;
  name: string;
  characterIds: string[];
  notes?: string;
  updatedAt: string;
}

export interface LocalSettingRecord {
  key: string; // Primary key
  value: unknown;
  updatedAt: string;
}

export class CharacterGetterLocalDB extends Dexie {
  // V1 tables (kept intact for safe schema upgrades)
  player_profiles!: Table<LocalPlayerProfile, string>;
  player_targets!: Table<LocalPlayerTarget, number>;
  player_inventory!: Table<LocalPlayerInventory, number>;
  player_equipped_builds!: Table<LocalEquippedBuild, number>;
  player_pity!: Table<LocalPityTracker, number>;
  radar_watchlists!: Table<LocalRadarWatchlist, number>;

  // V2 canonical tables
  profiles!: Table<LocalPlayerProfile, string>;
  resources!: Table<LocalResourceRecord, string>;
  characters!: Table<LocalCharacterRecord, string>;
  characterProgression!: Table<LocalCharacterProgression, string>;
  weapons!: Table<LocalWeaponRecord, string>;
  artifacts!: Table<LocalArtifactRecord, string>;
  wishHistory!: Table<LocalWishHistoryRecord, number>;
  bannerTracking!: Table<LocalBannerTracking, string>;
  pullTargets!: Table<LocalPlayerTarget, number>;
  builds!: Table<LocalEquippedBuild, number>;
  teams!: Table<LocalTeamRecord, number>;
  settings!: Table<LocalSettingRecord, string>;

  constructor() {
    super("CharacterGetterLocalDB");

    this.version(1).stores({
      player_profiles: "id, updatedAt",
      player_targets: "++id, characterId, priority, targetVersion",
      player_inventory: "++id, itemId, category",
      player_equipped_builds: "++id, characterId, playstyleId",
      player_pity: "++id, bannerType",
      radar_watchlists: "++id, characterId",
    });

    this.version(2).stores({
      // Preserve v1 tables
      player_profiles: "id, updatedAt",
      player_targets: "++id, characterId, priority, targetVersion",
      player_inventory: "++id, itemId, category",
      player_equipped_builds: "++id, characterId, playstyleId",
      player_pity: "++id, bannerType",
      radar_watchlists: "++id, characterId",
      // V2 canonical tables
      profiles: "id, updatedAt",
      resources: "itemId, category, updatedAt",
      characters: "characterId, owned, updatedAt",
      characterProgression: "characterId, updatedAt",
      weapons: "id, weaponId, equippedTo, updatedAt",
      artifacts: "id, setName, slot, equippedTo, updatedAt",
      wishHistory: "++id, bannerType, timestamp, characterId, rarity",
      bannerTracking: "bannerType, updatedAt",
      pullTargets: "++id, characterId, priority, targetVersion",
      builds: "++id, characterId, playstyleId, updatedAt",
      teams: "++id, name, updatedAt",
      settings: "key, updatedAt",
    });
  }
}

// Singleton for browser environment
export const localDb =
  typeof window !== "undefined"
    ? new CharacterGetterLocalDB()
    : (null as unknown as CharacterGetterLocalDB);
