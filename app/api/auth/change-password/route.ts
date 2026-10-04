import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, writeAudit } from "@/lib/security";
import { strongPassword } from "@/lib/password-policy";

export const dynamic = "force-dynamic";
const schema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: strongPassword,
  })
  .strict();

export async function POST(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  if (actor.demo)
    return jsonError(
      "Password changes are unavailable for fictional demo accounts.",
      501,
    );
  const limit = await consumeRateLimit(`password-change:${actor.userId}`, 5);
  if (limit.limited)
    return jsonError(
      "Too many password change attempts. Please wait and try again.",
      429,
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return jsonError(
      "Use a password with at least 12 characters, including uppercase, lowercase, a number and a symbol.",
      400,
    );
  try {
    const user = await prisma.user.findUnique({
      where: { id: actor.userId },
      select: { passwordHash: true },
    });
    if (
      !user ||
      !(await argon2.verify(user.passwordHash, parsed.data.currentPassword))
    )
      return jsonError("Your current password couldn’t be verified.", 403);
    const passwordHash = await argon2.hash(parsed.data.newPassword, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    await prisma.$transaction([
      prisma.user.update({
        where: { id: actor.userId },
        data: { passwordHash },
      }),
      prisma.session.updateMany({
        where: {
          userId: actor.userId,
          id: { not: actor.sessionId },
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      }),
    ]);
    await writeAudit("PASSWORD_CHANGED", actor.userId, "account");
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError(
      "Your password couldn’t be changed. Please try again.",
      503,
    );
  }
}
