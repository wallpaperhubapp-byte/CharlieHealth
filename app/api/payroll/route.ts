import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { DEMO_PAYROLL } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

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
      { payroll: DEMO_PAYROLL },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const payroll = await prisma.payrollProfile.findUnique({
      where: { employeeId: actor.employeeId },
      include: {
        accounts: {
          select: {
            bankName: true,
            accountType: true,
            accountLast4: true,
            allocationPercent: true,
            isPrimary: true,
          },
          orderBy: { isPrimary: "desc" },
        },
      },
    });
    if (!payroll)
      return NextResponse.json(
        { payroll: null },
        { headers: { "Cache-Control": "no-store, private" } },
      );
    return NextResponse.json(
      {
        payroll: {
          payFrequency: payroll.payFrequency,
          nextPayday: payroll.nextPayday?.toISOString().slice(0, 10) ?? null,
          lastPayday: payroll.lastPayday?.toISOString().slice(0, 10) ?? null,
          ytdEarningsCents: payroll.ytdEarningsCents,
          accounts: payroll.accounts.map((account) => ({
            ...account,
            allocationPercent: account.allocationPercent.toString(),
          })),
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Payroll information is temporarily unavailable.", 503);
  }
}
