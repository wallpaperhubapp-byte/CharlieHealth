import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      {
        activity: [
          { action: "LOGIN", createdAt: new Date().toISOString(), demo: true },
        ],
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const activity = await prisma.auditLog.findMany({
      where: {
        userId: actor.userId,
        action: { in: ["LOGIN", "LOGOUT", "FAILED_LOGIN", "PASSWORD_CHANGED"] },
      },
      select: { action: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(
      { activity },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Login activity is temporarily unavailable.", 503);
  }
}
