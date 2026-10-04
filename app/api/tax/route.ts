import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

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
        tax: {
          federalFilingStatus: "Single",
          federalAllowances: 1,
          stateCode: "OR",
          stateFilingStatus: "Single",
          stateAllowances: 1,
          demo: true,
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const tax = await prisma.taxProfile.findUnique({
      where: { employeeId: actor.employeeId },
      select: {
        federalFilingStatus: true,
        federalAllowances: true,
        stateCode: true,
        stateFilingStatus: true,
        stateAllowances: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(
      { tax },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Tax information is temporarily unavailable.", 503);
  }
}

const taxSchema = z
  .object({
    federalFilingStatus: z.enum([
      "SINGLE",
      "MARRIED_FILING_JOINTLY",
      "MARRIED_FILING_SEPARATELY",
      "HEAD_OF_HOUSEHOLD",
    ]),
    federalAllowances: z.number().int().min(0).max(99),
    stateCode: z.string().regex(/^[A-Z]{2}$/),
    stateFilingStatus: z.string().trim().min(1).max(50),
    stateAllowances: z.number().int().min(0).max(99),
  })
  .strict();

export async function PATCH(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  const parsed = taxSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return jsonError("Review your withholding selections and try again.", 400);
  if (actor.demo)
    return NextResponse.json(
      { ok: true, demo: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    await prisma.taxProfile.upsert({
      where: { employeeId: actor.employeeId },
      create: { employeeId: actor.employeeId, ...parsed.data },
      update: parsed.data,
    });
    await writeAudit(
      "TAX_INFORMATION_UPDATED",
      actor.userId,
      "tax-profile",
      actor.employeeId,
    );
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("Your withholding choices couldn’t be saved.", 503);
  }
}
