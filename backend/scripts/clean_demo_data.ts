import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const APEX_ID = "2c43f221-d333-435c-98b4-93f1f0e001a1";
const NORTHWEST_ID = "767c7ea2-fd71-403e-9057-77c92ca2a319";
const EASTERN_ID = "648f529c-ffbd-48ba-8d29-636b7ef4a843";
const RETAINED_IDS = [APEX_ID, NORTHWEST_ID, EASTERN_ID];

async function runCleanup() {
  console.log("Starting MineSight database cleanup...");
  const hashedPassword = await bcrypt.hash("Demo@123", 10);
  const supervisorPassword = await bcrypt.hash("Admin@123", 10);

  // 1. Transaction to delete obsolete data safely
  await prisma.$transaction(async (tx) => {
    // Identify obsolete contractors
    const obsoleteContractors = await tx.contractor.findMany({
      where: { id: { notIn: RETAINED_IDS } },
      select: { id: true }
    });
    const obsoleteIds = obsoleteContractors.map(c => c.id);

    if (obsoleteIds.length > 0) {
      console.log(`Deleting ${obsoleteIds.length} obsolete contractors...`);
      
      // Delete manual cascading relations
      await tx.notification.deleteMany({ where: { contractorId: { in: obsoleteIds } } });
      await tx.inspection.deleteMany({ where: { contractorId: { in: obsoleteIds } } });
      await tx.worker.deleteMany({ where: { contractorId: { in: obsoleteIds } } });
      
      // Delete AuditLogs tied to obsolete contractors, their observations, or obligations
      const obsoleteObs = await tx.observation.findMany({ where: { contractorId: { in: obsoleteIds } }, select: { id: true } });
      const obsoleteObligs = await tx.statutoryObligation.findMany({ where: { contractorId: { in: obsoleteIds } }, select: { id: true } });
      
      await tx.auditLog.deleteMany({
        where: {
          OR: [
            { contractorId: { in: obsoleteIds } },
            { observationId: { in: obsoleteObs.map(o => o.id) } },
            { obligationId: { in: obsoleteObligs.map(o => o.id) } }
          ]
        }
      });

      // Delete the contractors (Prisma cascades the rest)
      await tx.contractor.deleteMany({ where: { id: { in: obsoleteIds } } });
      
      // Delete obsolete users (not Supervisor, not linked to retained contractors)
      await tx.user.deleteMany({
        where: {
          role: { not: "SUPERVISOR" },
          OR: [
            { contractorId: { notIn: RETAINED_IDS } },
            { contractorId: null }
          ]
        }
      });
    }

    // 2. Setup Supervisor
    const supervisor = await tx.user.findFirst({ where: { email: "supervisor@minesight.com" } });
    if (supervisor) {
      await tx.user.update({
        where: { id: supervisor.id },
        data: { password: supervisorPassword }
      });
    } else {
      console.warn("Supervisor account not found, please check DB");
    }

    // 3. Rename and modify Retained Contractors
    // APEX
    await tx.contractor.update({
      where: { id: APEX_ID },
      data: { status: "ACTIVE" }
    });
    await upsertContractorUser(tx, APEX_ID, "Apex Blasting & Explosives Ltd.", "apex.contractor@minesight.com", hashedPassword);

    // NORTHWEST
    await tx.contractor.update({
      where: { id: NORTHWEST_ID },
      data: { name: "Northwest Mining Services Ltd.", status: "ACTIVE" }
    });
    await upsertContractorUser(tx, NORTHWEST_ID, "Northwest Mining Services Ltd.", "northwest.contractor@minesight.com", hashedPassword);
    
    // Inject OVERDUE obligation to Northwest (if not already there)
    const nwObligCheck = await tx.statutoryObligation.findFirst({
        where: { contractorId: NORTHWEST_ID, title: "[DEMO] Overdue Safety Audit" }
    });
    if (!nwObligCheck) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);
        await tx.statutoryObligation.create({
            data: {
                title: "[DEMO] Overdue Safety Audit",
                description: "Required structural safety audit for haulage equipment.",
                domain: "SAFETY",
                frequency: "MONTHLY",
                dueDate: pastDate,
                status: "OVERDUE",
                contractorId: NORTHWEST_ID
            }
        });
    }

    // EASTERN
    await tx.contractor.update({
      where: { id: EASTERN_ID },
      data: { name: "Eastern Coal Logistics Pvt. Ltd.", status: "ACTIVE" }
    });
    await upsertContractorUser(tx, EASTERN_ID, "Eastern Coal Logistics Pvt. Ltd.", "eastern.contractor@minesight.com", hashedPassword);

    // Inject COMPLIANT obligation to Eastern (if not already there)
    const easternObligCheck = await tx.statutoryObligation.findFirst({
        where: { contractorId: EASTERN_ID }
    });
    if (!easternObligCheck) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        await tx.statutoryObligation.create({
            data: {
                title: "[DEMO] Valid Fleet Registration",
                description: "Submission of all commercial vehicle registrations.",
                domain: "SAFETY",
                frequency: "ANNUALLY",
                dueDate: futureDate,
                status: "COMPLIANT",
                contractorId: EASTERN_ID
            }
        });
    }
  });

  console.log("Cleanup complete!");
}

async function upsertContractorUser(tx: any, contractorId: string, name: string, email: string, passwordHash: string) {
  const existing = await tx.user.findFirst({ where: { contractorId } });
  if (existing) {
    await tx.user.update({
      where: { id: existing.id },
      data: { email, name, password: passwordHash, role: "CONTRACTOR" }
    });
  } else {
    await tx.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role: "CONTRACTOR",
        contractorId
      }
    });
  }
}

runCleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
