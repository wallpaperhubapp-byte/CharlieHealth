import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await authorize(request, [
    "HR_ADMIN",
    "PAYROLL_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (error) return error;
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        userId: true,
        action: true,
        resource: true,
        resourceId: true,
        createdAt: true,
      },
    });
    return NextResponse.json(
      { logs },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Audit activity is temporarily unavailable.", 503);
  }
}
