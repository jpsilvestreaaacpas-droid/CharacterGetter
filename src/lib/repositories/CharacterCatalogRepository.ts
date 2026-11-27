import { collection, getDocs } from "firebase/firestore";
import { firestoreDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { CANONICAL_CHARACTERS } from "@/lib/data/canonical-characters";
import type { GameCharacterType } from "@/lib/data/schemas";

const CACHE_KEY = "cg_shared_character_catalog_v1";

export interface CatalogFetchResult {
  characters: GameCharacterType[];
  source: "firestore" | "cache" | "builtin";
  cachedAt?: string;
}

export class CharacterCatalogRepository {
  private memoryCache: CatalogFetchResult | null = null;
  private inflight: Promise<CatalogFetchResult> | null = null;

  async getCharacters(forceRefresh = false): Promise<CatalogFetchResult> {
    if (!forceRefresh && this.memoryCache) {
      return this.memoryCache;
    }
    if (!forceRefresh && this.inflight) {
      return this.inflight;
    }

    this.inflight = this.fetchCharacters().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async fetchCharacters(): Promise<CatalogFetchResult> {
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, "characters"));
        if (!snap.empty) {
          const characters = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<GameCharacterType, "id">),
          })) as GameCharacterType[];

          const now = new Date().toISOString();
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: now, characters }));
          } catch {
            // ignore storage quota errors
          }
          const result: CatalogFetchResult = { characters, source: "firestore", cachedAt: now };
          this.memoryCache = result;
          return result;
        }
      } catch {
        // Fall back to local cache when offline or Firestore unavailable
      }
    }

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { cachedAt?: string; characters?: GameCharacterType[] };
        if (Array.isArray(parsed.characters) && parsed.characters.length > 0) {
          const result: CatalogFetchResult = {
            characters: parsed.characters,
            source: "cache",
            cachedAt: parsed.cachedAt,
          };
          this.memoryCache = result;
          return result;
        }
      }
    } catch {
      // ignore malformed cache
    }

    const result: CatalogFetchResult = {
      characters: CANONICAL_CHARACTERS,
      source: "builtin",
    };
    this.memoryCache = result;
    return result;
  }
}

export const characterCatalogRepo = new CharacterCatalogRepository();
