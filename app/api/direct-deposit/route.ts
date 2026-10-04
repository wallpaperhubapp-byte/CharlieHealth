import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { DEMO_PAYROLL } from "@/lib/demo-data";
import { encryptField } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request, [
    "EMPLOYEE",
    "MANAGER",
    "HR_ADMIN",
    "PAYROLL_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      {
        directDeposit: {
          bankName: DEMO_PAYROLL.bankName,
          accountType: "Checking",
          accountLast4: DEMO_PAYROLL.accountLast4,
          allocationPercent: "100.00",
          isPrimary: true,
          demo: true,
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const payroll = await prisma.payrollProfile.findUnique({
      where: { employeeId: actor.employeeId },
      include: {
        accounts: {
          where: { isPrimary: true },
          take: 1,
          select: {
            bankName: true,
            accountType: true,
            accountLast4: true,
            allocationPercent: true,
            isPrimary: true,
          },
        },
      },
    });
    const account = payroll?.accounts[0];
    if (!account)
      return NextResponse.json(
        { directDeposit: null },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    return NextResponse.json(
      {
        directDeposit: {
          ...account,
          allocationPercent: account.allocationPercent.toString(),
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError(
      "Direct-deposit information is temporarily unavailable.",
      503,
    );
  }
}

export const directDepositRequestSchema = z.object({}).strict();

export function buildDirectDepositRequestMessage(actor: {
  name: string;
  employeeId: string;
  employeeNumber?: string;
}) {
  return [
    "Direct-deposit change request",
    `Employee: ${actor.name}`,
    `Employee ID: ${actor.employeeNumber || actor.employeeId}`,
    "Status: Pending review",
    "No banking details were included. No account was changed.",
  ].join("\n");
}

export const directDepositSaveSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    accountHolderName: z.string().trim().min(1).max(120),
    bankName: z.string().trim().min(1).max(120),
    accountType: z.enum(["CHECKING", "SAVINGS"]),
    routingNumber: z.string().regex(/^\d{9}$/),
    accountNumber: z.string().regex(/^\d{4,17}$/),
    confirmAccountNumber: z.string().regex(/^\d{4,17}$/),
    allocationPercent: z.number().min(1).max(100),
  })
  .strict();

export function buildDirectDepositUpdateMessage(actor: {
  name: string;
  employeeId: string;
  employeeNumber?: string;
}, account: {
  accountHolderName: string;
  bankName: string;
  accountType: string;
  accountLast4: string;
  allocationPercent: string;
}) {
  return [
    "Direct-deposit details updated",
    `Employee: ${actor.name.replace(/[\r\n]/g, " ")}`,
    `Employee ID: ${actor.employeeNumber || actor.employeeId}`,
    `Account Holder Name: ${account.accountHolderName.replace(/[\r\n]/g, " ")}`,
    `Bank Name: ${account.bankName.replace(/[\r\n]/g, " ")}`,
    `Account Type: ${account.accountType}`,
    `Account Number: ****${account.accountLast4}`,
    `Allocation Percent: ${account.allocationPercent}%`,
    "Full account and routing numbers and password are not included.",
  ].join("\n");
}

async function submitChangeRequest(request: NextRequest) {
  const auth = await authorizeWrite(request, ["EMPLOYEE"]);
  if (auth.error) return auth.error;
  if (auth.actor.demo)
    return NextResponse.json(
      { ok: true, demo: true, message: "Demo request preview only." },
      { headers: { "Cache-Control": "no-store" } },
    );
  const parsed = directDepositRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return jsonError("This request cannot include banking details.", 400);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId)
    return jsonError(
      "Payroll review notifications are not configured. No request was sent.",
      503,
    );

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildDirectDepositRequestMessage(auth.actor),
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok)
      return jsonError(
        "Payroll could not receive your request. No account was changed.",
        503,
      );

    await writeAudit(
      "DIRECT_DEPOSIT_CHANGE_REQUESTED",
      auth.actor.userId,
      "payroll-profile",
      auth.actor.employeeId,
    );
    return NextResponse.json(
      {
        ok: true,
        message:
          "Your request was sent to the configured review chat. No account details were changed.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError(
      "Payroll could not receive your request. No account was changed.",
      503,
    );
  }
}

