import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  clearCsrfCookie,
  clearSessionCookie,
  isCsrfValid,
  readActor,
  requestOriginAllowed,
  writeAudit,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const actor = await readActor(request);
  if (!requestOriginAllowed(request) || !isCsrfValid(request, actor))
    return NextResponse.json(
      { error: "Please refresh the page and try again." },
      { status: 403 },
    );
  if (actor && !actor.demo && actor.sessionId) {
    try {
      await prisma.session.update({
        where: { id: actor.sessionId },
        data: { revokedAt: new Date() },
      });
    } catch {
      return NextResponse.json(
        { error: "Sign out is temporarily unavailable." },
        { status: 503 },
      );
    }
    await writeAudit("LOGOUT", actor.userId, "session", actor.sessionId);
  }
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearSessionCookie(response);
  clearCsrfCookie(response);
  return response;
}
