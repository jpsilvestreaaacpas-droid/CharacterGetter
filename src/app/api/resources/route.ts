import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/resources — list all resources for the active profile
export async function GET() {
  try {
    const profile = await prisma.playerProfile.findFirst({ orderBy: { createdAt: "asc" } });
    if (!profile) return NextResponse.json([]);

    const resources = await prisma.playerResource.findMany({
      where: { profileId: profile.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(resources);
  } catch (err) {
    console.error("[GET /api/resources]", err);
    return NextResponse.json({ error: "Failed to load resources" }, { status: 500 });
  }
}

// POST /api/resources — upsert a resource quantity
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, name, resourceType, quantity, targetQuantity } = body;

    if (!itemId || !name || !resourceType) {
      return NextResponse.json({ error: "itemId, name, resourceType are required" }, { status: 400 });
    }

    const profile = await prisma.playerProfile.findFirst({ orderBy: { createdAt: "asc" } });
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

    const resource = await prisma.playerResource.upsert({
      where: { id: `${profile.id}-${itemId}` },
      create: {
        id: `${profile.id}-${itemId}`,
        profileId: profile.id,
        itemId,
        name,
        resourceType,
        quantity: quantity ?? 0,
        targetQuantity: targetQuantity ?? 0,
      },
      update: {
        quantity: quantity ?? 0,
        targetQuantity: targetQuantity ?? 0,
      },
    });
    return NextResponse.json(resource);
  } catch (err) {
    console.error("[POST /api/resources]", err);
    return NextResponse.json({ error: "Failed to upsert resource" }, { status: 500 });
  }
}
