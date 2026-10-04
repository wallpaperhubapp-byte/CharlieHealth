import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { actor, error } = await authorizeWrite(request, [
    "MANAGER",
    "HR_ADMIN",
    "SUPER_ADMIN",
  ]);
  if (error) return error;
  const { id } = await context.params;
  const parsed = z
    .object({
      status: z.enum(["APPROVED", "DENIED"]),
      decisionNote: z.string().trim().max(1000).optional(),
    })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return jsonError("This approval decision isn’t valid.", 400);
  try {
    const requestRecord = await prisma.timeOffRequest.findFirst({
      where: {
        id,
        status: "PENDING",
        ...(actor.role === "MANAGER"
          ? { employee: { managerId: actor.employeeId } }
          : {}),
      },
      select: { id: true },
    });
    if (!requestRecord)
      return jsonError("This request is unavailable for approval.", 404);
    await prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        decisionNote: parsed.data.decisionNote || null,
        decidedBy: actor.userId,
        decidedAt: new Date(),
      },
    });
    await writeAudit(
      `TIME_OFF_${parsed.data.status}`,
      actor.userId,
      "time-off",
      id,
    );
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("This decision couldn’t be saved.", 503);
  }
}
