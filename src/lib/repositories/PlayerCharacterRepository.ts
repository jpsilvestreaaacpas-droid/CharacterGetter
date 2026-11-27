import { localDb, LocalCharacterRecord, LocalCharacterProgression } from "@/lib/db/indexed-db";
import { localPlayerRepo } from "@/lib/repositories/LocalPlayerRepository";
import { CANONICAL_CHARACTERS } from "@/lib/data/canonical-characters";
import { playerWeaponRepo } from "@/lib/repositories/PlayerWeaponRepository";

export interface OwnedCharacterWithProgress {
  characterId: string;
  owned: boolean;
  constellation: number;
  level: number;
  ascension: number;
  friendshipLevel: number;
  talentNormal: number;
  talentSkill: number;
  talentBurst: number;
  updatedAt: string;
}

export class PlayerCharacterRepository {
  async addCharacter(characterId: string): Promise<OwnedCharacterWithProgress> {
    await localPlayerRepo.initialize();
    const def = CANONICAL_CHARACTERS.find((c) => c.id === characterId);
    if (!def) {
      throw new Error(`Character not found in shared catalog: ${characterId}`);
    }

    const existing = await localDb.characters.get(characterId);
    if (existing && existing.owned) {
      throw new Error(`${def.name} is already in your collection.`);
    }

    const now = new Date().toISOString();
    const charRecord: LocalCharacterRecord = {
      characterId,
      owned: true,
      constellation: 0,
      obtainedAt: now,
      updatedAt: now,
    };

    const progRecord: LocalCharacterProgression = {
      characterId,
      level: 1,
      ascension: 0,
      friendshipLevel: 1,
      talentNormal: 1,
      talentSkill: 1,
      talentBurst: 1,
      targetLevel: 90,
      targetAscension: 6,
      targetTalentNormal: 8,
      targetTalentSkill: 8,
      targetTalentBurst: 8,
      updatedAt: now,
    };

    await localDb.transaction("rw", [localDb.characters, localDb.characterProgression], async () => {
      await localDb.characters.put(charRecord);
      await localDb.characterProgression.put(progRecord);
    });

    return {
      characterId,
      owned: true,
      constellation: 0,
      level: 1,
      ascension: 0,
      friendshipLevel: 1,
      talentNormal: 1,
      talentSkill: 1,
      talentBurst: 1,
      updatedAt: now,
    };
  }

  async updateProgression(
    characterId: string,
    updates: Partial<{
      level: number;
      ascension: number;
      constellation: number;
      friendshipLevel: number;
      talentNormal: number;
      talentSkill: number;
      talentBurst: number;
    }>
  ): Promise<void> {
    await localPlayerRepo.initialize();
    const now = new Date().toISOString();

    await localDb.transaction("rw", [localDb.characters, localDb.characterProgression], async () => {
      const existingChar = await localDb.characters.get(characterId);
      const existingProg = await localDb.characterProgression.get(characterId);

      if (updates.constellation !== undefined) {
        const constellation = Math.max(0, Math.min(6, Math.floor(updates.constellation)));
        await localDb.characters.put({
          characterId,
          owned: existingChar?.owned ?? true,
          constellation,
          obtainedAt: existingChar?.obtainedAt ?? now,
          updatedAt: now,
        });
      }

      const level =
        updates.level !== undefined
          ? Math.max(1, Math.min(90, Math.floor(updates.level)))
          : existingProg?.level ?? 1;
      const ascension =
        updates.ascension !== undefined
          ? Math.max(0, Math.min(6, Math.floor(updates.ascension)))
          : existingProg?.ascension ?? 0;
      const friendshipLevel =
        updates.friendshipLevel !== undefined
          ? Math.max(1, Math.min(10, Math.floor(updates.friendshipLevel)))
          : existingProg?.friendshipLevel ?? 1;

      await localDb.characterProgression.put({
        characterId,
        level,
        ascension,
        friendshipLevel,
        talentNormal:
          updates.talentNormal !== undefined
            ? Math.max(1, Math.min(10, Math.floor(updates.talentNormal)))
            : existingProg?.talentNormal ?? 1,
        talentSkill:
          updates.talentSkill !== undefined
            ? Math.max(1, Math.min(10, Math.floor(updates.talentSkill)))
            : existingProg?.talentSkill ?? 1,
        talentBurst:
          updates.talentBurst !== undefined
            ? Math.max(1, Math.min(10, Math.floor(updates.talentBurst)))
            : existingProg?.talentBurst ?? 1,
        targetLevel: existingProg?.targetLevel ?? 90,
        targetAscension: existingProg?.targetAscension ?? 6,
        targetTalentNormal: existingProg?.targetTalentNormal ?? 8,
        targetTalentSkill: existingProg?.targetTalentSkill ?? 8,
        targetTalentBurst: existingProg?.targetTalentBurst ?? 8,
        updatedAt: now,
      });
    });
  }

  /**
   * Removes a character from the player's local collection.
   * Safely unequips any weapon without deleting the weapon or shared catalog.
   */
  async removeCharacter(characterId: string): Promise<void> {
    await localPlayerRepo.initialize();
    await playerWeaponRepo.unequipCharacter(characterId);
    await localDb.transaction("rw", [localDb.characters, localDb.characterProgression], async () => {
      await localDb.characters.delete(characterId);
      await localDb.characterProgression.delete(characterId);
    });
  }
}

export const playerCharacterRepo = new PlayerCharacterRepository();
