import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { localDb } from "@/lib/db/indexed-db";
import { localPlayerRepo, DEFAULT_PROFILE_ID } from "@/lib/repositories/LocalPlayerRepository";

/**
 * Initializes Dexie on mount (once) and returns reactive player profile.
 */
export function usePlayerProfile(profileId: string = DEFAULT_PROFILE_ID) {
  React.useEffect(() => {
    localPlayerRepo.initialize().catch(console.error);
  }, []);

  const profile = useLiveQuery(
    () => (localDb ? localDb.profiles.get(profileId) : undefined),
    [profileId]
  );

  return {
    profile,
    isLoading: profile === undefined,
    saveProfile: localPlayerRepo.saveProfile.bind(localPlayerRepo),
  };
}

/**
 * Reactive resource inventory from Dexie.
 */
export function usePlayerResources() {
  React.useEffect(() => {
    localPlayerRepo.initialize().catch(console.error);
  }, []);

  const resources = useLiveQuery(
    () => (localDb ? localDb.resources.toArray() : []),
    []
  );

  return {
    resources: resources ?? [],
    isLoading: resources === undefined,
    upsertResource: localPlayerRepo.upsertResource.bind(localPlayerRepo),
    deleteResource: localPlayerRepo.deleteResource.bind(localPlayerRepo),
  };
}

/**
 * Reactive banner pity tracking from Dexie.
 */
export function useBannerTracking() {
  React.useEffect(() => {
    localPlayerRepo.initialize().catch(console.error);
  }, []);

  const banners = useLiveQuery(
    () => (localDb ? localDb.bannerTracking.toArray() : []),
    []
  );

  return {
    banners: banners ?? [],
    isLoading: banners === undefined,
    saveBannerTracking: localPlayerRepo.saveBannerTracking.bind(localPlayerRepo),
  };
}

/**
 * Reactive owned weapons from Dexie.
 */
export function usePlayerWeapons() {
  React.useEffect(() => {
    localPlayerRepo.initialize().catch(console.error);
  }, []);

  const weapons = useLiveQuery(
    () => (localDb ? localDb.weapons.toArray() : []),
    []
  );

  return {
    weapons: weapons ?? [],
    isLoading: weapons === undefined,
  };
}

/**
 * Reactive owned characters + progression from Dexie.
 */
export function usePlayerCharacters() {
  React.useEffect(() => {
    localPlayerRepo.initialize().catch(console.error);
  }, []);

  const chars = useLiveQuery(() => (localDb ? localDb.characters.toArray() : []), []);
  const progs = useLiveQuery(() => (localDb ? localDb.characterProgression.toArray() : []), []);

  const combined = React.useMemo(() => {
    if (!chars) return [];
    const progMap = new Map((progs ?? []).map((p) => [p.characterId, p]));
    return chars
      .filter((c) => c.owned)
      .map((c) => {
        const p = progMap.get(c.characterId);
        return {
          characterId: c.characterId,
          constellation: c.constellation,
          level: p?.level ?? 1,
          ascension: p?.ascension ?? 0,
          friendshipLevel: p?.friendshipLevel ?? 1,
          talentNormal: p?.talentNormal ?? 1,
          talentSkill: p?.talentSkill ?? 1,
          talentBurst: p?.talentBurst ?? 1,
          updatedAt: p?.updatedAt ?? c.updatedAt,
        };
      });
  }, [chars, progs]);

  return {
    characters: combined,
    isLoading: chars === undefined,
  };
}
