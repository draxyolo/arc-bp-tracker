import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.discordId) {
    return NextResponse.json({ ownedBlueprintIds: [] });
  }

  const discordId = session.user.discordId;

  const user = await prisma.user.upsert({
    where: { discordId },
    update: {},
    create: { discordId, ownedBlueprintIds: [] },
  });

  return NextResponse.json({ ownedBlueprintIds: user.ownedBlueprintIds });
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user?.discordId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const discordId = session.user.discordId;
  const body = await req.json();

  const ownedBlueprintIds = Array.isArray(body.ownedBlueprintIds)
    ? body.ownedBlueprintIds.filter((n: any) => Number.isInteger(n))
    : [];

  await prisma.user.upsert({
    where: { discordId },
    update: { ownedBlueprintIds },
    create: { discordId, ownedBlueprintIds },
  });

  return NextResponse.json({ ok: true });
}
