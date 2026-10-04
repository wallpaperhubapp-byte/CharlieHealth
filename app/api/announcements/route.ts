import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      {
        announcements: [
          {
            id: "demo-ann-1",
            title: "Your open enrollment window is coming up",
            body: "The fall benefits enrollment window opens October 14.",
            category: "People & culture",
            publishedAt: "2026-09-29",
            unread: true,
          },
          {
            id: "demo-ann-2",
            title: "A note from our leadership team",
            body: "Thank you for the care and thought you bring to your work.",
            category: "Company",
            publishedAt: "2026-09-26",
            unread: true,
          },
        ],
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const [announcements, read] = await Promise.all([
      prisma.announcement.findMany({
        where: {
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { publishedAt: "desc" },
        take: 100,
        select: {
          id: true,
          title: true,
          body: true,
          category: true,
          publishedAt: true,
        },
      }),
      prisma.notification.findMany({
        where: { employeeId: actor.employeeId },
        select: { title: true, readAt: true },
      }),
    ]);
    const readTitles = new Set(
      read.filter((item) => item.readAt).map((item) => item.title),
    );
    return NextResponse.json(
      {
        announcements: announcements.map((item) => ({
          ...item,
          unread: !readTitles.has(item.title),
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Announcements are temporarily unavailable.", 503);
  }
}
