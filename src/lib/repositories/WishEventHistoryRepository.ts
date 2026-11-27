export interface WishEventBanner {
  id: string;
  version: string;
  startTime: string;
  endTime: string;
  uigfType: number;
  bannerCategory: "Character Event" | "Weapon Event" | "Chronicled Wish" | "Standard";
  order: number;
  title: string;
  bannerImage?: string;
  bannerImageBackup?: string;
  featuredFiveStars: number[];
  featuredFourStars: number[];
}

interface RawPoolEntry {
  version: string;
  start_time: string;
  end_time: string;
  timezone?: number;
  uigf_type: number;
  order: number;
  up_orange1_item?: number;
  up_orange2_item?: number;
  up_purple1_item?: number;
  up_purple2_item?: number;
  up_purple3_item?: number;
  up_purple4_item?: number;
  up_purple5_item?: number;
  localization?: Record<
    string,
    {
      locale?: string;
      pool_title?: string;
      banner_image?: string;
      banner_image_backup?: string;
    }
  >;
}

const POOL_JSON_URL =
  "https://raw.githubusercontent.com/Masterain98/Genshin-Wish-Event-History-Data/main/pool.json";
const CACHE_KEY = "cg_wish_event_history_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function mapBannerCategory(uigfType: number): WishEventBanner["bannerCategory"] {
  if (uigfType === 302) return "Weapon Event";
  if (uigfType === 500) return "Chronicled Wish";
  if (uigfType === 200) return "Standard";
  return "Character Event";
}

function normalizePool(raw: RawPoolEntry[]): WishEventBanner[] {
  return raw
    .map((entry, idx) => {
      const en =
        entry.localization?.EN ??
        entry.localization?.CHS ??
        Object.values(entry.localization ?? {})[0];
      const fiveStars = [entry.up_orange1_item, entry.up_orange2_item].filter(
        (id): id is number => typeof id === "number" && id > 0
      );
      const fourStars = [
        entry.up_purple1_item,
        entry.up_purple2_item,
        entry.up_purple3_item,
        entry.up_purple4_item,
        entry.up_purple5_item,
      ].filter((id): id is number => typeof id === "number" && id > 0);

      return {
        id: `${entry.version}-${entry.uigf_type}-${entry.order}-${idx}`,
        version: entry.version,
        startTime: entry.start_time,
        endTime: entry.end_time,
        uigfType: entry.uigf_type,
        bannerCategory: mapBannerCategory(entry.uigf_type),
        order: entry.order,
        title: en?.pool_title || `Version ${entry.version} Banner`,
        bannerImage: en?.banner_image,
        bannerImageBackup: en?.banner_image_backup,
        featuredFiveStars: fiveStars,
        featuredFourStars: fourStars,
      };
    })
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
}

type WishHistoryFetchResult = {
  banners: WishEventBanner[];
  source: "github" | "cache" | "empty";
};

export class WishEventHistoryRepository {
  private memoryCache: WishHistoryFetchResult | null = null;
  private inflight: Promise<WishHistoryFetchResult> | null = null;

  async getBanners(forceRefresh = false): Promise<WishHistoryFetchResult> {
    if (!forceRefresh && this.memoryCache) {
      return this.memoryCache;
    }
    if (!forceRefresh && this.inflight) {
      return this.inflight;
    }

    this.inflight = this.fetchBanners(forceRefresh).finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async fetchBanners(forceRefresh: boolean): Promise<WishHistoryFetchResult> {
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            cachedAt?: number;
            banners?: WishEventBanner[];
          };
          if (
            Array.isArray(parsed.banners) &&
            parsed.banners.length > 0 &&
            parsed.cachedAt &&
            Date.now() - parsed.cachedAt < CACHE_TTL_MS
          ) {
            const result: WishHistoryFetchResult = { banners: parsed.banners, source: "cache" };
            this.memoryCache = result;
            return result;
          }
        }
      } catch {
        // ignore cache read errors
      }
    }

    try {
      const res = await fetch(POOL_JSON_URL, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as RawPoolEntry[];
        const banners = normalizePool(data);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ cachedAt: Date.now(), banners })
          );
        } catch {
          // ignore storage quota errors
        }
        const result: WishHistoryFetchResult = { banners, source: "github" };
        this.memoryCache = result;
        return result;
      }
    } catch {
      // network error: fall back to stale cache if present
    }

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { banners?: WishEventBanner[] };
        if (Array.isArray(parsed.banners) && parsed.banners.length > 0) {
          const result: WishHistoryFetchResult = { banners: parsed.banners, source: "cache" };
          this.memoryCache = result;
          return result;
        }
      }
    } catch {
      // ignore
    }

    return { banners: [], source: "empty" };
  }
}

export const wishEventHistoryRepo = new WishEventHistoryRepository();
