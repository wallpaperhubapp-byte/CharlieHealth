import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { DEMO_DOCUMENTS } from "@/lib/demo-data";
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
      {
        paystubs: DEMO_DOCUMENTS.filter(
          (document) => document.category === "Pay statements",
        ),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const paystubs = await prisma.document.findMany({
      where: {
        employeeId: actor.employeeId,
        category: "Pay statements",
        status: "AVAILABLE",
      },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        issuedAt: true,
        status: true,
      },
    });
    return NextResponse.json(
      { paystubs },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Pay statements are temporarily unavailable.", 503);
  }
}
