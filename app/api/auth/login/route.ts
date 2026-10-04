import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  applySessionCookie,
  clientIp,
  consumeRateLimit,
  csrfCookie,
  isCsrfValid,
  requestOriginAllowed,
  sha256,
  writeAudit,
} from "@/lib/security";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";

const credentials = z
  .object({
    email: z
      .string()
      .email()
      .max(254)
      .transform((value) => value.trim().toLowerCase()),
    password: z.string().min(12).max(128),
    rememberMe: z.boolean().optional().default(false),
  })
  .strict();

function limited(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many sign-in attempts. Please wait before trying again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request) || !isCsrfValid(request))
    return NextResponse.json(
      { error: "Please refresh the page and try again." },
      { status: 403 },
    );
  const address = clientIp(request);
  const networkLimit = await consumeRateLimit(`login:${address}`, 20);
  if (networkLimit.limited) return limited(networkLimit.retryAfter);

  let input: z.infer<typeof credentials>;
  try {
    input = credentials.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Enter a valid work email and password." },
      { status: 400 },
    );
  }

  const credentialLimit = await consumeRateLimit(
    `credential:${address}:${sha256(input.email)}`,
    8,
  );
  if (credentialLimit.limited) return limited(credentialLimit.retryAfter);

  try {
    const account = await prisma.user.findUnique({
      where: { email: input.email },
      include: { employee: { include: { department: true } } },
    });
    if (!account || !account.employee || account.employee.status !== "ACTIVE") {
      await writeAudit("FAILED_LOGIN", account?.id, "session");
      return NextResponse.json(
        {
          error:
            "We couldn’t sign you in with those details. Try again or contact People Operations.",
        },
        { status: 401 },
      );
    }
    if (account.lockedUntil && account.lockedUntil > new Date()) {
      const retryAfter = Math.max(
        1,
        Math.ceil((account.lockedUntil.getTime() - Date.now()) / 1000),
      );
      await writeAudit("LOGIN_THROTTLED", account.id, "session");
      return limited(retryAfter);
    }

    let validPassword = false;
    try {
      validPassword = await argon2.verify(account.passwordHash, input.password);
    } catch {
      validPassword = false;
    }
    if (!validPassword) {
      const failedAttempts = account.failedLoginAttempts + 1;
      const locked = await prisma.user.update({
        where: { id: account.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          ...(failedAttempts >= 5
            ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
            : {}),
        },
        select: { lockedUntil: true },
      });
      await writeAudit("FAILED_LOGIN", account.id, "session");
      return NextResponse.json(
        {
          error: locked.lockedUntil
            ? "This account is temporarily locked after several unsuccessful attempts. Please wait 15 minutes or contact People Operations."
            : "We couldn’t sign you in with those details. Try again or contact People Operations.",
        },
        { status: locked.lockedUntil ? 423 : 401 },
      );
    }

    const csrf = csrfCookie(request);
    if (!csrf)
      return NextResponse.json(
        { error: "Please refresh the page and try again." },
        { status: 403 },
      );
    const token = randomBytes(32).toString("hex");
    const sessionDuration = input.rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
    const session = await prisma.session.create({
      data: {
        userId: account.id,
        tokenHash: sha256(token),
        csrfHash: sha256(csrf),
        expiresAt: new Date(Date.now() + sessionDuration * 1000),
      },
    });
    await prisma.user.update({
      where: { id: account.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
    await writeAudit("LOGIN", account.id, "session", session.id);

    const response = NextResponse.json(
      {
        user: {
          name: `${account.employee.preferredName || account.employee.legalFirstName} ${account.employee.lastName}`,
          employeeId: account.employee.employeeNumber,
          role: account.role,
          title: account.employee.jobTitle,
          department: account.employee.department?.name ?? "Team member",
          demo: false,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
    applySessionCookie(response, token, sessionDuration);
    return response;
  } catch {
    return NextResponse.json(
      {
        error: "Sign-in is temporarily unavailable. Please try again shortly.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
