import { NextRequest, NextResponse } from "next/server";
import { readActor } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = await readActor(request);
  if (!actor)
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  let title = "Operations Coordinator";
  let department = "Operations";
  if (!actor.demo) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const employee = await prisma.employee.findUnique({
        where: { id: actor.employeeId },
        include: { department: true },
      });
      if (employee) {
        title = employee.jobTitle;
        department = employee.department?.name ?? "Team member";
      }
    } catch {
      return NextResponse.json(
        { error: "Session lookup is temporarily unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  }
  return NextResponse.json(
    {
      user: {
        name: actor.name,
        employeeId: actor.employeeNumber ?? "",
        role: actor.role,
        title,
        department,
        demo: actor.demo,
      },
    },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
