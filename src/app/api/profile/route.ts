import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/profile — fetch or create the default player profile
export async function GET() {
  try {
    let profile = await prisma.playerProfile.findFirst({ orderBy: { createdAt: "asc" } });
    if (!profile) {
      profile = await prisma.playerProfile.create({
        data: { travelerName: "Traveler", isDemo: false },
      });
    }
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// PATCH /api/profile — update mutable fields
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = await prisma.playerProfile.findFirst({ orderBy: { createdAt: "asc" } });
    if (!profile) return NextResponse.json({ error: "No profile found" }, { status: 404 });

    const updated = await prisma.playerProfile.update({
      where: { id: profile.id },
      data: {
        travelerName: body.travelerName,
        adventureRank: body.adventureRank,
        worldLevel: body.worldLevel,
        signature: body.signature,
        primogems: body.primogems,
        intertwinedFates: body.intertwinedFates,
        acquaintFates: body.acquaintFates,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
