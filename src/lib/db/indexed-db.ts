import Dexie, { Table } from "dexie";

export interface LocalPlayerProfile {
  id: string; // usually 'default-traveler'
  travelerName: string;
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

export class CharacterGetterLocalDB extends Dexie {
  player_profiles!: Table<LocalPlayerProfile, string>;
  player_targets!: Table<LocalPlayerTarget, number>;
  player_inventory!: Table<LocalPlayerInventory, number>;
  player_equipped_builds!: Table<LocalEquippedBuild, number>;
  player_pity!: Table<LocalPityTracker, number>;
  radar_watchlists!: Table<LocalRadarWatchlist, number>;

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
  }
}

// Singleton for browser environment
export const localDb = typeof window !== "undefined" ? new CharacterGetterLocalDB() : (null as unknown as CharacterGetterLocalDB);
