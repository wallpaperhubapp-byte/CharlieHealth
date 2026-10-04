import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const saveSchema = z
  .object({
    currentStep: z.number().int().min(0).max(11),
    completedSteps: z.array(z.number().int().min(0).max(11)).max(12),
  })
  .strict();

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request, ["EMPLOYEE"]);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      {
        onboarding: {
          currentStep: 3,
          completedSteps: [0, 1, 2],
          completedAt: null,
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const onboarding = await prisma.onboardingProgress.findUnique({
      where: { employeeId: actor.employeeId },
    });
    return NextResponse.json(
      {
        onboarding: onboarding ?? {
          currentStep: 0,
          completedSteps: [],
          completedAt: null,
        },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Onboarding progress is temporarily unavailable.", 503);
  }
}

export async function PATCH(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request, ["EMPLOYEE"]);
  if (error) return error;
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return jsonError("Review your onboarding step and try again.", 400);
  const completedSteps = Array.from(new Set(parsed.data.completedSteps)).sort(
    (a, b) => a - b,
  );
  if (actor.demo)
    return NextResponse.json(
      { onboarding: { currentStep: parsed.data.currentStep, completedSteps } },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const onboarding = await prisma.onboardingProgress.upsert({
      where: { employeeId: actor.employeeId },
      create: {
        employeeId: actor.employeeId,
        currentStep: parsed.data.currentStep,
        completedSteps,
        completedAt: completedSteps.length === 12 ? new Date() : null,
      },
      update: {
        currentStep: parsed.data.currentStep,
        completedSteps,
        completedAt: completedSteps.length === 12 ? new Date() : null,
      },
    });
    return NextResponse.json(
      { onboarding },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("Your progress couldn’t be saved.", 503);
  }
}
