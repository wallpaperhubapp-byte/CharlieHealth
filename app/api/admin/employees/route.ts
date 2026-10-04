import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const roles = ["HR_ADMIN", "SUPER_ADMIN"];

export async function GET(request: NextRequest) {
  const { error } = await authorize(request, roles);
  if (error) return error;
  const query = z
    .string()
    .trim()
    .max(80)
    .safeParse(request.nextUrl.searchParams.get("q") ?? "");
  if (!query.success) return jsonError("Search query is too long.", 400);
  try {
    const employees = await prisma.employee.findMany({
      where: query.data
        ? {
            OR: [
              { legalFirstName: { contains: query.data, mode: "insensitive" } },
              { preferredName: { contains: query.data, mode: "insensitive" } },
              { lastName: { contains: query.data, mode: "insensitive" } },
              { employeeNumber: { contains: query.data, mode: "insensitive" } },
            ],
          }
        : {},
      take: 100,
      orderBy: [{ lastName: "asc" }, { legalFirstName: "asc" }],
      select: {
        id: true,
        employeeNumber: true,
        legalFirstName: true,
        preferredName: true,
        lastName: true,
        jobTitle: true,
        status: true,
        workEmail: true,
        department: { select: { id: true, name: true } },
        user: { select: { role: true } },
      },
    });
    return NextResponse.json(
      {
        employees: employees.map((person) => ({
          id: person.id,
          employeeNumber: person.employeeNumber,
          name: `${person.preferredName || person.legalFirstName} ${person.lastName}`,
          jobTitle: person.jobTitle,
          status: person.status,
          workEmail: person.workEmail,
          department: person.department,
          userRole: person.user?.role ?? null,
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("The employee directory is temporarily unavailable.", 503);
  }
}
