import * as genshindb from "genshin-db";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const isDryRun = process.argv.includes("--dry-run");
const isVerify = process.argv.includes("--verify");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const names = genshindb.weapons("names", { matchCategories: true }) as string[];
  console.log(`[Weapon Importer] Discovered ${names.length} weapons from genshin-db.`);

  const records: Array<{
    id: string;
    weapon: Record<string, unknown>;
    stats: Record<string, unknown>;
    passive: Record<string, unknown>;
    refinements: Record<string, unknown>;
    materials: Record<string, unknown>;
  }> = [];

  let rejected = 0;
  const seenIds = new Set<string>();

  for (const name of names) {
    const w = genshindb.weapons(name);
    if (!w || !w.name || !w.weaponText) {
      rejected++;
      continue;
    }

    const id = slugify(w.name);
    if (seenIds.has(id)) {
      rejected++;
      continue;
    }
    seenIds.add(id);

    const now = new Date().toISOString();
    records.push({
      id,
      weapon: {
        id,
        name: w.name,
        weaponType: w.weaponText,
        rarity: Number(w.rarity) || 3,
        baseAtk: w.baseAtkValue ?? 0,
        secondaryStatType: w.mainStatText ?? "",
        secondaryStatValue: w.baseStatText ?? "",
        iconUrl: w.images?.mihoyo_icon || w.images?.icon || "",
        awakenIconUrl: w.images?.mihoyo_awakenIcon || w.images?.awakenicon || "",
        gameVersion: w.version ?? "",
        source: "genshin-db (theBowja/genshin-db)",
        updatedAt: now,
      },
      stats: {
        weaponId: id,
        lv1: w.stats?.(1) ?? null,
        lv90: w.stats?.(90) ?? null,
        updatedAt: now,
      },
      passive: {
        weaponId: id,
        effectName: w.effectName ?? "",
        effectTemplateRaw: w.effectTemplateRaw ?? "",
        description: w.description ?? "",
        updatedAt: now,
      },
      refinements: {
        weaponId: id,
        r1: w.r1 ?? null,
        r2: w.r2 ?? null,
        r3: w.r3 ?? null,
        r4: w.r4 ?? null,
        r5: w.r5 ?? null,
        updatedAt: now,
      },
      materials: {
        weaponId: id,
        costs: w.costs ?? null,
        updatedAt: now,
      },
    });
  }

  console.log(`[Weapon Importer] Validated: ${records.length} | Rejected: ${rejected}`);

  if (isDryRun) {
    console.log("[Weapon Importer] Dry-run sample:", JSON.stringify(records[0]?.weapon, null, 2));
    return;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || "genshincharactergetter",
    });
  }

  const db = getFirestore();

  if (isVerify) {
    const snap = await db.collection("weapons").get();
    console.log(`[Weapon Importer] Verified ${snap.size} weapon documents in Firestore.`);
    return;
  }

  let batch = db.batch();
  let ops = 0;

  for (const rec of records) {
    batch.set(db.collection("weapons").doc(rec.id), rec.weapon, { merge: true });
    batch.set(db.collection("weapon_stats").doc(rec.id), rec.stats, { merge: true });
    batch.set(db.collection("weapon_passives").doc(rec.id), rec.passive, { merge: true });
    batch.set(db.collection("weapon_refinements").doc(rec.id), rec.refinements, { merge: true });
    batch.set(db.collection("weapon_ascension_materials").doc(rec.id), rec.materials, { merge: true });
    ops += 5;

    if (ops >= 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
  }

  console.log(`[Weapon Importer] Import complete! Imported ${records.length} weapons into Firestore.`);
}

main().catch((err) => {
  console.error("[Weapon Importer] Failed:", err);
  process.exit(1);
});
