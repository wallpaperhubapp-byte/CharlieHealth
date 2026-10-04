import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      {
        benefits: [
          {
            category: "Medical",
            name: "Example Choice PPO",
            provider: "Fictional provider",
            status: "ENROLLED",
            demo: true,
          },
          {
            category: "Dental",
            name: "Sample Dental Plus",
            provider: "Fictional provider",
            status: "ENROLLED",
            demo: true,
          },
          {
            category: "Vision",
            name: "Example Vision Standard",
            provider: "Fictional provider",
            status: "ENROLLED",
            demo: true,
          },
        ],
        note: "Placeholder plans only. Not actual employer benefits.",
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const benefits = await prisma.benefitPlan.findMany({
      where: { active: true },
      include: {
        enrollments: {
          where: { employeeId: actor.employeeId },
          select: {
            id: true,
            status: true,
            enrolledAt: true,
            dependentCount: true,
          },
        },
      },
      orderBy: { category: "asc" },
    });
    return NextResponse.json(
      {
        benefits: benefits.map(({ enrollments, ...plan }) => ({
          ...plan,
          enrollment: enrollments[0] ?? null,
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Benefits information is temporarily unavailable.", 503);
  }
}

const electionSchema = z
  .object({ status: z.enum(["ENROLLED", "WAIVED"]) })
  .strict();

export async function PATCH(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  const parsed = z
    .object({ id: z.string().cuid(), ...electionSchema.shape })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return jsonError("This benefits update isn’t valid.", 400);
  if (actor.demo)
    return NextResponse.json(
      { ok: true, demo: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const enrollment = await prisma.benefitEnrollment.findFirst({
      where: { id: parsed.data.id, employeeId: actor.employeeId },
      include: { benefitPlan: true },
    });
    if (!enrollment) return jsonError("Enrollment not found.", 404);
    if (
      enrollment.benefitPlan.enrollmentEnds &&
      enrollment.benefitPlan.enrollmentEnds < new Date()
    )
      return jsonError("The enrollment window for this plan has closed.", 400);
    await prisma.benefitEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: parsed.data.status,
        enrolledAt: parsed.data.status === "ENROLLED" ? new Date() : null,
      },
    });
    await writeAudit(
      "BENEFIT_ELECTION_UPDATED",
      actor.userId,
      "benefit-enrollment",
      enrollment.id,
    );
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("Your election couldn’t be updated.", 503);
  }
}
