import { localDb } from "@/lib/db/indexed-db";
import { localPlayerRepo, DEFAULT_PROFILE_ID } from "@/lib/repositories/LocalPlayerRepository";

export interface WishPlannerState {
  primogems: number;
  intertwinedFates: number;
  acquaintFates: number;
  characterPity: number; // 0-89
  characterGuaranteed: boolean;
  weaponPity: number; // 0-79
  weaponGuaranteed: boolean;
  weaponFatePoints: number; // 0-2
  standardPity: number; // 0-89
  targetCharacterId: string;
  desiredConstellation: number; // 0-6
  notes: string;
  lastSavedAt?: string;
}

const WISH_PLANNER_META_KEY = "wish_planner_meta";

export class WishPlannerRepository {
  async saveAll(state: WishPlannerState): Promise<string> {
    await localPlayerRepo.initialize();

    // Validate against Genshin Impact banner mechanics
    const primogems = Math.max(0, Math.floor(Number(state.primogems) || 0));
    const intertwinedFates = Math.max(0, Math.floor(Number(state.intertwinedFates) || 0));
    const acquaintFates = Math.max(0, Math.floor(Number(state.acquaintFates) || 0));
    const characterPity = Math.max(0, Math.min(89, Math.floor(Number(state.characterPity) || 0)));
    const weaponPity = Math.max(0, Math.min(79, Math.floor(Number(state.weaponPity) || 0)));
    const weaponFatePoints = Math.max(0, Math.min(2, Math.floor(Number(state.weaponFatePoints) || 0)));
    const standardPity = Math.max(0, Math.min(89, Math.floor(Number(state.standardPity) || 0)));
    const desiredConstellation = Math.max(0, Math.min(6, Math.floor(Number(state.desiredConstellation) || 0)));
    const now = new Date().toISOString();

    await localDb.transaction(
      "rw",
      [localDb.profiles, localDb.resources, localDb.bannerTracking, localDb.settings],
      async () => {
        // 1. Update profile currencies
        await localDb.profiles.update(DEFAULT_PROFILE_ID, {
          primogems,
          intertwinedFates,
          acquaintFates,
          updatedAt: now,
        });

        // 2. Update centralized resource inventory (no duplicates)
        await localDb.resources.put({
          itemId: "primogems",
          name: "Primogems",
          category: "currency",
          quantity: primogems,
          targetQuantity: 0,
          updatedAt: now,
        });
        await localDb.resources.put({
          itemId: "intertwined-fate",
          name: "Intertwined Fate",
          category: "currency",
          quantity: intertwinedFates,
          targetQuantity: 0,
          updatedAt: now,
        });
        await localDb.resources.put({
          itemId: "acquaint-fate",
          name: "Acquaint Fate",
          category: "currency",
          quantity: acquaintFates,
          targetQuantity: 0,
          updatedAt: now,
        });

        // 3. Update separate banner pity records
        await localDb.bannerTracking.put({
          bannerType: "CHARACTER_EVENT",
          currentPity: characterPity,
          isGuaranteed: Boolean(state.characterGuaranteed),
          targetCharacterId: state.targetCharacterId,
          updatedAt: now,
        });
        await localDb.bannerTracking.put({
          bannerType: "WEAPON_EVENT",
          currentPity: weaponPity,
          isGuaranteed: Boolean(state.weaponGuaranteed),
          epitomizedPathPoints: weaponFatePoints,
          updatedAt: now,
        });
        await localDb.bannerTracking.put({
          bannerType: "STANDARD",
          currentPity: standardPity,
          isGuaranteed: false,
          updatedAt: now,
        });

        // 4. Save wish planner metadata
        await localDb.settings.put({
          key: WISH_PLANNER_META_KEY,
          value: {
            targetCharacterId: state.targetCharacterId,
            desiredConstellation,
            notes: state.notes ?? "",
            lastSavedAt: now,
          },
          updatedAt: now,
        });
      }
    );

    return now;
  }

  /**
   * Resets ONLY wish planner pity/targets/notes. Never touches Primogems, Fates, or Mora.
   */
  async resetWishPlannerOnly(): Promise<void> {
    await localPlayerRepo.initialize();
    const now = new Date().toISOString();
    await localDb.transaction("rw", [localDb.bannerTracking, localDb.settings], async () => {
      await localDb.bannerTracking.put({
        bannerType: "CHARACTER_EVENT",
        currentPity: 0,
        isGuaranteed: false,
        updatedAt: now,
      });
      await localDb.bannerTracking.put({
        bannerType: "WEAPON_EVENT",
        currentPity: 0,
        isGuaranteed: false,
        epitomizedPathPoints: 0,
        updatedAt: now,
      });
      await localDb.bannerTracking.put({
        bannerType: "STANDARD",
        currentPity: 0,
        isGuaranteed: false,
        updatedAt: now,
      });
      await localDb.settings.delete(WISH_PLANNER_META_KEY);
    });
  }

  /**
   * Explicitly resets all player resource balances to 0 (requires user confirmation in UI).
   */
  async resetAllResourceBalances(): Promise<void> {
    await localPlayerRepo.initialize();
    const now = new Date().toISOString();
    await localDb.transaction("rw", [localDb.profiles, localDb.resources], async () => {
      await localDb.profiles.update(DEFAULT_PROFILE_ID, {
        primogems: 0,
        intertwinedFates: 0,
        acquaintFates: 0,
        updatedAt: now,
      });
      const all = await localDb.resources.toArray();
      await localDb.resources.bulkPut(
        all.map((r) => ({ ...r, quantity: 0, updatedAt: now }))
      );
    });
  }
}

export const wishPlannerRepo = new WishPlannerRepository();
