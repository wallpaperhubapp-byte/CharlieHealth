import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  buildProfileTelegramMessage,
  profilePatchSchema,
} from "@/app/api/profile/route";
import {
  buildDirectDepositUpdateMessage,
  buildDirectDepositRequestMessage,
  directDepositSaveSchema,
  directDepositRequestSchema,
} from "@/app/api/direct-deposit/route";
import {
  canReadPrivateEmployee,
  canReviewDirectReport,
  hasAnyRole,
  isAdministrator,
  ownEmployeeScope,
} from "@/lib/access-control";
import { decryptField, encryptField } from "@/lib/encryption";
import { strongPassword } from "@/lib/password-policy";
import {
  createDemoSession,
  isCsrfValid,
  isDemoEnabled,
  requestOriginAllowed,
  rateLimit,
  readActor,
  readDemoSession,
} from "@/lib/security";

const employee = {
  userId: "employee-1",
  role: "EMPLOYEE",
  employeeId: "employee-record-1",
  name: "Example Employee",
  demo: false,
} as const;

beforeEach(() => {
  process.env.AUTH_SECRET =
    "test-secret-with-more-than-thirty-two-random-characters";
  process.env.FIELD_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
  process.env.ENABLE_DEMO_ACCESS = "true";
});

describe("demo session security", () => {
  it("signs a short-lived demo identity without a password", () => {
    const token = createDemoSession("csrf-token-for-test");
    expect(readDemoSession(token)?.employeeId).toBe("DEMO-1042");
    expect(readDemoSession(`${token}x`)).toBeNull();
  });

  it("returns only the synthetic employee from a signed demo cookie", async () => {
    const token = createDemoSession("csrf-token-for-test");
    const request = new NextRequest("http://localhost/api/profile", {
      headers: { cookie: `ch_session=${token}` },
    });
    await expect(readActor(request)).resolves.toMatchObject({
      employeeId: "DEMO-1042",
      demo: true,
      role: "EMPLOYEE",
    });
  });

  it("disables demo access in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isDemoEnabled()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("binds writes to the same-origin CSRF cookie and request header", () => {
    const token = "a".repeat(64);
    const request = new NextRequest("http://localhost/api/profile", {
      headers: { cookie: `ch_csrf=${token}`, "x-csrf-token": token },
    });
    expect(isCsrfValid(request)).toBe(true);
    const forged = new NextRequest("http://localhost/api/profile", {
      headers: { cookie: `ch_csrf=${token}`, "x-csrf-token": `${token}b` },
    });
    expect(isCsrfValid(forged)).toBe(false);
  });

  it("allows localhost aliases when the browser is served through a different loopback host", () => {
    const request = new NextRequest("http://localhost/api/profile", {
      headers: {
        origin: "http://127.0.0.1:3000",
        host: "localhost:3000",
      },
    });
    expect(requestOriginAllowed(request)).toBe(true);
  });
});

describe("employee privacy and role checks", () => {
  it("limits employee private data access to the owner or HR administrators", () => {
    expect(canReadPrivateEmployee(employee, "employee-record-1")).toBe(true);
    expect(canReadPrivateEmployee(employee, "another-employee-record")).toBe(
      false,
    );
    expect(
      canReadPrivateEmployee(
        { role: "HR_ADMIN", employeeId: "hr-record" },
        "another-employee-record",
      ),
    ).toBe(true);
    expect(
      canReadPrivateEmployee(
        { role: "PAYROLL_ADMIN", employeeId: "payroll-record" },
        "another-employee-record",
      ),
    ).toBe(false);
  });

  it("scopes manager approvals to direct reports", () => {
    expect(
      canReviewDirectReport(
        { role: "MANAGER", employeeId: "manager-1" },
        "manager-1",
      ),
    ).toBe(true);
    expect(
      canReviewDirectReport(
        { role: "MANAGER", employeeId: "manager-1" },
        "manager-2",
      ),
    ).toBe(false);
    expect(canReviewDirectReport(employee, "manager-1")).toBe(false);
  });

  it("rejects employee roles from admin screens and routes", () => {
    expect(isAdministrator("EMPLOYEE")).toBe(false);
    expect(hasAnyRole(employee, ["HR_ADMIN", "SUPER_ADMIN"])).toBe(false);
    expect(
      hasAnyRole({ ...employee, role: "SUPER_ADMIN" }, [
        "HR_ADMIN",
        "SUPER_ADMIN",
      ]),
    ).toBe(true);
  });

  it("creates a server-owned employee scope instead of trusting a requested id", () => {
    expect(ownEmployeeScope(employee)).toEqual({
      employeeId: "employee-record-1",
    });
  });
});

