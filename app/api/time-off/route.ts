import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { DEMO_TIME_OFF } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";
const requestSchema = z
  .object({
    category: z.enum([
      "Vacation",
      "Sick leave",
      "Personal leave",
      "Other leave",
    ]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    notes: z.string().trim().max(1000).optional().default(""),
  })
  .strict();

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      { requests: DEMO_TIME_OFF },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const requests = await prisma.timeOffRequest.findMany({
      where: { employeeId: actor.employeeId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        category: true,
        startDate: true,
        endDate: true,
        requestedDays: true,
        notes: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json(
      {
        requests: requests.map((item) => ({
          ...item,
          requestedDays: item.requestedDays.toString(),
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Time-off requests are temporarily unavailable.", 503);
  }
}

export async function POST(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return jsonError(
      "Check the dates and request details, then try again.",
      400,
    );
  const start = new Date(`${parsed.data.startDate}T00:00:00.000Z`);
  const end = new Date(`${parsed.data.endDate}T00:00:00.000Z`);
  const span = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (
    span < 1 ||
    span > 90 ||
    start < new Date(new Date().setUTCHours(0, 0, 0, 0))
  )
    return jsonError("Choose a future date range of 1–90 days.", 400);
  let days = 0;
  for (
    let date = new Date(start);
    date <= end;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) days += 1;
  }
  if (days === 0) return jsonError("Select at least one workday.", 400);
  if (actor.demo)
    return NextResponse.json(
      {
        request: { ...parsed.data, status: "PENDING", requestedDays: days },
        demo: true,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const created = await prisma.timeOffRequest.create({
      data: {
        employeeId: actor.employeeId,
        category: parsed.data.category,
        startDate: start,
        endDate: end,
        requestedDays: days,
        notes: parsed.data.notes || null,
      },
      select: {
        id: true,
        category: true,
        startDate: true,
        endDate: true,
        requestedDays: true,
        status: true,
      },
    });
    await writeAudit(
      "TIME_OFF_REQUESTED",
      actor.userId,
      "time-off",
      created.id,
    );
    return NextResponse.json(
      {
        request: {
          ...created,
          requestedDays: created.requestedDays.toString(),
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError(
      "Your request couldn’t be submitted. Please try again.",
      503,
    );
  }
}
