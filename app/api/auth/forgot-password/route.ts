import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  clientIp,
  consumeRateLimit,
  isCsrfValid,
  requestOriginAllowed,
  sha256,
  writeAudit,
} from "@/lib/security";

export const dynamic = "force-dynamic";
const schema = z
  .object({
    email: z
      .string()
      .email()
      .max(254)
      .transform((value) => value.trim().toLowerCase()),
  })
  .strict();

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request) || !isCsrfValid(request))
    return NextResponse.json(
      { error: "Please refresh the page and try again." },
      { status: 403 },
    );
  const limit = await consumeRateLimit(`reset:${clientIp(request)}`, 4);
  if (limit.limited)
    return NextResponse.json(
      {
        message:
          "If that email belongs to an account, a reset link is on its way.",
      },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid work email." },
      { status: 400 },
    );

  const genericResponse = () =>
    NextResponse.json(
      {
        message:
          "If that email belongs to an account, a reset link is on its way.",
      },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (
      !user ||
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD ||
      !process.env.SMTP_FROM
    )
      return genericResponse();

    const token = randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: sha256(token),
        passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
    const port = Number(process.env.SMTP_PORT || "587");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      requireTLS: port !== 465,
    });
    const origin = new URL(process.env.APP_URL || "http://localhost:3000");
    if (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
      throw new Error("APP_URL must use HTTPS in production.");
    const resetUrl = new URL("/reset-password", origin);
    resetUrl.searchParams.set("token", token);
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "Reset your Charlie Health portal password",
      text: `A password reset was requested for your employee portal account. Use this one-time link within 30 minutes: ${resetUrl}\n\nIf you did not request this change, you can ignore this email.`,
      html: `<p>A password reset was requested for your employee portal account.</p><p><a href="${resetUrl}">Reset your password</a> (valid for 30 minutes).</p><p>If you did not request this change, you can ignore this email.</p>`,
    });
    await writeAudit("PASSWORD_RESET_REQUESTED", user.id, "account");
  } catch {
    // Keep reset responses neutral and never emit a reset token or mailbox error to logs.
  }
  return genericResponse();
}
