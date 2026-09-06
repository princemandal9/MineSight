import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MineSight Coal Mine Governance Database...");

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.observation.deleteMany();
  await prisma.license.deleteMany();
  await prisma.machinery.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.explosivesStock.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.environmentalLog.deleteMany();

  // Create Default Test Users
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.default.hash("password123", 10);
  const supervisorPassword = await bcrypt.default.hash("admin123", 10);

  const defaultContractorUser = await prisma.user.create({
    data: {
      name: "Apex Site Manager",
      email: "contractor@abc.com",
      password: hashedPassword,
      role: "CONTRACTOR",
      companyName: "Apex Blasting & Explosives Ltd.",
      taskType: "blasting",
    },
  });

  const defaultSupervisorUser = await prisma.user.create({
    data: {
      name: "Inspector R. Verma",
      email: "supervisor@minesight.in",
      password: supervisorPassword,
      role: "SUPERVISOR",
    },
  });

  // 1. Create Contractor 1 (Blasting - Flagged/High Risk)
  const contractor1 = await prisma.contractor.create({
    data: {
      contractorCode: "CON-0114",
      name: "Apex Blasting & Explosives Ltd.",
      email: "contact@apexblasting.in",
      phone: "+91 98765 43210",
      taskType: "blasting",
      riskLevel: "CRITICAL",
      violationCount: 2,
      isRestricted: true,
      activeWorkers: 42,
      activeMachinery: 6,
      complianceRate: 60.0,
      status: "ACTIVE",
      licenses: {
        create: [
          {
            documentType: "Contract Labour License",
            documentNumber: "CL-2026-0417",
            holder: "Apex Blasting & Explosives",
            expiryDate: new Date("2026-11-30"),
            status: "VALID",
          },
          {
            documentType: "Blaster's Certificate (DGMS)",
            documentNumber: "BC-11894",
            holder: "R. Sharma",
            expiryDate: new Date("2026-09-24"), // 18 days left
            status: "EXPIRING_SOON",
          },
          {
            documentType: "Explosives License",
            documentNumber: "EXP-WB-2291",
            holder: "Apex Blasting Ltd",
            expiryDate: new Date("2026-10-05"),
            status: "VALID",
          },
        ],
      },
      machinery: {
        create: [
          {
            machineName: "Hydraulic Excavator (x5)",
            ownership: "OWNED",
            lastServiced: new Date("2026-08-02"),
            nextDue: new Date("2026-11-02"),
            status: "ACTIVE",
          },
          {
            machineName: "Drilling Machine Rig 01",
            ownership: "OWNED",
            lastServiced: new Date("2026-07-14"),
            nextDue: new Date("2026-09-14"),
            status: "DUE_SOON",
          },
          {
            machineName: "Water Tanker (x3)",
            ownership: "OWNED",
            lastServiced: new Date("2026-06-10"),
            nextDue: new Date("2026-09-10"),
            status: "OVERDUE",
          },
        ],
      },
      explosivesStock: {
        create: [
          {
            explosiveType: "Site-mix emulsion",
            procured: 2400,
            used: 2180,
            remaining: 220,
            unit: "kg",
          },
          {
            explosiveType: "Detonators",
            procured: 600,
            used: 540,
            remaining: 60,
            unit: "units",
          },
        ],
      },
      workers: {
        create: [
          {
            workerCode: "Worker #0114",
            fullName: "Ram Lakhan Yadav",
            role: "Blasting Helper",
            trainingStatus: "COMPLETE",
            ppeIssued: true,
          },
          {
            workerCode: "Worker #0115",
            fullName: "Bikram Murmu",
            role: "Magazine Guard",
            trainingStatus: "MISSING",
            ppeIssued: true,
          },
          {
            workerCode: "Worker #0116",
            fullName: "Devendra Singh",
            role: "Shot-firer Assistant",
            trainingStatus: "COMPLETE",
            ppeIssued: false,
          },
        ],
      },
    },
  });

  // 2. Create Contractor 2 (Transportation - Fully Compliant)
  const contractor2 = await prisma.contractor.create({
    data: {
      contractorCode: "CON-0205",
      name: "Vanguard Haulage & Logistics",
      email: "dispatch@vanguardhaulage.com",
      phone: "+91 98111 22334",
      taskType: "transportation",
      riskLevel: "LOW",
      violationCount: 0,
      isRestricted: false,
      activeWorkers: 65,
      activeMachinery: 14,
      complianceRate: 100.0,
      status: "ACTIVE",
      licenses: {
        create: [
          {
            documentType: "Contract Labour License",
            documentNumber: "CL-2026-0922",
            holder: "Vanguard Haulage",
            expiryDate: new Date("2027-01-15"),
            status: "VALID",
          },
          {
            documentType: "Commercial Fleet Heavy Permit",
            documentNumber: "CFP-JH-8831",
            holder: "Vanguard Haulage",
            expiryDate: new Date("2027-08-20"),
            status: "VALID",
          },
        ],
      },
      machinery: {
        create: [
          {
            machineName: "Dumper / Tipper (30-35T) Fleet (x8)",
            ownership: "RENTED",
            lastServiced: new Date("2026-08-20"),
            nextDue: new Date("2026-11-20"),
            status: "ACTIVE",
          },
          {
            machineName: "Water Tanker Dust Suppressor",
            ownership: "OWNED",
            lastServiced: new Date("2026-08-15"),
            nextDue: new Date("2026-11-15"),
            status: "ACTIVE",
          },
        ],
      },
    },
  });

  // 3. Create Contractor 3 (Excavation - Moderate Risk)
  const contractor3 = await prisma.contractor.create({
    data: {
      contractorCode: "CON-0312",
      name: "Eastern Overburden Earthmovers",
      email: "ops@easternearth.in",
      phone: "+91 97222 33445",
      taskType: "excavation",
      riskLevel: "MODERATE",
      violationCount: 1,
      isRestricted: false,
      activeWorkers: 50,
      activeMachinery: 9,
      complianceRate: 85.0,
      status: "ACTIVE",
    },
  });

  // 4. Create Observations for Contractor 1 (Triggering the red-flag)
  const obs1 = await prisma.observation.create({
    data: {
      observationCode: "OBS-2026-0001",
      contractorId: contractor1.id,
      supervisorName: "Inspector R. Verma",
      zone: "Pit A - Sector 3",
      category: "EQUIPMENT",
      severity: "CRITICAL",
      description: "Drilling Machine Rig 01 operating past maintenance schedule with leaking hydraulic oil.",
      gpsCoordinates: "23.7957° N, 86.4304° E",
      status: "OPEN",
      auditLogs: {
        create: {
          action: "CREATED",
          actorRole: "SUPERVISOR",
          actorName: "Inspector R. Verma",
          details: "Field observation logged in Pit A. Contractor profile red-flagged.",
        },
      },
    },
  });

  const obs2 = await prisma.observation.create({
    data: {
      observationCode: "OBS-2026-0002",
      contractorId: contractor1.id,
      supervisorName: "Inspector K. Sen",
      zone: "Zone B - Loading Point",
      category: "PPE",
      severity: "MODERATE",
      description: "Worker #0116 spotted without approved safety helmet and reflective vest.",
      gpsCoordinates: "23.7981° N, 86.4320° E",
      status: "OPEN",
      auditLogs: {
        create: {
          action: "CREATED",
          actorRole: "SUPERVISOR",
          actorName: "Inspector K. Sen",
          details: "Safety violation logged during morning site inspection.",
        },
      },
    },
  });

  // 5. Environmental Log
  await prisma.environmentalLog.create({
    data: {
      date: new Date(),
      dailyTonnage: 1420.5,
      pm10Dust: 86.0,
      effluentPh: 7.2,
      noiseDb: 79.5,
      riskScore: 28.0,
      riskLabel: "Low",
      loggedBy: "Supervisor R. Verma",
      notes: "Weather clear, wind direction SW. Continuous dust suppression active.",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`- Created 3 Contractors (${contractor1.name}, ${contractor2.name}, ${contractor3.name})`);
  console.log(`- Created 2 Active Observations (${obs1.observationCode}, ${obs2.observationCode})`);
  console.log(`- Logged Daily Environmental & Yield readings`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

