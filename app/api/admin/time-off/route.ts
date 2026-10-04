import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request, [
    "MANAGER",
    "HR_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (error) return error;
  try {
    const requests = await prisma.timeOffRequest.findMany({
      where: {
        status: "PENDING",
        ...(actor.role === "MANAGER"
          ? { employee: { managerId: actor.employeeId } }
          : {}),
      },
      take: 100,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        category: true,
        startDate: true,
        endDate: true,
        requestedDays: true,
        status: true,
        employee: {
          select: {
            employeeNumber: true,
            preferredName: true,
            legalFirstName: true,
            lastName: true,
            jobTitle: true,
            department: { select: { name: true } },
          },
        },
      },
    });
    return NextResponse.json(
      {
        requests: requests.map((item) => ({
          ...item,
          requestedDays: item.requestedDays.toString(),
          employee: {
            ...item.employee,
            name: `${item.employee.preferredName || item.employee.legalFirstName} ${item.employee.lastName}`,
          },
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("The approval queue is temporarily unavailable.", 503);
  }
}
