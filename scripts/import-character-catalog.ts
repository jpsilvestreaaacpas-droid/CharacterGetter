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

function normalizeElement(el?: string): string {
  const valid = ["Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];
  if (!el) return "Adaptive";
  const match = valid.find((v) => v.toLowerCase() === el.toLowerCase());
  return match ?? el;
}

function normalizeWeapon(wt?: string): string {
  const valid = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];
  if (!wt) return "Sword";
  const match = valid.find((v) => v.toLowerCase() === wt.toLowerCase());
  return match ?? wt;
}

async function main() {
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  console.log(`[Catalog Importer] Discovered ${names.length} characters from genshin-db.`);

  const records: Array<{
    id: string;
    character: Record<string, unknown>;
    talents?: Record<string, unknown>;
    constellations?: Record<string, unknown>;
  }> = [];

  let rejected = 0;
  let missingFields = 0;
  const seenIds = new Set<string>();

  for (const name of names) {
    const c = genshindb.characters(name);
    if (!c || !c.name) {
      rejected++;
      continue;
    }

    const id = slugify(c.name);
    if (seenIds.has(id)) {
      rejected++;
      continue;
    }
    seenIds.add(id);

    const hasImages = Boolean(c.images?.mihoyo_icon || c.images?.icon);
    if (!hasImages) missingFields++;

    const talents = genshindb.talents(name);
    const constellations = genshindb.constellations(name);

    records.push({
      id,
      character: {
        id,
        name: c.name,
        title: c.title ?? "",
        element: normalizeElement(c.elementText),
        weaponType: normalizeWeapon(c.weaponText),
        rarity: Number(c.rarity) === 5 ? 5 : 4,
        region: c.region ?? "Unknown",
        affiliation: c.affiliation ?? "",
        birthday: c.birthday ?? "",
        description: c.description ?? "",
        substat: c.substatText ?? "",
        portraitUrl: c.images?.mihoyo_icon || c.images?.icon || "",
        splashUrl: c.images?.cover1 || "",
        releaseVersion: c.version ?? "",
        source: "genshin-db (theBowja/genshin-db)",
        verificationStatus: "VERIFIED",
        updatedAt: new Date().toISOString(),
      },
      talents: talents
        ? {
            characterId: id,
            combat1: talents.combat1 ?? null,
            combat2: talents.combat2 ?? null,
            combat3: talents.combat3 ?? null,
            passive1: talents.passive1 ?? null,
            passive2: talents.passive2 ?? null,
            passive3: talents.passive3 ?? null,
            costs: talents.costs ?? null,
            updatedAt: new Date().toISOString(),
          }
        : undefined,
      constellations: constellations
        ? {
            characterId: id,
            c1: constellations.c1 ?? null,
            c2: constellations.c2 ?? null,
            c3: constellations.c3 ?? null,
            c4: constellations.c4 ?? null,
            c5: constellations.c5 ?? null,
            c6: constellations.c6 ?? null,
            updatedAt: new Date().toISOString(),
          }
        : undefined,
    });
  }

  console.log(
    `[Catalog Importer] Validated: ${records.length} | Rejected: ${rejected} | Missing optional fields: ${missingFields}`
  );

  if (isDryRun) {
    console.log("[Catalog Importer] Dry-run complete. Sample record:", JSON.stringify(records[0]?.character, null, 2));
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
    const snap = await db.collection("characters").get();
    console.log(`[Catalog Importer] Verified ${snap.size} character documents in Firestore.`);
    return;
  }

  let created = 0;
  let updated = 0;
  const existingSnap = await db.collection("characters").select().get();
  const existingIds = new Set(existingSnap.docs.map((d) => d.id));

  // Batch writes (max 450 ops per batch to stay safely under 500)
  let batch = db.batch();
  let ops = 0;

  for (const rec of records) {
    if (existingIds.has(rec.id)) updated++;
    else created++;

    batch.set(db.collection("characters").doc(rec.id), rec.character, { merge: true });
    ops++;

    if (rec.talents) {
      batch.set(db.collection("character_talents").doc(rec.id), rec.talents, { merge: true });
      ops++;
    }
    if (rec.constellations) {
      batch.set(db.collection("character_constellations").doc(rec.id), rec.constellations, { merge: true });
      ops++;
    }

    if (ops >= 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
  }

  console.log(
    `[Catalog Importer] Import complete! Discovered: ${records.length}, New: ${created}, Updated: ${updated}, Rejected: ${rejected}`
  );
}

main().catch((err) => {
  console.error("[Catalog Importer] Failed:", err);
  process.exit(1);
});
