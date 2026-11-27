import { LocalResourceRecord } from "@/lib/db/indexed-db";

export interface MaterialRequirementLine {
  itemId: string;
  requiredQuantity: number;
  ownedQuantity: number;
  remainingQuantity: number;
}

export class MaterialRequirementService {
  /**
   * Computes remainingQuantity = max(0, requiredQuantity - ownedQuantity)
   * using the centralized Dexie resource inventory.
   */
  static computeRemaining(
    requirements: { itemId: string; quantity: number }[],
    inventory: LocalResourceRecord[]
  ): MaterialRequirementLine[] {
    const ownedMap = new Map<string, number>();
    for (const item of inventory) {
      ownedMap.set(item.itemId, (ownedMap.get(item.itemId) ?? 0) + item.quantity);
    }

    return requirements.map((req) => {
      const owned = ownedMap.get(req.itemId) ?? 0;
      return {
        itemId: req.itemId,
        requiredQuantity: req.quantity,
        ownedQuantity: owned,
        remainingQuantity: Math.max(0, req.quantity - owned),
      };
    });
  }
}
