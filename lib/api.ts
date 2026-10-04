import { NextRequest, NextResponse } from "next/server";
import { hasAnyRole } from "@/lib/access-control";
import {
  isCsrfValid,
  PRIVATE_HEADERS,
  readActor,
  requestOriginAllowed,
  type Actor,
} from "@/lib/security";

export async function authorize(request: NextRequest, allowedRoles?: string[]) {
  const actor = await readActor(request);
  if (!actor)
    return {
      actor: null,
      error: NextResponse.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401, headers: PRIVATE_HEADERS },
      ),
    };
  if (allowedRoles && !hasAnyRole(actor, allowedRoles)) {
    return {
      actor: null,
      error: NextResponse.json(
        { error: "You don’t have permission to access this information." },
        { status: 403, headers: PRIVATE_HEADERS },
      ),
    };
  }
  return { actor, error: null };
}

export async function authorizeWrite(
  request: NextRequest,
  allowedRoles?: string[],
) {
  const auth = await authorize(request, allowedRoles);
  if (auth.error) return auth;
  if (!requestOriginAllowed(request) || !isCsrfValid(request, auth.actor)) {
    return {
      actor: null,
      error: NextResponse.json(
        { error: "Your request could not be verified. Refresh and try again." },
        { status: 403, headers: PRIVATE_HEADERS },
      ),
    };
  }
  return auth as { actor: Actor; error: null };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: PRIVATE_HEADERS },
  );
}
