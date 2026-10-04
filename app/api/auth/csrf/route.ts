import { NextRequest, NextResponse } from "next/server";
import {
  applyCsrfCookie,
  applySessionCookie,
  csrfCookie,
  createDemoSession,
  PRIVATE_HEADERS,
  readActor,
  sha256,
} from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let token = csrfCookie(request);
  const actor = await readActor(request);
  let renewDemoSession = false;
  if (!token) {
    token = randomBytes(32).toString("hex");
    if (actor?.demo) renewDemoSession = true;
    else if (actor?.sessionId) {
      try {
        await prisma.session.update({
          where: { id: actor.sessionId },
          data: { csrfHash: sha256(token) },
        });
      } catch {
        return NextResponse.json(
          { error: "Your session couldn’t be renewed." },
          { status: 503, headers: PRIVATE_HEADERS },
        );
      }
    }
  }
  const response = NextResponse.json(
    { csrfToken: token },
    { headers: PRIVATE_HEADERS },
  );
  applyCsrfCookie(response, token);
  if (renewDemoSession) applySessionCookie(response, createDemoSession(token));
  return response;
}
