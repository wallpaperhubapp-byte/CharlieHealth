import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  consumeRateLimit,
  isCsrfValid,
  requestOriginAllowed,
  sha256,
  writeAudit,
} from "@/lib/security";
import { strongPassword } from "@/lib/password-policy";

export const dynamic = "force-dynamic";
const schema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/i),
    password: strongPassword,
  })
  .strict();

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request) || !isCsrfValid(request))
    return NextResponse.json(
      { error: "Please refresh the page and try again." },
      { status: 403 },
    );
  const limit = await consumeRateLimit(
    `reset-token:${request.headers.get("x-csrf-token") ?? "missing"}`,
    20,
  );
  if (limit.limited)
    return NextResponse.json(
      { error: "Please wait and try again." },
      { status: 429 },
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      {
        error:
          "Choose a password with at least 12 characters, including uppercase, lowercase, a number and a symbol.",
      },
      { status: 400 },
    );
  try {
    const account = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: sha256(parsed.data.token),
        passwordResetExpiresAt: { gt: new Date() },
      },
    });
    if (!account)
      return NextResponse.json(
        {
          error:
            "This reset link has expired or was already used. Request a new one.",
        },
        { status: 400 },
      );
    const passwordHash = await argon2.hash(parsed.data.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    await prisma.$transaction([
      prisma.user.update({
        where: { id: account.id },
        data: {
          passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.session.updateMany({
        where: { userId: account.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    await writeAudit("PASSWORD_CHANGED", account.id, "account");
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Password reset is temporarily unavailable." },
      { status: 503 },
    );
  }
}
