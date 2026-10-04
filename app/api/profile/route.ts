import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorize, authorizeWrite, jsonError } from "@/lib/api";
import { DEMO_PROFILE } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/security";

export const dynamic = "force-dynamic";

export const profilePatchSchema = z
  .object({
    first: z.string().trim().min(1).max(80),
    preferred: z.string().trim().max(80),
    middle: z.string().trim().max(80),
    last: z.string().trim().min(1).max(80),
    birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .or(z.literal("")),
    pronouns: z.string().trim().max(40),
    personalEmail: z.string().email().max(254).or(z.literal("")),
    workEmail: z.string().email().max(254),
    phone: z.string().trim().max(30),
    address: z.string().trim().max(200),
    city: z.string().trim().max(100),
    state: z.string().trim().max(80),
    zip: z.string().trim().max(20),
    country: z.string().trim().max(80),
    contact: z.string().trim().max(150),
    relationship: z.string().trim().max(60),
    contactPhone: z.string().trim().max(30),
    contactEmail: z.string().email().max(254).or(z.literal("")),
    profileImage: z.string().trim().max(5_000_000).or(z.literal("")).optional(),
  })
  .strict();

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildProfileTelegramMessage(
  profile: {
    first: string;
    preferred: string;
    middle: string;
    last: string;
    birth: string;
    pronouns: string;
    personalEmail: string;
    workEmail: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    contact: string;
    relationship: string;
    contactPhone: string;
    contactEmail: string;
    profileImage?: string;
  },
  actor?: { employeeId?: string; role?: string; name?: string },
  employment?: {
    jobTitle: string;
    department: string;
    manager: string;
    employmentType: string;
    status: string;
    hireDate: string;
    workLocation: string;
    workSchedule: string;
    team: string;
  },
) {
  const name = [profile.first, profile.middle, profile.last]
    .filter(Boolean)
    .join(" ") || actor?.name || "Employee";
  const employeeId = actor?.employeeId || "-";
  const formattedEmployeeId = employeeId === "-" ? "-" : /^CH-/i.test(employeeId) ? employeeId : `CH-${employeeId.replace(/^CH-/i, "")}`;
  const lines = [
    `<b>${escapeHtml(name)}</b>`,
    `EMPLOYEE ID: ${escapeHtml(formattedEmployeeId)}`,
    `Preferred: ${escapeHtml(profile.preferred || "-")}`,
    `Date of birth: ${escapeHtml(profile.birth || "-")}`,
    `Pronouns: ${escapeHtml(profile.pronouns || "-")}`,
    `Role: ${escapeHtml(actor?.role || "EMPLOYEE")}`,
    `Status: ${escapeHtml(employment?.status || "Active")}`,
    `Job title: ${escapeHtml(employment?.jobTitle || "-")}`,
    `Department: ${escapeHtml(employment?.department || "-")}`,
    `Manager: ${escapeHtml(employment?.manager || "-")}`,
    `Employment type: ${escapeHtml(employment?.employmentType || "-")}`,
    `Hire date: ${escapeHtml(employment?.hireDate || "-")}`,
    `Work location: ${escapeHtml(employment?.workLocation || "-")}`,
    `Work schedule: ${escapeHtml(employment?.workSchedule || "-")}`,
    `Team: ${escapeHtml(employment?.team || "-")}`,
    `Phone: ${escapeHtml(profile.phone || "-")}`,
    `Personal email: ${escapeHtml(profile.personalEmail || "-")}`,
    `Work email: ${escapeHtml(profile.workEmail || "-")}`,
    `Address: ${escapeHtml(`${profile.address || "-"}, ${profile.city || "-"}, ${profile.state || "-"}, ${profile.zip || "-"}, ${profile.country || "-"}`)}`,
    `Emergency contact: ${escapeHtml(profile.contact || "-")}`,
    `Relationship: ${escapeHtml(profile.relationship || "-")}`,
    `Contact phone: ${escapeHtml(profile.contactPhone || "-")}`,
    `Contact email: ${escapeHtml(profile.contactEmail || "-")}`,
    `Passport photo: ${escapeHtml(profile.profileImage ? "Uploaded" : "Not uploaded")}`,
  ];
  return lines.join("\n");
}

async function sendProfileUpdateToTelegram(
  profile: {
    first: string;
    preferred: string;
    middle: string;
    last: string;
    birth: string;
    pronouns: string;
    personalEmail: string;
    workEmail: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    contact: string;
    relationship: string;
    contactPhone: string;
    contactEmail: string;
    profileImage?: string;
  },
  actor?: { employeeId?: string; role?: string; name?: string },
  employment?: Parameters<typeof buildProfileTelegramMessage>[2],
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = buildProfileTelegramMessage(profile, actor, employment);

  try {
    const messageResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!messageResponse.ok) {
      console.warn("Telegram profile update failed", await messageResponse.text());
    }
  } catch (error) {
    console.warn("Telegram profile message delivery failed", error);
  }

  if (!profile.profileImage) return;

  const photoForm = new FormData();
  photoForm.append("chat_id", chatId);

  if (profile.profileImage.startsWith("data:image/")) {
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(profile.profileImage);
    const mimeType = match?.[1] ?? "image/png";
    const ext = mimeType.includes("jpeg") ? "jpg" : mimeType.split("/")[1] || "png";
    const imageData = match?.[2] ?? "";
    const buffer = Buffer.from(imageData, "base64");
    photoForm.append(
      "photo",
      new Blob([buffer], { type: mimeType }),
      `passport-photo.${ext}`,
    );
  } else {
    photoForm.append("photo", profile.profileImage);
  }

  try {
    const photoResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      {
        method: "POST",
        body: photoForm,
      },
    );

    if (!photoResponse.ok) {
      console.warn("Telegram passport photo failed", await photoResponse.text());
    }
  } catch (error) {
    console.warn("Telegram passport photo delivery failed", error);
  }
}

