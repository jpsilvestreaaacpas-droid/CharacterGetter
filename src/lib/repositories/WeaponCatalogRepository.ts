import { collection, getDocs } from "firebase/firestore";
import { firestoreDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { WEAPON_CATALOG, WeaponType } from "@/lib/data/weapon-catalog";
import { getGiLoadoutsWeaponIcon } from "@/lib/data/gi-loadouts-weapon-icons";

const CACHE_KEY = "cg_shared_weapon_catalog_v1";

export interface SharedWeaponSummary {
  id: string;
  name: string;
  weaponType: WeaponType | string;
  rarity: number;
  baseAtk?: number;
  secondaryStatType?: string;
  secondaryStatValue?: string;
  iconUrl?: string;
  gameVersion?: string;
  source?: string;
}

type WeaponFetchResult = {
  weapons: SharedWeaponSummary[];
  source: "firestore" | "cache" | "builtin";
};

export class WeaponCatalogRepository {
  private memoryCache: WeaponFetchResult | null = null;
  private inflight: Promise<WeaponFetchResult> | null = null;

  async getWeapons(forceRefresh = false): Promise<WeaponFetchResult> {
    if (!forceRefresh && this.memoryCache) {
      return this.memoryCache;
    }
    if (!forceRefresh && this.inflight) {
      return this.inflight;
    }

    this.inflight = this.fetchWeapons().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async fetchWeapons(): Promise<WeaponFetchResult> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, "weapons"));
        if (!snap.empty) {
          const weapons = snap.docs.map((d) => {
            const data = d.data() as Omit<SharedWeaponSummary, "id">;
            return {
              id: d.id,
              ...data,
              iconUrl: getGiLoadoutsWeaponIcon(data.name) ?? data.iconUrl,
            };
          });
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: new Date().toISOString(), weapons }));
          } catch {
            // ignore quota errors
          }
          const result: WeaponFetchResult = { weapons, source: "firestore" };
          this.memoryCache = result;
          return result;
        }
      } catch {
        // offline fallback
      }
    }

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { weapons?: SharedWeaponSummary[] };
        if (Array.isArray(parsed.weapons) && parsed.weapons.length > 0) {
          const result: WeaponFetchResult = {
            weapons: parsed.weapons.map((w) => ({
              ...w,
              iconUrl: getGiLoadoutsWeaponIcon(w.name) ?? w.iconUrl,
            })),
            source: "cache",
          };
          this.memoryCache = result;
          return result;
        }
      }
    } catch {
      // ignore
    }

    const result: WeaponFetchResult = {
      weapons: WEAPON_CATALOG.map((w) => ({
        id: w.id,
        name: w.name,
        weaponType: w.weaponType,
        rarity: w.rarity,
        iconUrl: getGiLoadoutsWeaponIcon(w.name),
        secondaryStatType: w.secondaryStatType,
        gameVersion: w.gameVersion,
        source: w.source,
      })),
      source: "builtin",
    };
    this.memoryCache = result;
    return result;
  }
}

export const weaponCatalogRepo = new WeaponCatalogRepository();
