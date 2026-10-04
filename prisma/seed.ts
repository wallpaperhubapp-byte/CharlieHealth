import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("Welcome123!");

  const operationsDepartment = await prisma.department.upsert({
    where: { name: "Operations" },
    update: {},
    create: { name: "Operations" },
  });

  const clinicalDepartment = await prisma.department.upsert({
    where: { name: "Clinical" },
    update: {},
    create: { name: "Clinical" },
  });

  const peopleDepartment = await prisma.department.upsert({
    where: { name: "People Operations" },
    update: {},
    create: { name: "People Operations" },
  });

  const assistanceDepartment = await prisma.department.upsert({
    where: { name: "Financial Assistance" },
    update: {},
    create: { name: "Financial Assistance" },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "alex.morgan@charliehealth.example" },
    update: { passwordHash, role: Role.MANAGER },
    create: {
      email: "alex.morgan@charliehealth.example",
      passwordHash,
      role: Role.MANAGER,
    },
  });

  const managerEmployee = await prisma.employee.upsert({
    where: { workEmail: "alex.morgan@charliehealth.example" },
    update: {
      userId: managerUser.id,
      departmentId: operationsDepartment.id,
      legalFirstName: "Alex",
      lastName: "Morgan",
      preferredName: "Alex",
      jobTitle: "Operations Coordinator",
      employmentType: "FULL_TIME",
      hireDate: new Date("2022-04-15T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Remote - Portland, OR",
      team: "Operations",
    },
    create: {
      employeeNumber: "EMP-1001",
      userId: managerUser.id,
      departmentId: operationsDepartment.id,
      legalFirstName: "Alex",
      lastName: "Morgan",
      preferredName: "Alex",
      workEmail: "alex.morgan@charliehealth.example",
      jobTitle: "Operations Coordinator",
      employmentType: "FULL_TIME",
      hireDate: new Date("2022-04-15T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Remote - Portland, OR",
      team: "Operations",
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: "harper.johnson@charliehealth.example" },
    update: { passwordHash, role: Role.HR_ADMIN },
    create: {
      email: "harper.johnson@charliehealth.example",
      passwordHash,
      role: Role.HR_ADMIN,
    },
  });

  await prisma.employee.upsert({
    where: { workEmail: "harper.johnson@charliehealth.example" },
    update: {
      userId: hrUser.id,
      departmentId: peopleDepartment.id,
      managerId: managerEmployee.id,
      legalFirstName: "Harper",
      lastName: "Johnson",
      preferredName: "Harper",
      workEmail: "harper.johnson@charliehealth.example",
      jobTitle: "People Operations Partner",
      employmentType: "FULL_TIME",
      hireDate: new Date("2021-10-12T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Hybrid - Chicago, IL",
      team: "People Operations",
    },
    create: {
      employeeNumber: "EMP-1002",
      userId: hrUser.id,
      departmentId: peopleDepartment.id,
      managerId: managerEmployee.id,
      legalFirstName: "Harper",
      lastName: "Johnson",
      preferredName: "Harper",
      workEmail: "harper.johnson@charliehealth.example",
      jobTitle: "People Operations Partner",
      employmentType: "FULL_TIME",
      hireDate: new Date("2021-10-12T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Hybrid - Chicago, IL",
      team: "People Operations",
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: "mila.park@charliehealth.example" },
    update: { passwordHash, role: Role.EMPLOYEE },
    create: {
      email: "mila.park@charliehealth.example",
      passwordHash,
      role: Role.EMPLOYEE,
    },
  });

  await prisma.employee.upsert({
    where: { workEmail: "mila.park@charliehealth.example" },
    update: {
      userId: employeeUser.id,
      departmentId: clinicalDepartment.id,
      managerId: managerEmployee.id,
      legalFirstName: "Mila",
      lastName: "Park",
      preferredName: "Mila",
      workEmail: "mila.park@charliehealth.example",
      jobTitle: "Care Coordinator",
      employmentType: "FULL_TIME",
      hireDate: new Date("2023-06-20T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Remote - Denver, CO",
      team: "Clinical Operations",
    },
    create: {
      employeeNumber: "EMP-1003",
      userId: employeeUser.id,
      departmentId: clinicalDepartment.id,
      managerId: managerEmployee.id,
      legalFirstName: "Mila",
      lastName: "Park",
      preferredName: "Mila",
      workEmail: "mila.park@charliehealth.example",
      jobTitle: "Care Coordinator",
      employmentType: "FULL_TIME",
      hireDate: new Date("2023-06-20T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Remote - Denver, CO",
      team: "Clinical Operations",
    },
  });

  const realUserPasswordHash = await argon2.hash("Password@1010");
  const realUser = await prisma.user.upsert({
    where: { email: "rudyoroco188@gmail.com" },
    update: {
      passwordHash: realUserPasswordHash,
      role: Role.EMPLOYEE,
    },
    create: {
      email: "rudyoroco188@gmail.com",
      passwordHash: realUserPasswordHash,
      role: Role.EMPLOYEE,
    },
  });

  await prisma.employee.upsert({
    where: { workEmail: "rudyoroco188@gmail.com" },
    update: {
      userId: realUser.id,
      departmentId: assistanceDepartment.id,
      legalFirstName: "Rudy",
      lastName: "Orozco",
      preferredName: "Rudy",
      workEmail: "rudyoroco188@gmail.com",
      personalEmail: "rudyoroco188@gmail.com",
      phone: "9183210635",
      city: "Galveston",
      state: "Texas",
      jobTitle: "Remote Financial Assistance Coordinator",
      employmentType: "FULL_TIME",
      hireDate: new Date("2024-02-10T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Remote - Galveston, TX",
      team: "Financial Assistance",
      country: "US",
    },
    create: {
      employeeNumber: "CH-8890",
      userId: realUser.id,
      departmentId: assistanceDepartment.id,
      legalFirstName: "Rudy",
      lastName: "Orozco",
      preferredName: "Rudy",
      workEmail: "rudyoroco188@gmail.com",
      personalEmail: "rudyoroco188@gmail.com",
      phone: "9183210635",
      city: "Galveston",
      state: "Texas",
      jobTitle: "Remote Financial Assistance Coordinator",
      employmentType: "FULL_TIME",
      hireDate: new Date("2024-02-10T00:00:00.000Z"),
      status: "ACTIVE",
      workLocation: "Remote - Galveston, TX",
      team: "Financial Assistance",
      country: "US",
    },
  });

  console.log("Seeded Charlie Health employees and standard accounts.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