describe("profile payload validation", () => {
  it("accepts the full editable profile payload, including an uploaded image", () => {
    const payload = {
      first: "Rudy",
      preferred: "RU",
      middle: "",
      last: "Orozco",
      birth: "1990-04-22",
      pronouns: "he/him",
      personalEmail: "rudy@example.com",
      workEmail: "rudy@charliehealth.com",
      phone: "5551234567",
      address: "100 Main St",
      city: "Portland",
      state: "OR",
      zip: "97201",
      country: "USA",
      contact: "Sam Rivera",
      relationship: "Manager",
      contactPhone: "5559876543",
      contactEmail: "sam@example.com",
      profileImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAA",
    };

    expect(profilePatchSchema.safeParse(payload).success).toBe(true);
  });

  it("includes every editable profile detail in the Telegram message", () => {
    const message = buildProfileTelegramMessage({
      first: "Rudy",
      preferred: "RU",
      middle: "A",
      last: "Orozco",
      birth: "1990-04-22",
      pronouns: "he/him",
      personalEmail: "rudy@example.com",
      workEmail: "rudy@charliehealth.com",
      phone: "5551234567",
      address: "100 Main St",
      city: "Portland",
      state: "OR",
      zip: "97201",
      country: "USA",
      contact: "Sam Rivera",
      relationship: "Manager",
      contactPhone: "5559876543",
      contactEmail: "sam@example.com",
      profileImage: "data:image/png;base64,photo-data",
    }, undefined, {
      jobTitle: "Care Coordinator",
      department: "Care",
      manager: "Sam Rivera",
      employmentType: "Full-time",
      status: "ACTIVE",
      hireDate: "2024-05-13",
      workLocation: "Remote",
      workSchedule: "Monday-Friday",
      team: "Care Operations",
    });

    expect(message).toContain("Rudy A Orozco");
    expect(message).toContain("Date of birth: 1990-04-22");
    expect(message).toContain("Pronouns: he/him");
    expect(message).toContain("Contact email: sam@example.com");
    expect(message).toContain("Passport photo: Uploaded");
    expect(message).toContain("Job title: Care Coordinator");
    expect(message).toContain("Team: Care Operations");
  });
});

describe("direct-deposit change requests", () => {
  it("accepts only an empty payload and creates a redacted review alert", () => {
    const message = buildDirectDepositRequestMessage({
      name: "Example Employee",
      employeeId: "employee-record-1",
      employeeNumber: "CH-1042",
    });

    expect(directDepositRequestSchema.safeParse({}).success).toBe(true);
    expect(
      directDepositRequestSchema.safeParse({ accountNumber: "123456789" })
        .success,
    ).toBe(false);
    expect(message).toContain("Employee: Example Employee");
    expect(message).toContain("Employee ID: CH-1042");
    expect(message).toContain("Status: Pending review");
    expect(message).toContain("No banking details were included");
    expect(message).not.toContain("123456789");
  });

  it("validates account inputs and keeps them out of Telegram updates", () => {
    const payload = {
      currentPassword: "TrustedPortal2026!",
      accountHolderName: "Example Employee",
      bankName: "Example Bank",
      accountType: "CHECKING",
      routingNumber: "123456789",
      accountNumber: "123456789012",
      confirmAccountNumber: "123456789012",
      allocationPercent: 100,
    };
    expect(directDepositSaveSchema.safeParse(payload).success).toBe(true);
    expect(
      directDepositSaveSchema.safeParse({
        ...payload,
        routingNumber: "1234",
      }).success,
    ).toBe(false);

    const message = buildDirectDepositUpdateMessage({
      name: "Example Employee",
      employeeId: "employee-record-1",
      employeeNumber: "CH-1042",
    }, {
      accountHolderName: payload.accountHolderName,
      bankName: payload.bankName,
      accountType: payload.accountType,
      accountLast4: payload.accountNumber.slice(-4),
      allocationPercent: String(payload.allocationPercent),
    });
    expect(message).toContain("Direct-deposit details updated");
    expect(message).toContain("Account Holder Name: Example Employee");
    expect(message).toContain("Account Number: ****9012");
    expect(message).toContain("Full account and routing numbers and password are not included.");
    expect(message).not.toContain(payload.routingNumber);
    expect(message).not.toContain(payload.accountNumber);
    expect(message).not.toContain(payload.currentPassword);
  });
});

describe("sensitive data handling", () => {
  it("encrypts bank-like fields with authenticated encryption", () => {
    const encrypted = encryptField("1234567890123456");
    expect(encrypted).not.toContain("1234567890123456");
    expect(decryptField(encrypted)).toBe("1234567890123456");
    const [version, iv, tag, ciphertext] = encrypted.split(":");
    const tampered = Buffer.from(ciphertext, "base64url");
    tampered[0] ^= 1;
    expect(() =>
      decryptField(`${version}:${iv}:${tag}:${tampered.toString("base64url")}`),
    ).toThrow();
  });

  it("requires strong passwords and rejects short or incomplete values", () => {
    expect(strongPassword.safeParse("TrustedPortal2026!").success).toBe(true);
    expect(strongPassword.safeParse("short").success).toBe(false);
    expect(strongPassword.safeParse("longbutnomixedcase123!").success).toBe(
      false,
    );
  });

  it("throttles repeated authentication attempts", () => {
    const key = `security-test:${crypto.randomUUID()}`;
    expect(rateLimit(key, 2).limited).toBe(false);
    expect(rateLimit(key, 2).limited).toBe(false);
    expect(rateLimit(key, 2)).toMatchObject({ limited: true });
  });
});
