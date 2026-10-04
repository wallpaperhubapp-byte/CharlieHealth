import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  const query = z
    .string()
    .trim()
    .max(80)
    .safeParse(request.nextUrl.searchParams.get("q") ?? "");
  if (!query.success) return jsonError("Search query is too long.", 400);
  const search = query.data;
  if (actor.demo) {
    const demoColleagues = [
      {
        name: "Jordan Lee",
        title: "People Operations Partner",
        department: "People & Culture",
        email: "jordan.lee@charliehealth.example",
        location: "Brooklyn, NY",
        team: "People",
      },
      {
        name: "Sam Rivera",
        title: "Operations Lead",
        department: "Operations",
        email: "sam.rivera@charliehealth.example",
        location: "Remote · Austin, TX",
        team: "Operations",
      },
      {
        name: "Taylor Bennett",
        title: "Clinical Programs Manager",
        department: "Clinical",
        email: "taylor.bennett@charliehealth.example",
        location: "Remote · Denver, CO",
        team: "Clinical",
      },
      {
        name: "Casey Nguyen",
        title: "Payroll Specialist",
        department: "Finance",
        email: "casey.nguyen@charliehealth.example",
        location: "New York, NY",
        team: "Finance",
      },
      {
        name: "Morgan Patel",
        title: "Product Designer",
        department: "Product & Design",
        email: "morgan.patel@charliehealth.example",
        location: "Remote · Seattle, WA",
        team: "Product",
      },
      {
        name: "Alex Morgan",
        title: "Operations Coordinator",
        department: "Operations",
        email: "alex.morgan@charliehealth.example",
        location: "Remote · Portland, OR",
        team: "Operations",
      },
    ].filter((person) =>
      `${person.name} ${person.title} ${person.department} ${person.location}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
    return NextResponse.json(
      { colleagues: demoColleagues },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  }
  try {
    const colleagues = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        ...(search
          ? {
              OR: [
                { legalFirstName: { contains: search, mode: "insensitive" } },
                { preferredName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { jobTitle: { contains: search, mode: "insensitive" } },
                {
                  department: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
      },
      take: 100,
      orderBy: [{ lastName: "asc" }, { legalFirstName: "asc" }],
      select: {
        legalFirstName: true,
        preferredName: true,
        lastName: true,
        workEmail: true,
        jobTitle: true,
        workLocation: true,
        team: true,
        department: { select: { name: true } },
      },
    });
    return NextResponse.json(
      {
        colleagues: colleagues.map((person) => ({
          name: `${person.preferredName || person.legalFirstName} ${person.lastName}`,
          title: person.jobTitle,
          department: person.department?.name ?? "Team member",
          email: person.workEmail,
          location: person.workLocation ?? "",
          team: person.team ?? "",
        })),
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("The directory is temporarily unavailable.", 503);
  }
}
