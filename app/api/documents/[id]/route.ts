import { NextRequest, NextResponse } from "next/server";
import { authorize, jsonError } from "@/lib/api";
import { DEMO_DOCUMENTS } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  const { id } = await context.params;
  if (actor.demo) {
    const document = DEMO_DOCUMENTS.find((item) => item.id === id);
    return document
      ? NextResponse.json(
          { document, demo: true },
          { headers: { "Cache-Control": "no-store, private" } },
        )
      : jsonError("Document not found.", 404);
  }
  try {
    const document = await prisma.document.findFirst({
      where: {
        id,
        status: "AVAILABLE",
        OR: [{ employeeId: actor.employeeId }, { employeeId: null }],
      },
      select: {
        id: true,
        title: true,
        category: true,
        issuedAt: true,
        status: true,
      },
    });
    if (!document) return jsonError("Document not found.", 404);
    await writeAudit(
      "DOCUMENT_ACCESSED",
      actor.userId,
      "document",
      document.id,
    );
    return NextResponse.json(
      {
        document,
        message:
          "Document delivery requires a configured private object-storage provider.",
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("This document is temporarily unavailable.", 503);
  }
}
