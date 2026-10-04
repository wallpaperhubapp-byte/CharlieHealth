import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";
const roles = ["HR_ADMIN", "SUPER_ADMIN"];
const employeeChanges = z
  .object({
    jobTitle: z.string().trim().min(1).max(120).optional(),
    departmentId: z.string().cuid().nullable().optional(),
    managerId: z.string().cuid().nullable().optional(),
    employmentType: z.string().trim().min(1).max(60).optional(),
    status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE", "TERMINATED"]).optional(),
    workLocation: z.string().trim().max(120).nullable().optional(),
    team: z.string().trim().max(120).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await authorize(request, roles);
  if (error) return error;
  const { id } = await context.params;
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        manager: {
          select: { legalFirstName: true, preferredName: true, lastName: true },
        },
        emergencyContacts: {
          select: {
            id: true,
            name: true,
            relationship: true,
            phone: true,
            email: true,
            address: true,
            isPrimary: true,
          },
        },
        taxProfile: true,
      },
    });
    if (!employee) return jsonError("Employee not found.", 404);
    return NextResponse.json(
      { employee },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("The employee profile is temporarily unavailable.", 503);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { actor, error } = await authorizeWrite(request, roles);
  if (error) return error;
  const { id } = await context.params;
  const parsed = employeeChanges.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return jsonError("Review the employee update and try again.", 400);
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        employeeNumber: true,
        jobTitle: true,
        employmentType: true,
        status: true,
        workLocation: true,
        team: true,
      },
    });
    await writeAudit("EMPLOYEE_PROFILE_UPDATED", actor.userId, "employee", id);
    return NextResponse.json(
      { employee },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("This employee update couldn’t be completed.", 503);
  }
}
