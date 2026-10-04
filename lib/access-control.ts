import type { Actor } from "@/lib/security";

export function hasAnyRole(
  actor: Actor,
  allowedRoles: readonly string[],
): boolean {
  return allowedRoles.includes(actor.role);
}

export function canReadPrivateEmployee(
  actor: Pick<Actor, "role" | "employeeId">,
  employeeId: string,
): boolean {
  return (
    actor.employeeId === employeeId ||
    actor.role === "HR_ADMIN" ||
    actor.role === "SUPER_ADMIN"
  );
}

export function canReviewDirectReport(
  actor: Pick<Actor, "role" | "employeeId">,
  managerId: string | null,
): boolean {
  return (
    (actor.role === "MANAGER" && managerId === actor.employeeId) ||
    actor.role === "HR_ADMIN" ||
    actor.role === "SUPER_ADMIN"
  );
}

export function isAdministrator(role: string): boolean {
  return ["HR_ADMIN", "PAYROLL_ADMIN", "SUPER_ADMIN", "MANAGER"].includes(role);
}

export function ownEmployeeScope(actor: Pick<Actor, "employeeId">) {
  return { employeeId: actor.employeeId } as const;
}
