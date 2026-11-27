import { WeaponDefinition } from "@/lib/data/weapon-catalog";
import { LocalWeaponRecord } from "@/lib/db/indexed-db";

export interface CharacterRef {
  id: string;
  name: string;
  weaponType: string;
}

export interface WeaponCompatibilityReport {
  weaponInstanceId: string;
  weaponName: string;
  weaponType: string;
  currentlyEquippedBy?: string;
  compatibleCharacters: CharacterRef[];
  compatibleUnassigned: CharacterRef[];
  compatibleWithOtherWeapon: CharacterRef[];
}

export class WeaponCompatibilityService {
  /**
   * Determines compatibility strictly by weaponType (Sword, Claymore, Polearm, Bow, Catalyst).
   * Compatibility is kept separate from build suitability/recommendations.
   */
  static isCompatible(characterWeaponType: string, weaponType: string): boolean {
    return characterWeaponType.toLowerCase() === weaponType.toLowerCase();
  }

  static analyzeWeaponForRoster(
    instance: LocalWeaponRecord,
    weaponDef: WeaponDefinition,
    roster: CharacterRef[],
    allOwnedWeapons: LocalWeaponRecord[]
  ): WeaponCompatibilityReport {
    const compatibleCharacters = roster.filter((c) =>
      this.isCompatible(c.weaponType, weaponDef.weaponType)
    );

    const equippedByCharId = new Map<string, LocalWeaponRecord>();
    for (const w of allOwnedWeapons) {
      if (w.equippedTo) equippedByCharId.set(w.equippedTo, w);
    }

    const compatibleUnassigned: CharacterRef[] = [];
    const compatibleWithOtherWeapon: CharacterRef[] = [];

    for (const char of compatibleCharacters) {
      if (instance.equippedTo === char.id) continue;
      const other = equippedByCharId.get(char.id);
      if (other && other.id !== instance.id) {
        compatibleWithOtherWeapon.push(char);
      } else {
        compatibleUnassigned.push(char);
      }
    }

    return {
      weaponInstanceId: instance.id,
      weaponName: weaponDef.name,
      weaponType: weaponDef.weaponType,
      currentlyEquippedBy: instance.equippedTo,
      compatibleCharacters,
      compatibleUnassigned,
      compatibleWithOtherWeapon,
    };
  }
}
