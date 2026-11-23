import { describe, it, expect } from "vitest";
import {
  GameCharacterSchema,
  PlayerProfileSchema,
  CommunityDatasetImportSchema,
} from "./schemas";

describe("Data Validation Schemas", () => {
  it("validates a canonical game character accurately", () => {
    const validChar = {
      id: "raiden-shogun",
      name: "Raiden Shogun",
      title: "Plane of Euthymia",
      rarity: 5,
      element: "Electro",
      weaponType: "Polearm",
      region: "Inazuma",
      releaseVersion: "2.1",
    };
    const parsed = GameCharacterSchema.safeParse(validChar);
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid element or rarity", () => {
    const invalidChar = {
      id: "fake-hero",
      name: "Fake",
      rarity: 6, // only 4 or 5 allowed
      element: "Light", // not a valid element
      weaponType: "Gun",
      region: "Unknown",
    };
    const parsed = GameCharacterSchema.safeParse(invalidChar);
    expect(parsed.success).toBe(false);
  });

  it("validates player profile with demo flag and collection", () => {
    const profile = {
      travelerName: "Aether",
      adventureRank: 55,
      worldLevel: 8,
      primogems: 3200,
      intertwinedFates: 5,
      acquaintFates: 2,
      isDemo: true,
      characters: [
        {
          characterId: "raiden-shogun",
          level: 90,
          ascension: 6,
          constellation: 0,
          friendshipLevel: 10,
          talentNormal: 6,
          talentSkill: 8,
          talentBurst: 10,
        },
      ],
      pityTrackers: [],
    };
    const parsed = PlayerProfileSchema.safeParse(profile);
    expect(parsed.success).toBe(true);
  });

  it("validates community dataset import payload", () => {
    const importPayload = {
      schemaVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      characters: [
        {
          id: "furina",
          name: "Furina",
          rarity: 5,
          element: "Hydro",
          weaponType: "Sword",
          region: "Fontaine",
        },
      ],
    };
    const parsed = CommunityDatasetImportSchema.safeParse(importPayload);
    expect(parsed.success).toBe(true);
  });
});
