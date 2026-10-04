import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request, [
    "MANAGER",
    "HR_ADMIN",
    "PAYROLL_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (error) return error;
  try {
    const [activeEmployees, pendingRequests, recentAudit] = await Promise.all([
      prisma.employee.count({ where: { status: "ACTIVE", ...(actor.role === "MANAGER" ? { managerId: actor.employeeId } : {}) } }),
      prisma.timeOffRequest.count({ where: { status: "PENDING", ...(actor.role === "MANAGER" ? { employee: { managerId: actor.employeeId } } : {}) } }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { action: true, resource: true, createdAt: true },
      }),
    ]);
    return NextResponse.json(
      { activeEmployees, pendingRequests, recentAudit },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError(
      "The administrator dashboard is temporarily unavailable.",
      503,
    );
  }
}
