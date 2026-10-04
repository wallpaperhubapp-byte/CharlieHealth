import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { DEMO_DOCUMENTS } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      { documents: DEMO_DOCUMENTS },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const documents = await prisma.document.findMany({
      where: {
        OR: [{ employeeId: actor.employeeId }, { employeeId: null }],
        status: "AVAILABLE",
      },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        issuedAt: true,
        status: true,
      },
    });
    return NextResponse.json(
      { documents },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Your documents are temporarily unavailable.", 503);
  }
}
