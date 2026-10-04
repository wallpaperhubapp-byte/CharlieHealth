import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "ch_session";
export const CSRF_COOKIE = "ch_csrf";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type Actor = {
  userId: string;
  role: string;
  employeeId: string;
  employeeNumber?: string;
  sessionId?: string;
  csrfHash?: string;
  demo: boolean;
  name: string;
};

type DemoClaims = {
  sub: "demo-employee";
  role: "EMPLOYEE";
  employeeId: "DEMO-1042";
  name: "Alex Morgan";
  csrf: string;
  exp: number;
};

export function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    secret.toLowerCase().includes("replace-with")
  ) {
    throw new Error(
      "AUTH_SECRET must be set to a unique value with at least 32 characters.",
    );
  }
  return secret;
}

export function isDemoEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEMO_ACCESS !== "false"
  );
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function secureEqual(first: string, second: string): boolean {
  const firstBytes = Buffer.from(first);
  const secondBytes = Buffer.from(second);
  return (
    firstBytes.length === secondBytes.length &&
    timingSafeEqual(firstBytes, secondBytes)
  );
}

function sign(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

export function readDemoSession(value: string): DemoClaims | null {
  if (!isDemoEnabled()) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  try {
    if (!secureEqual(sign(payload), signature)) return null;
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as DemoClaims;
    if (
      claims.sub !== "demo-employee" ||
      claims.role !== "EMPLOYEE" ||
      claims.exp <= Date.now() ||
      typeof claims.csrf !== "string"
    )
      return null;
    return claims;
  } catch {
    return null;
  }
}

export function createDemoSession(csrf: string): string {
  const claims: DemoClaims = {
    sub: "demo-employee",
    role: "EMPLOYEE",
    employeeId: "DEMO-1042",
    name: "Alex Morgan",
    csrf,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function readActor(request: NextRequest): Promise<Actor | null> {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  const demoClaims = readDemoSession(sessionToken);
  if (demoClaims) {
    return {
      userId: demoClaims.sub,
      role: demoClaims.role,
      employeeId: demoClaims.employeeId,
      employeeNumber: demoClaims.employeeId,
      name: demoClaims.name,
      demo: true,
      csrfHash: sha256(demoClaims.csrf),
    };
  }

  if (!/^[a-f0-9]{64}$/i.test(sessionToken)) return null;
  try {
    const session = await prisma.session.findFirst({
      where: {
        tokenHash: sha256(sessionToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: { include: { employee: true } } },
    });
    if (!session?.user.employee || session.user.employee.status !== "ACTIVE")
      return null;
    void prisma.session
      .update({ where: { id: session.id }, data: { lastActive: new Date() } })
      .catch(() => {});
    return {
      userId: session.user.id,
      role: session.user.role,
      employeeId: session.user.employee.id,
      employeeNumber: session.user.employee.employeeNumber,
      name: `${session.user.employee.preferredName || session.user.employee.legalFirstName} ${session.user.employee.lastName}`,
      sessionId: session.id,
      csrfHash: session.csrfHash,
      demo: false,
    };
  } catch {
    return null;
  }
}

export function csrfCookie(request: NextRequest): string | null {
  const token = request.cookies.get(CSRF_COOKIE)?.value;
  return token && /^[a-f0-9]{64}$/i.test(token) ? token : null;
}

export function isCsrfValid(
  request: NextRequest,
  actor?: Actor | null,
): boolean {
  const cookie = csrfCookie(request);
  const header = request.headers.get("x-csrf-token");
  if (!cookie || !header || !secureEqual(cookie, header)) return false;
  return !actor?.csrfHash || secureEqual(sha256(cookie), actor.csrfHash);
}

export function applySessionCookie(
  response: NextResponse,
  session: string,
  maxAge = SESSION_TTL_SECONDS,
): void {
  response.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export function applyCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearCsrfCookie(response: NextResponse): void {
  response.cookies.set(CSRF_COOKIE, "", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function writeAudit(
  action: string,
  userId?: string,
  resource?: string,
  resourceId?: string,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { action, userId, resource, resourceId },
    });
  } catch {
    // Audit payloads intentionally exclude submitted form data and all secrets.
  }
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return /^[a-f0-9:.]+$/i.test(ip) ? sha256(ip) : "unknown";
}

type RateState = { count: number; resetAt: number; blockedUntil?: number };
const attempts = new Map<string, RateState>();

export function rateLimit(
  key: string,
  maximum = 8,
  windowMs = 15 * 60 * 1000,
): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const state = attempts.get(key);
  if (!state || state.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }
  if (state.blockedUntil && state.blockedUntil > now) {
    return {
      limited: true,
      retryAfter: Math.ceil((state.blockedUntil - now) / 1000),
    };
  }
  state.count += 1;
  if (state.count > maximum) {
    state.blockedUntil =
      now +
      Math.min(windowMs, 60_000 * 2 ** Math.min(state.count - maximum - 1, 4));
    return {
      limited: true,
      retryAfter: Math.ceil((state.blockedUntil - now) / 1000),
    };
  }
  return { limited: false, retryAfter: 0 };
}

export async function consumeRateLimit(
  key: string,
  maximum = 8,
  windowMs = 15 * 60 * 1000,
): Promise<{ limited: boolean; retryAfter: number }> {
  if (process.env.NODE_ENV !== "production")
    return rateLimit(key, maximum, windowMs);
  const now = new Date();
  const bucketKey = sha256(key);
  try {
    return await prisma.$transaction(async (transaction) => {
      await transaction.rateLimitBucket.updateMany({
        where: { key: bucketKey, resetAt: { lte: now } },
        data: {
          count: 0,
          resetAt: new Date(now.getTime() + windowMs),
          blockedUntil: null,
        },
      });
      const bucket = await transaction.rateLimitBucket.upsert({
        where: { key: bucketKey },
        create: {
          key: bucketKey,
          count: 1,
          resetAt: new Date(now.getTime() + windowMs),
        },
        update: { count: { increment: 1 } },
      });
      if (bucket.blockedUntil && bucket.blockedUntil > now) {
        return {
          limited: true,
          retryAfter: Math.ceil(
            (bucket.blockedUntil.getTime() - now.getTime()) / 1000,
          ),
        };
      }
      if (bucket.count > maximum) {
        const retryAfter = Math.min(
          windowMs,
          60_000 * 2 ** Math.min(bucket.count - maximum - 1, 4),
        );
        await transaction.rateLimitBucket.update({
          where: { key: bucketKey },
          data: { blockedUntil: new Date(now.getTime() + retryAfter) },
        });
        return { limited: true, retryAfter: Math.ceil(retryAfter / 1000) };
      }
      return { limited: false, retryAfter: 0 };
    });
  } catch {
    return { limited: true, retryAfter: 60 };
  }
}

export function requestOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    const originUrl = new URL(origin);
    const hostUrl = new URL(`http://${host}`);
    const normalizeLocalAlias = (value: string) => {
      const hostname = value.replace(/^\[|\]$/g, "").toLowerCase();
      if (hostname === "127.0.0.1" || hostname === "0.0.0.0") return "localhost";
      if (hostname === "::1") return "localhost";
      return hostname;
    };
    const originHost = normalizeLocalAlias(originUrl.hostname);
    const requestHost = normalizeLocalAlias(hostUrl.hostname);
    if (originHost !== requestHost) return false;
    return originUrl.port === hostUrl.port || (!originUrl.port && !hostUrl.port);
  } catch {
    return false;
  }
}

export const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  Pragma: "no-cache",
};
