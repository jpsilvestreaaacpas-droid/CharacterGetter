import {
  localDb,
  CharacterGetterLocalDB,
  LocalPlayerProfile,
  LocalResourceRecord,
  LocalCharacterRecord,
  LocalCharacterProgression,
  LocalBannerTracking,
  LocalWishHistoryRecord,
  LocalTeamRecord,
  LocalSettingRecord,
} from "@/lib/db/indexed-db";
import { RESOURCE_CATALOGUE } from "@/lib/data/resources";

export const DEFAULT_PROFILE_ID = "default-traveler";

export const DEFAULT_PROFILE: LocalPlayerProfile = {
  id: DEFAULT_PROFILE_ID,
  travelerName: "Traveler",
  avatarId: "lumine",
  adventureRank: 1,
  worldLevel: 0,
  signature: "Exploring Teyvat",
  primogems: 0,
  intertwinedFates: 0,
  acquaintFates: 0,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_DEMO_QUANTITIES: Record<string, { quantity: number; target: number }> = {
  mora: { quantity: 5842100, target: 10000000 },
  primogems: { quantity: 14880, target: 0 },
  "intertwined-fate": { quantity: 12, target: 0 },
  "acquaint-fate": { quantity: 5, target: 0 },
  "heros-wit": { quantity: 428, target: 600 },
  "adventurers-experience": { quantity: 44, target: 0 },
  "wanderers-advice": { quantity: 12, target: 0 },
  "agnidus-agate-chunk": { quantity: 6, target: 12 },
  "varunada-lazurite-chunk": { quantity: 3, target: 6 },
  "vajrada-amethyst-chunk": { quantity: 8, target: 6 },
  "nagadus-emerald-chunk": { quantity: 2, target: 9 },
  "shivada-jade-chunk": { quantity: 4, target: 9 },
  "teachings-of-freedom": { quantity: 0, target: 9 },
  "guide-to-freedom": { quantity: 15, target: 20 },
  "philosophies-of-freedom": { quantity: 8, target: 16 },
  "teachings-of-ballad": { quantity: 3, target: 9 },
  "guide-to-ballad": { quantity: 9, target: 20 },
  "philosophies-of-ballad": { quantity: 4, target: 16 },
  "crown-of-insight": { quantity: 6, target: 10 },
  "shadow-of-the-warrior": { quantity: 2, target: 4 },
};

export interface LocalBackupPayload {
  schemaVersion: string;
  exportedAt: string;
  profiles: LocalPlayerProfile[];
  resources: LocalResourceRecord[];
  characters: LocalCharacterRecord[];
  characterProgression: LocalCharacterProgression[];
  bannerTracking: LocalBannerTracking[];
  wishHistory: LocalWishHistoryRecord[];
  teams: LocalTeamRecord[];
  settings: LocalSettingRecord[];
}

export class LocalPlayerRepository {
  private db: CharacterGetterLocalDB;
  private initPromise: Promise<void> | null = null;

  constructor(dbInstance: CharacterGetterLocalDB = localDb) {
    this.db = dbInstance;
  }

  /**
   * Initializes local database on startup.
   * Never overwrites existing player data. Only seeds defaults if tables are empty.
   */
  async initialize(): Promise<void> {
    if (!this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      await this.db.open();

      // 1. Migrate or seed profile (never overwrite existing)
      const existingProfileCount = await this.db.profiles.count();
      if (existingProfileCount === 0) {
        const legacyProfiles = await this.db.player_profiles.toArray();
        if (legacyProfiles.length > 0) {
          await this.db.profiles.bulkPut(legacyProfiles);
        } else {
          await this.db.profiles.put({
            ...DEFAULT_PROFILE,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 2. Migrate or seed resources (never overwrite existing)
      const existingResourceCount = await this.db.resources.count();
      if (existingResourceCount === 0) {
        const now = new Date().toISOString();
        const initialResources: LocalResourceRecord[] = RESOURCE_CATALOGUE.map((r) => ({
          itemId: r.id,
          name: r.name,
          category: r.category,
          quantity: DEFAULT_DEMO_QUANTITIES[r.id]?.quantity ?? 0,
          targetQuantity: DEFAULT_DEMO_QUANTITIES[r.id]?.target ?? 0,
          updatedAt: now,
        }));
        await this.db.resources.bulkPut(initialResources);
      } else {
        // Preserve existing inventory, only add newly introduced catalog items
        const existingIds = new Set(await this.db.resources.toCollection().primaryKeys());
        const now = new Date().toISOString();
        const missing = RESOURCE_CATALOGUE.filter((r) => !existingIds.has(r.id)).map((r) => ({
          itemId: r.id,
          name: r.name,
          category: r.category,
          quantity: 0,
          targetQuantity: 0,
          updatedAt: now,
        }));
        if (missing.length > 0) {
          await this.db.resources.bulkPut(missing);
        }
      }

      // 3. Seed default banner tracking if empty
      const bannerCount = await this.db.bannerTracking.count();
      if (bannerCount === 0) {
        const now = new Date().toISOString();
        await this.db.bannerTracking.bulkPut([
          { bannerType: "CHARACTER_EVENT", currentPity: 0, isGuaranteed: false, updatedAt: now },
          { bannerType: "WEAPON_EVENT", currentPity: 0, isGuaranteed: false, updatedAt: now },
          { bannerType: "STANDARD", currentPity: 0, isGuaranteed: false, updatedAt: now },
        ]);
      }
    })();

    return this.initPromise;
  }

  // --- Profile Operations ---
  async getProfile(id: string = DEFAULT_PROFILE_ID): Promise<LocalPlayerProfile | undefined> {
    await this.initialize();
    return this.db.profiles.get(id);
  }

  async saveProfile(
    updates: Partial<Omit<LocalPlayerProfile, "id">> & { id?: string }
  ): Promise<LocalPlayerProfile> {
    await this.initialize();
    const id = updates.id ?? DEFAULT_PROFILE_ID;
    const existing = (await this.db.profiles.get(id)) ?? { ...DEFAULT_PROFILE, id };

    const sanitizedAdventureRank =
      updates.adventureRank !== undefined
        ? Math.max(1, Math.min(60, Math.floor(Number(updates.adventureRank) || 1)))
        : existing.adventureRank;
    const sanitizedWorldLevel =
      updates.worldLevel !== undefined
        ? Math.max(0, Math.min(9, Math.floor(Number(updates.worldLevel) || 0)))
        : existing.worldLevel;
    const sanitizedPrimos =
      updates.primogems !== undefined
        ? this.validateQuantity(updates.primogems)
        : existing.primogems;
    const sanitizedIntertwined =
      updates.intertwinedFates !== undefined
        ? this.validateQuantity(updates.intertwinedFates)
        : existing.intertwinedFates;
    const sanitizedAcquaint =
      updates.acquaintFates !== undefined
        ? this.validateQuantity(updates.acquaintFates)
        : existing.acquaintFates;

    const now = new Date().toISOString();
    const next: LocalPlayerProfile = {
      ...existing,
      ...updates,
      id,
      adventureRank: sanitizedAdventureRank,
      worldLevel: sanitizedWorldLevel,
      primogems: sanitizedPrimos,
      intertwinedFates: sanitizedIntertwined,
      acquaintFates: sanitizedAcquaint,
      updatedAt: now,
    };

    await this.db.profiles.put(next);

    // Keep resource inventory in sync with profile currencies
    if (updates.primogems !== undefined) {
      await this.upsertResource({
        itemId: "primogems",
        name: "Primogems",
        category: "currency",
        quantity: sanitizedPrimos,
      });
    }
    if (updates.intertwinedFates !== undefined) {
      await this.upsertResource({
        itemId: "intertwined-fate",
        name: "Intertwined Fate",
        category: "currency",
        quantity: sanitizedIntertwined,
      });
    }
    if (updates.acquaintFates !== undefined) {
      await this.upsertResource({
        itemId: "acquaint-fate",
        name: "Acquaint Fate",
        category: "currency",
        quantity: sanitizedAcquaint,
      });
    }

    return next;
  }

  // --- Resource Inventory Operations ---
  validateQuantity(value: number, allowNegative = false): number {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      throw new Error("Invalid numeric quantity");
    }
    const floored = Math.floor(num);
    if (!allowNegative && floored < 0) {
      return 0;
    }
    return floored;
  }

  async getResources(): Promise<LocalResourceRecord[]> {
    await this.initialize();
    return this.db.resources.toArray();
  }

  async upsertResource(input: {
    itemId: string;
    name: string;
    category: string;
    quantity: number;
    targetQuantity?: number;
  }): Promise<LocalResourceRecord> {
    await this.initialize();
    const existing = await this.db.resources.get(input.itemId);
    const quantity = this.validateQuantity(input.quantity);
    const targetQuantity =
      input.targetQuantity !== undefined
        ? this.validateQuantity(input.targetQuantity)
        : existing?.targetQuantity ?? 0;

    const now = new Date().toISOString();
    const record: LocalResourceRecord = {
      itemId: input.itemId,
      name: input.name || existing?.name || input.itemId,
      category: input.category || existing?.category || "common_material",
      quantity,
      targetQuantity,
      updatedAt: now,
    };

    await this.db.resources.put(record);

    // Sync currency resources back to default profile
    if (input.itemId === "primogems") {
      await this.db.profiles.update(DEFAULT_PROFILE_ID, { primogems: quantity, updatedAt: now });
    } else if (input.itemId === "intertwined-fate") {
      await this.db.profiles.update(DEFAULT_PROFILE_ID, {
        intertwinedFates: quantity,
        updatedAt: now,
      });
    } else if (input.itemId === "acquaint-fate") {
      await this.db.profiles.update(DEFAULT_PROFILE_ID, {
        acquaintFates: quantity,
        updatedAt: now,
      });
    }

    return record;
  }

  async deleteResource(itemId: string): Promise<void> {
    await this.initialize();
    await this.db.resources.delete(itemId);
  }

  // --- Banner & Pity Operations ---
  async getBannerTracking(): Promise<LocalBannerTracking[]> {
    await this.initialize();
    return this.db.bannerTracking.toArray();
  }

  async saveBannerTracking(tracking: Omit<LocalBannerTracking, "updatedAt">): Promise<void> {
    await this.initialize();
    await this.db.bannerTracking.put({
      ...tracking,
      currentPity: this.validateQuantity(tracking.currentPity),
      updatedAt: new Date().toISOString(),
    });
  }

  // --- Local JSON Export / Import ---
  async exportAllData(): Promise<string> {
    await this.initialize();
    const payload: LocalBackupPayload = {
      schemaVersion: "2.0.0",
      exportedAt: new Date().toISOString(),
      profiles: await this.db.profiles.toArray(),
      resources: await this.db.resources.toArray(),
      characters: await this.db.characters.toArray(),
      characterProgression: await this.db.characterProgression.toArray(),
      bannerTracking: await this.db.bannerTracking.toArray(),
      wishHistory: await this.db.wishHistory.toArray(),
      teams: await this.db.teams.toArray(),
      settings: await this.db.settings.toArray(),
    };
    return JSON.stringify(payload, null, 2);
  }

  async importAllData(jsonString: string): Promise<void> {
    const parsed = JSON.parse(jsonString) as Partial<LocalBackupPayload>;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.profiles)) {
      throw new Error("Invalid backup file format: missing profiles array");
    }

    await this.db.open();
    await this.db.transaction(
      "rw",
      [
        this.db.profiles,
        this.db.resources,
        this.db.characters,
        this.db.characterProgression,
        this.db.bannerTracking,
        this.db.wishHistory,
        this.db.teams,
        this.db.settings,
      ],
      async () => {
        if (parsed.profiles?.length) {
          await this.db.profiles.clear();
          await this.db.profiles.bulkPut(parsed.profiles);
        }
        if (parsed.resources?.length) {
          await this.db.resources.clear();
          await this.db.resources.bulkPut(parsed.resources);
        }
        if (parsed.characters?.length) {
          await this.db.characters.clear();
          await this.db.characters.bulkPut(parsed.characters);
        }
        if (parsed.characterProgression?.length) {
          await this.db.characterProgression.clear();
          await this.db.characterProgression.bulkPut(parsed.characterProgression);
        }
        if (parsed.bannerTracking?.length) {
          await this.db.bannerTracking.clear();
          await this.db.bannerTracking.bulkPut(parsed.bannerTracking);
        }
        if (parsed.wishHistory?.length) {
          await this.db.wishHistory.clear();
          await this.db.wishHistory.bulkPut(parsed.wishHistory);
        }
        if (parsed.teams?.length) {
          await this.db.teams.clear();
          await this.db.teams.bulkPut(parsed.teams);
        }
        if (parsed.settings?.length) {
          await this.db.settings.clear();
          await this.db.settings.bulkPut(parsed.settings);
        }
      }
    );
  }
}

export const localPlayerRepo = new LocalPlayerRepository();
