import { NextRequest, NextResponse } from "next/server";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      {
        sessions: [
          {
            id: "demo-current",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
            current: true,
          },
        ],
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: actor.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, createdAt: true, expiresAt: true, lastActive: true },
      orderBy: { lastActive: "desc" },
      take: 25,
    });
    return NextResponse.json(
      {
        sessions: sessions.map((session) => ({
          ...session,
          current: session.id === actor.sessionId,
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Your active sessions are temporarily unavailable.", 503);
  }
}

export async function POST(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      { ok: true, demo: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    await prisma.session.updateMany({
      where: {
        userId: actor.userId,
        id: { not: actor.sessionId },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    await writeAudit("OTHER_SESSIONS_REVOKED", actor.userId, "session");
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("Other sessions couldn’t be signed out.", 503);
  }
}