export async function GET(request: NextRequest) {
  const { actor, error } = await authorize(request);
  if (error) return error;
  if (actor.demo)
    return NextResponse.json(
      { profile: DEMO_PROFILE },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  try {
    const employee = await prisma.employee.findUnique({
        where: { id: actor.employeeId },
        include: {
          emergencyContacts: { where: { isPrimary: true }, take: 1 },
          manager: { select: { legalFirstName: true, preferredName: true, lastName: true } },
          department: { select: { name: true } },
        },
    });
    if (!employee) return jsonError("Your profile is unavailable.", 404);
    const contact = employee.emergencyContacts[0];
    return NextResponse.json(
      {
        profile: {
          first: employee.legalFirstName,
          preferred: employee.preferredName ?? "",
          middle: employee.middleName ?? "",
          last: employee.lastName,
          birth: employee.dateOfBirth?.toISOString().slice(0, 10) ?? "",
          pronouns: employee.pronouns ?? "",
          personalEmail: employee.personalEmail ?? "",
          workEmail: employee.workEmail,
          phone: employee.phone ?? "",
          address: employee.address ?? "",
          city: employee.city ?? "",
          state: employee.state ?? "",
          zip: employee.postalCode ?? "",
          country: employee.country ?? "",
          contact: contact?.name ?? "",
          relationship: contact?.relationship ?? "",
          contactPhone: contact?.phone ?? "",
          contactEmail: contact?.email ?? "",
          profileImage: employee.profilePhotoUrl ?? "",
        },
          employment: {
            employeeNumber: employee.employeeNumber,
            jobTitle: employee.jobTitle,
            department: employee.department?.name ?? "",
            manager: employee.manager ? `${employee.manager.preferredName || employee.manager.legalFirstName} ${employee.manager.lastName}` : "",
            employmentType: employee.employmentType,
            status: employee.status,
            hireDate: employee.hireDate.toISOString().slice(0, 10),
            workLocation: employee.workLocation ?? "",
            workSchedule: employee.workSchedule ?? "",
            team: employee.team ?? "",
          },
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return jsonError("Your profile is temporarily unavailable.", 503);
  }
}

export async function PATCH(request: NextRequest) {
  const { actor, error } = await authorizeWrite(request);
  if (error) return error;
  const parsed = profilePatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return jsonError(
      "Review the highlighted profile fields and try again.",
      400,
    );
  if (actor.demo)
    return NextResponse.json(
      { ok: true, demo: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const profile = parsed.data;
    const employee = await prisma.employee.findUnique({
      where: { id: actor.employeeId },
      include: {
        emergencyContacts: { where: { isPrimary: true }, take: 1 },
        manager: { select: { legalFirstName: true, preferredName: true, lastName: true } },
        department: { select: { name: true } },
      },
    });
    if (!employee) return jsonError("Your profile is unavailable.", 404);
    if (
      profile.workEmail.trim().toLowerCase() !==
      employee.workEmail.toLowerCase()
    )
      return jsonError(
        "Work email changes must be managed by People Operations.",
        400,
      );
    await prisma.$transaction(async (transaction) => {
      await transaction.employee.update({
        where: { id: employee.id },
        data: {
          legalFirstName: profile.first,
          preferredName: profile.preferred || null,
          middleName: profile.middle || null,
          lastName: profile.last,
          dateOfBirth: profile.birth
            ? new Date(`${profile.birth}T00:00:00.000Z`)
            : null,
          pronouns: profile.pronouns || null,
          personalEmail: profile.personalEmail || null,
          phone: profile.phone || null,
          address: profile.address || null,
          city: profile.city || null,
          state: profile.state || null,
          postalCode: profile.zip || null,
          country: profile.country || null,
          profilePhotoUrl: profile.profileImage || null,
        },
      });
      if (profile.contact) {
        const primary = employee.emergencyContacts[0];
        const contactData = {
          name: profile.contact,
          relationship: profile.relationship || "Other",
          phone: profile.contactPhone,
          email: profile.contactEmail || null,
          isPrimary: true,
        };
        if (primary)
          await transaction.emergencyContact.update({
            where: { id: primary.id },
            data: contactData,
          });
        else
          await transaction.emergencyContact.create({
            data: { ...contactData, employeeId: employee.id },
          });
      }
    });
    await writeAudit(
      "PROFILE_UPDATED",
      actor.userId,
      "employee",
      actor.employeeId,
    );
    try {
      await sendProfileUpdateToTelegram(profile, {
        employeeId: actor.employeeId,
        role: actor.role,
        name: `${profile.first} ${profile.last}`.trim(),
      }, {
        jobTitle: employee.jobTitle,
        department: employee.department?.name ?? "",
        manager: employee.manager
          ? `${employee.manager.preferredName || employee.manager.legalFirstName} ${employee.manager.lastName}`
          : "",
        employmentType: employee.employmentType,
        status: employee.status,
        hireDate: employee.hireDate.toISOString().slice(0, 10),
        workLocation: employee.workLocation ?? "",
        workSchedule: employee.workSchedule ?? "",
        team: employee.team ?? "",
      });
    } catch (error) {
      console.warn("Profile saved, but Telegram notification failed", error);
    }
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Profile update failed", error);
    return jsonError("Your profile couldn’t be saved. Please try again.", 503);
  }
}
