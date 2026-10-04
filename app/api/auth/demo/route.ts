import { NextRequest, NextResponse } from "next/server";
import {
  applySessionCookie,
  createDemoSession,
  csrfCookie,
  isCsrfValid,
  isDemoEnabled,
  requestOriginAllowed,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isDemoEnabled())
    return NextResponse.json(
      { error: "Demo access is unavailable." },
      { status: 404 },
    );
  if (!requestOriginAllowed(request) || !isCsrfValid(request))
    return NextResponse.json(
      { error: "Please refresh the page and try again." },
      { status: 403 },
    );
  try {
    await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request could not be processed." },
      { status: 400 },
    );
  }
  const csrf = csrfCookie(request);
  if (!csrf)
    return NextResponse.json(
      { error: "Please refresh the page and try again." },
      { status: 403 },
    );
  try {
    const response = NextResponse.json({
      user: {
        name: "Alex Morgan",
        employeeId: "DEMO-1042",
        role: "EMPLOYEE",
        title: "Operations Coordinator",
        department: "Operations",
        demo: true,
      },
    });
    applySessionCookie(response, createDemoSession(csrf));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Demo access is not configured. Contact your administrator." },
      { status: 503 },
    );
  }
}
