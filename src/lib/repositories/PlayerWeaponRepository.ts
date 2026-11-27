import { localDb, LocalWeaponRecord } from "@/lib/db/indexed-db";
import { localPlayerRepo } from "@/lib/repositories/LocalPlayerRepository";
import { WEAPON_CATALOG } from "@/lib/data/weapon-catalog";

export class PlayerWeaponRepository {
  async getAll(): Promise<LocalWeaponRecord[]> {
    await localPlayerRepo.initialize();
    return localDb.weapons.toArray();
  }

  async addWeapon(input: {
    weaponId: string;
    name?: string;
    level?: number;
    ascension?: number;
    refinement?: number;
    equippedTo?: string;
  }): Promise<LocalWeaponRecord> {
    await localPlayerRepo.initialize();
    const def = WEAPON_CATALOG.find((w) => w.id === input.weaponId);
    const weaponName = input.name || def?.name || input.weaponId;

    const now = new Date().toISOString();
    const instance: LocalWeaponRecord = {
      id: `wpn_${input.weaponId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      weaponId: input.weaponId,
      name: weaponName,
      level: Math.max(1, Math.min(90, Math.floor(input.level ?? 1))),
      ascension: Math.max(0, Math.min(6, Math.floor(input.ascension ?? 0))),
      refinement: Math.max(1, Math.min(5, Math.floor(input.refinement ?? 1))),
      equippedTo: input.equippedTo,
      updatedAt: now,
    };

    if (instance.equippedTo) {
      await this.unequipCharacter(instance.equippedTo);
    }

    await localDb.weapons.put(instance);
    return instance;
  }

  async updateWeapon(
    instanceId: string,
    updates: Partial<Pick<LocalWeaponRecord, "level" | "ascension" | "refinement">>
  ): Promise<LocalWeaponRecord> {
    await localPlayerRepo.initialize();
    const existing = await localDb.weapons.get(instanceId);
    if (!existing) throw new Error(`Weapon instance not found: ${instanceId}`);

    const next: LocalWeaponRecord = {
      ...existing,
      level:
        updates.level !== undefined
          ? Math.max(1, Math.min(90, Math.floor(updates.level)))
          : existing.level,
      ascension:
        updates.ascension !== undefined
          ? Math.max(0, Math.min(6, Math.floor(updates.ascension)))
          : existing.ascension,
      refinement:
        updates.refinement !== undefined
          ? Math.max(1, Math.min(5, Math.floor(updates.refinement)))
          : existing.refinement,
      updatedAt: new Date().toISOString(),
    };
    await localDb.weapons.put(next);
    return next;
  }

  /**
   * Equips a weapon instance to a character.
   * Enforces that a weapon instance can only be equipped by ONE character at a time,
   * and a character can only equip ONE weapon at a time.
   */
  async equipWeapon(instanceId: string, characterId: string): Promise<void> {
    await localPlayerRepo.initialize();
    await localDb.transaction("rw", localDb.weapons, async () => {
      const target = await localDb.weapons.get(instanceId);
      if (!target) throw new Error(`Weapon instance not found: ${instanceId}`);

      // Unequip any other weapon currently equipped by this character
      await this.unequipCharacter(characterId);

      // Equip this instance exclusively to characterId
      await localDb.weapons.update(instanceId, {
        equippedTo: characterId,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  async unequipWeapon(instanceId: string): Promise<void> {
    await localPlayerRepo.initialize();
    await localDb.weapons.update(instanceId, {
      equippedTo: undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  async unequipCharacter(characterId: string): Promise<void> {
    const equipped = await localDb.weapons.where("equippedTo").equals(characterId).toArray();
    const now = new Date().toISOString();
    for (const w of equipped) {
      await localDb.weapons.update(w.id, { equippedTo: undefined, updatedAt: now });
    }
  }

  async deleteWeapon(instanceId: string): Promise<void> {
    await localPlayerRepo.initialize();
    await localDb.weapons.delete(instanceId);
  }
}

export const playerWeaponRepo = new PlayerWeaponRepository();
