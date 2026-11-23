import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/pity — fetch all pity trackers for the active profile
export async function GET() {
  try {
    const profile = await prisma.playerProfile.findFirst({ orderBy: { createdAt: "asc" } });
    if (!profile) return NextResponse.json([]);

    const trackers = await prisma.pityTracker.findMany({
      where: { profileId: profile.id },
      orderBy: { bannerType: "asc" },
    });
    return NextResponse.json(trackers);
  } catch (err) {
    console.error("[GET /api/pity]", err);
    return NextResponse.json({ error: "Failed to load pity" }, { status: 500 });
  }
}

// POST /api/pity — upsert a pity tracker
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bannerType, currentPity, maxPity, isGuaranteed, targetCharacterId } = body;

    if (!bannerType) return NextResponse.json({ error: "bannerType is required" }, { status: 400 });

    const profile = await prisma.playerProfile.findFirst({ orderBy: { createdAt: "asc" } });
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

    const tracker = await prisma.pityTracker.upsert({
      where: { profileId_bannerType: { profileId: profile.id, bannerType } },
      create: {
        profileId: profile.id,
        bannerType,
        currentPity: currentPity ?? 0,
        maxPity: maxPity ?? 90,
        isGuaranteed: isGuaranteed ?? false,
        targetCharacterId: targetCharacterId ?? null,
      },
      update: {
        currentPity: currentPity ?? 0,
        maxPity: maxPity ?? 90,
        isGuaranteed: isGuaranteed ?? false,
        targetCharacterId: targetCharacterId ?? null,
      },
    });
    return NextResponse.json(tracker);
  } catch (err) {
    console.error("[POST /api/pity]", err);
    return NextResponse.json({ error: "Failed to upsert pity" }, { status: 500 });
  }
}
