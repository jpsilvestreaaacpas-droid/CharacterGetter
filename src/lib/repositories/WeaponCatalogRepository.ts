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

export class WeaponCatalogRepository {
  async getWeapons(): Promise<{ weapons: SharedWeaponSummary[]; source: "firestore" | "cache" | "builtin" }> {
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
          return { weapons, source: "firestore" };
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
          return {
            weapons: parsed.weapons.map((w) => ({
              ...w,
              iconUrl: getGiLoadoutsWeaponIcon(w.name) ?? w.iconUrl,
            })),
            source: "cache",
          };
        }
      }
    } catch {
      // ignore
    }

    return {
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
  }
}

export const weaponCatalogRepo = new WeaponCatalogRepository();
