import { NextResponse } from "next/server";

export const revalidate = 3600; // cache for 1 hour

const FANDOM_API =
  "https://genshin-impact.fandom.com/api.php";

// Only keep filenames that follow the actual emoji pattern
const EMOJI_PATTERN = /^Icon_Emoji_Paimon(?:'s|s)_Paintings_\d+_[A-Za-z_]+_?\d*\.png$/;

interface FandomImageInfo {
  title: string;
  imageinfo?: { url: string }[];
}

interface FandomQueryResponse {
  query?: {
    pages?: Record<string, FandomImageInfo>;
  };
  "query-continue"?: { images?: { imcontinue?: string } };
  continue?: { imcontinue?: string };
}

async function fetchPageImages(): Promise<string[]> {
  const allImages: string[] = [];
  let imcontinue: string | undefined;

  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({
      action: "query",
      titles: "Chat/Gallery",
      prop: "images",
      imlimit: "500",
      format: "json",
      origin: "*",
    });
    if (imcontinue) params.set("imcontinue", imcontinue);

    const res = await fetch(`${FANDOM_API}?${params}`, {
      headers: { "User-Agent": "CharacterGetter/1.0 (non-commercial fan companion)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;

    const data = (await res.json()) as FandomQueryResponse;
    const pages = data?.query?.pages ?? {};
    for (const pg of Object.values(pages)) {
      const imgs = (pg as { images?: { title: string }[] }).images ?? [];
      for (const img of imgs) {
        const name = img.title.replace("File:", "").replace(/\s/g, "_");
        if (EMOJI_PATTERN.test(name)) allImages.push(name);
      }
    }

    const cont =
      data?.continue?.imcontinue ??
      (data as FandomQueryResponse & { "query-continue": { images: { imcontinue: string } } })?.[
        "query-continue"
      ]?.images?.imcontinue;
    if (!cont) break;
    imcontinue = cont;
  }

  return allImages;
}

async function resolveImageUrls(
  filenames: string[]
): Promise<{ filename: string; url: string; character: string; set: string }[]> {
  const results: { filename: string; url: string; character: string; set: string }[] = [];

  // Batch into groups of 25 for the API
  for (let i = 0; i < filenames.length; i += 25) {
    const batch = filenames.slice(i, i + 25);
    const titles = batch.map((f) => `File:${f.replace(/_/g, " ")}`).join("|");
    const params = new URLSearchParams({
      action: "query",
      titles,
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
      origin: "*",
    });

    try {
      const res = await fetch(`${FANDOM_API}?${params}`, {
        headers: { "User-Agent": "CharacterGetter/1.0 (non-commercial fan companion)" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) continue;

      const data = (await res.json()) as FandomQueryResponse;
      const pages = data?.query?.pages ?? {};
      for (const pg of Object.values(pages)) {
        const url = pg.imageinfo?.[0]?.url;
        if (!url) continue;
        // Clean up filename for matching
        const filename = pg.title
          .replace("File:", "")
          .replace(/\s/g, "_")
          .replace(/'/g, "s"); // "Paimon's" → "Paimons"

        // Extract character name from filename pattern
        const match = filename.match(
          /Icon_Emoji_Paimons_Paintings_(\d+)_([A-Za-z_]+?)_?(\d+)?\.png/
        );
        const setNum = match?.[1] ?? "00";
        const charName = match?.[2]?.replace(/_/g, " ") ?? "Unknown";

        results.push({
          filename,
          url,
          character: charName,
          set: `Paimon's Paintings Set ${setNum}`,
        });
      }
    } catch {
      // Silently skip failed batches
    }
  }

  return results;
}

export async function GET() {
  try {
    const filenames = await fetchPageImages();

    if (filenames.length === 0) {
      return NextResponse.json(
        { error: "Could not retrieve emoji list from Fandom. API may be temporarily unavailable.", emojis: [] },
        { status: 503 }
      );
    }

    const resolved = await resolveImageUrls(filenames);

    // Deduplicate by filename
    const seen = new Set<string>();
    const emojis = resolved.filter((e) => {
      if (seen.has(e.filename)) return false;
      seen.add(e.filename);
      return true;
    });

    return NextResponse.json(
      {
        emojis,
        total: emojis.length,
        source: "https://genshin-impact.fandom.com/wiki/Chat/Gallery",
        attribution:
          "© miHoYo / HoYoverse. Used for non-commercial fan companion purposes under HoYoverse fan content guidelines.",
        cachedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (err) {
    console.error("[chat-emojis API]", err);
    return NextResponse.json(
      { error: "Internal error fetching chat emojis.", emojis: [] },
      { status: 500 }
    );
  }
}
