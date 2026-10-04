import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";
const roles = z.enum([
  "EMPLOYEE",
  "MANAGER",
  "HR_ADMIN",
  "PAYROLL_ADMIN",
  "SUPER_ADMIN",
]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { actor, error } = await authorizeWrite(request, ["SUPER_ADMIN"]);
  if (error) return error;
  const { id } = await context.params;
  const parsed = z
    .object({ role: roles })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("This role update isn’t valid.", 400);
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!employee?.userId) return jsonError("Employee account not found.", 404);
    if (employee.userId === actor.userId)
      return jsonError("You can’t change your own administrator role.", 400);
    await prisma.user.update({
      where: { id: employee.userId },
      data: { role: parsed.data.role },
    });
    await writeAudit(
      "ROLE_CHANGED",
      actor.userId,
      "user-role",
      employee.userId,
    );
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("This role update couldn’t be completed.", 503);
  }
}
