import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      {
        notifications: [
          {
            id: "demo-notification-1",
            title: "Open enrollment is coming up",
            body: "Review your plan choices starting October 14.",
            readAt: null,
          },
        ],
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const notifications = await prisma.notification.findMany({
      where: { employeeId: actor.employeeId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        readAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json(
      { notifications },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Notifications are temporarily unavailable.", 503);
  }
}

export async function PATCH(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  const parsed = z
    .object({
      id: z.string().cuid().optional(),
      title: z.string().trim().min(1).max(180).optional(),
      markAllRead: z.boolean().optional(),
    })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    (!parsed.data.id && !parsed.data.title && !parsed.data.markAllRead)
  )
    return jsonError("This notification update isn’t valid.", 400);
  if (actor.demo)
    return NextResponse.json(
      { ok: true, demo: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    if (parsed.data.id)
      await prisma.notification.updateMany({
        where: { id: parsed.data.id, employeeId: actor.employeeId },
        data: { readAt: new Date() },
      });
    else if (parsed.data.title)
      await prisma.notification.updateMany({
        where: { employeeId: actor.employeeId, title: parsed.data.title },
        data: { readAt: new Date() },
      });
    else
      await prisma.notification.updateMany({
        where: { employeeId: actor.employeeId, readAt: null },
        data: { readAt: new Date() },
      });
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("This notification couldn’t be updated.", 503);
  }
}
