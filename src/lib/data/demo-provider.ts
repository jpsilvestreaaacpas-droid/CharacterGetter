import { PlayerProfileType } from "./schemas";
import { CANONICAL_CHARACTERS } from "./canonical-characters";

export const DEMO_PLAYER_PROFILE: PlayerProfileType = {
  id: "demo-traveler-001",
  travelerName: "Lumine (Demo Traveler)",
  adventureRank: 58,
  worldLevel: 8,
  signature: "Collecting stars across Teyvat ✨ | Demo Profile",
  primogems: 14880, // = 93 wishes
  intertwinedFates: 12, // + 12 = 105 total wishes
  acquaintFates: 5,
  isDemo: true,
  characters: [
    {
      characterId: "raiden-shogun",
      level: 90,
      ascension: 6,
      constellation: 2,
      friendshipLevel: 10,
      talentNormal: 6,
      talentSkill: 9,
      talentBurst: 10,
      isTarget: false,
      acquiredAt: "2024-01-10T00:00:00.000Z",
    },
    {
      characterId: "furina",
      level: 90,
      ascension: 6,
      constellation: 1,
      friendshipLevel: 10,
      talentNormal: 6,
      talentSkill: 10,
      talentBurst: 10,
      isTarget: false,
      acquiredAt: "2024-03-15T00:00:00.000Z",
    },
    {
      characterId: "nahida",
      level: 90,
      ascension: 6,
      constellation: 0,
      friendshipLevel: 10,
      talentNormal: 6,
      talentSkill: 10,
      talentBurst: 9,
      isTarget: false,
      acquiredAt: "2024-04-20T00:00:00.000Z",
    },
    {
      characterId: "kaedehara-kazuha",
      level: 90,
      ascension: 6,
      constellation: 0,
      friendshipLevel: 9,
      talentNormal: 8,
      talentSkill: 9,
      talentBurst: 9,
      isTarget: false,
      acquiredAt: "2024-05-01T00:00:00.000Z",
    },
    {
      characterId: "zhongli",
      level: 80,
      ascension: 5,
      constellation: 0,
      friendshipLevel: 10,
      talentNormal: 6,
      talentSkill: 9,
      talentBurst: 8,
      isTarget: false,
      acquiredAt: "2024-05-18T00:00:00.000Z",
    },
    {
      characterId: "neuvillette",
      level: 90,
      ascension: 6,
      constellation: 0,
      friendshipLevel: 8,
      talentNormal: 10,
      talentSkill: 8,
      talentBurst: 8,
      isTarget: false,
      acquiredAt: "2024-06-02T00:00:00.000Z",
    },
    {
      characterId: "kamisato-ayaka",
      level: 80,
      ascension: 5,
      constellation: 0,
      friendshipLevel: 7,
      talentNormal: 8,
      talentSkill: 8,
      talentBurst: 8,
      isTarget: false,
      acquiredAt: "2024-07-12T00:00:00.000Z",
    },
    {
      characterId: "bennett",
      level: 80,
      ascension: 5,
      constellation: 5,
      friendshipLevel: 10,
      talentNormal: 1,
      talentSkill: 8,
      talentBurst: 10,
      isTarget: false,
      acquiredAt: "2023-11-05T00:00:00.000Z",
    },
    {
      characterId: "xiangling",
      level: 80,
      ascension: 5,
      constellation: 6,
      friendshipLevel: 10,
      talentNormal: 1,
      talentSkill: 8,
      talentBurst: 10,
      isTarget: false,
      acquiredAt: "2023-11-10T00:00:00.000Z",
    },
    {
      characterId: "xingqiu",
      level: 80,
      ascension: 5,
      constellation: 6,
      friendshipLevel: 10,
      talentNormal: 1,
      talentSkill: 9,
      talentBurst: 10,
      isTarget: false,
      acquiredAt: "2023-11-15T00:00:00.000Z",
    },
    {
      characterId: "kuki-shinobu",
      level: 90,
      ascension: 6,
      constellation: 3,
      friendshipLevel: 10,
      talentNormal: 1,
      talentSkill: 9,
      talentBurst: 6,
      isTarget: false,
      acquiredAt: "2024-02-01T00:00:00.000Z",
    },
  ],
  pityTrackers: [
    {
      bannerType: "CHARACTER_EVENT",
      currentPity: 64,
      maxPity: 90,
      isGuaranteed: false, // On 50/50
      targetCharacterId: "hu-tao",
    },
    {
      bannerType: "WEAPON_EVENT",
      currentPity: 22,
      maxPity: 80,
      isGuaranteed: false,
    },
    {
      bannerType: "STANDARD",
      currentPity: 45,
      maxPity: 90,
      isGuaranteed: false,
    },
  ],
};

export function getDemoData() {
  const charactersWithDetails = DEMO_PLAYER_PROFILE.characters.map((pc) => {
    const canonical = CANONICAL_CHARACTERS.find((c) => c.id === pc.characterId);
    return {
      ...pc,
      name: canonical?.name ?? pc.characterId,
      title: canonical?.title,
      rarity: canonical?.rarity ?? 4,
      element: canonical?.element ?? "Anemo",
      weaponType: canonical?.weaponType ?? "Sword",
      region: canonical?.region ?? "Mondstadt",
    };
  });

  const nextTargetCanonical = CANONICAL_CHARACTERS.find((c) => c.id === "hu-tao");

  return {
    profile: DEMO_PLAYER_PROFILE,
    characters: charactersWithDetails,
    characterEventPity: DEMO_PLAYER_PROFILE.pityTrackers.find(
      (p) => p.bannerType === "CHARACTER_EVENT"
    ),
    nextTarget: nextTargetCanonical,
  };
}