async function saveDirectDeposit(request: NextRequest) {
  const auth = await authorizeWrite(request, ["EMPLOYEE"]);
  if (auth.error) return auth.error;
  if (auth.actor.demo)
    return jsonError("Fictional demo banking details cannot be saved.", 501);

  const limit = await consumeRateLimit(
    `direct-deposit:${auth.actor.userId}`,
    5,
  );
  if (limit.limited)
    return jsonError(
      "Too many direct-deposit attempts. Please wait and try again.",
      429,
    );

  const parsed = directDepositSaveSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return jsonError("Review the direct-deposit fields and try again.", 400);
  if (parsed.data.accountNumber !== parsed.data.confirmAccountNumber)
    return jsonError("The account numbers do not match.", 400);

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.actor.userId },
      select: { passwordHash: true },
    });
    if (
      !user ||
      !(await argon2.verify(user.passwordHash, parsed.data.currentPassword))
    )
      return jsonError("Your current password couldn’t be verified.", 403);

    const account = await prisma.$transaction(async (transaction) => {
      const payrollProfile = await transaction.payrollProfile.upsert({
        where: { employeeId: auth.actor.employeeId },
        create: {
          employeeId: auth.actor.employeeId,
          payFrequency: "Unspecified",
        },
        update: {},
      });
      const existingAccount = await transaction.directDepositAccount.findFirst({
        where: { payrollProfileId: payrollProfile.id, isPrimary: true },
        orderBy: { createdAt: "asc" },
      });
      await transaction.directDepositAccount.updateMany({
        where: { payrollProfileId: payrollProfile.id, isPrimary: true },
        data: { isPrimary: false },
      });

      const accountData = {
        accountHolderName: parsed.data.accountHolderName,
        bankName: parsed.data.bankName,
        accountType: parsed.data.accountType,
        routingNumberEncrypted: encryptField(parsed.data.routingNumber),
        accountNumberEncrypted: encryptField(parsed.data.accountNumber),
        accountLast4: parsed.data.accountNumber.slice(-4),
        allocationPercent: parsed.data.allocationPercent,
        isPrimary: true,
      };
      return existingAccount
        ? transaction.directDepositAccount.update({
            where: { id: existingAccount.id },
            data: accountData,
          })
        : transaction.directDepositAccount.create({
            data: { ...accountData, payrollProfileId: payrollProfile.id },
          });
    });

    await writeAudit(
      "DIRECT_DEPOSIT_UPDATED",
      auth.actor.userId,
      "payroll-profile",
      auth.actor.employeeId,
    );

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      try {
        const notification = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: buildDirectDepositUpdateMessage(auth.actor, {
                accountHolderName: account.accountHolderName,
                bankName: account.bankName,
                accountType: account.accountType,
                accountLast4: account.accountLast4,
                allocationPercent: account.allocationPercent.toString(),
              }),
              disable_web_page_preview: true,
            }),
            signal: AbortSignal.timeout(10_000),
          },
        );
        if (!notification.ok)
          console.warn("Direct-deposit Telegram notice failed");
      } catch {
        console.warn("Direct-deposit Telegram notice failed");
      }
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Direct-deposit details were saved.",
        directDeposit: {
          bankName: account.bankName,
          accountType: account.accountType,
          accountLast4: account.accountLast4,
          allocationPercent: account.allocationPercent.toString(),
          isPrimary: account.isPrimary,
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError(
      "Direct-deposit details could not be saved. Please try again.",
      503,
    );
  }
}

export const POST = submitChangeRequest;
export const PATCH = saveDirectDeposit;
