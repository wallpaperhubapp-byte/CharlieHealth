import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";
const patchSchema = z.object({ status: z.literal("CANCELLED") }).strict();

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return jsonError("This time-off update isn’t valid.", 400);
  if (actor.demo)
    return id.startsWith("demo-")
      ? NextResponse.json({ ok: true, status: "CANCELLED" })
      : jsonError("Request not found.", 404);
  try {
    const result = await prisma.timeOffRequest.updateMany({
      where: { id, employeeId: actor.employeeId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (!result.count)
      return jsonError("Only your pending requests can be cancelled.", 404);
    await writeAudit("TIME_OFF_CANCELLED", actor.userId, "time-off", id);
    return NextResponse.json(
      { ok: true, status: "CANCELLED" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("This request couldn’t be updated.", 503);
  }
}
