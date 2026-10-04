import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import AdminConsole from "@/app/admin/admin-console";
import { readActor } from "@/lib/security";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const request = new NextRequest("http://portal.internal/admin", {
    headers: requestHeaders,
  });
  const actor = await readActor(request);
  if (!actor) redirect("/");
  if (
    !["HR_ADMIN", "PAYROLL_ADMIN", "SUPER_ADMIN", "MANAGER"].includes(
      actor.role,
    )
  )
    redirect("/");
  return <AdminConsole role={actor.role} name={actor.name} />;
}
