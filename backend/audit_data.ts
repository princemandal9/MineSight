import { PrismaClient } from "@prisma/client";
import { RiskService } from "./src/services/risk.service";

const prisma = new PrismaClient();

async function runAudit() {
  console.log("=== DB COUNTS ===");
  const counts = {
    contractors: await prisma.contractor.count(),
    users: await prisma.user.count(),
    observations: await prisma.observation.count(),
    obligations: await prisma.statutoryObligation.count(),
    notifications: await prisma.notification.count(),
    escalations: await prisma.escalation.count(),
    environmentalLogs: await prisma.environmentalLog.count(),
    environmentalReports: await prisma.environmentalReport.count(),
  };
  console.log(JSON.stringify(counts, null, 2));

  console.log("\n=== CONTRACTORS ===");
  const contractors = await prisma.contractor.findMany({
    include: {
      _count: {
        select: {
          observations: true,
          statutoryObligations: true,
          Notification: true,
        },
      },
    },
  });

  for (const c of contractors) {
    const user = await prisma.user.findFirst({ where: { contractorId: c.id } });
    const risk = await RiskService.calculateContractorRisk(c.id);
    console.log(`\n- ${c.name} (ID: ${c.id})`);
    console.log(`  User: ${user?.email || "None"} | Status: ${c.status}`);
    console.log(`  Counts: Obs(${c._count.observations}) Oblig(${c._count.statutoryObligations}) Notif(${c._count.Notification})`);
    console.log(`  Risk: Score=${risk.riskScore}, Level=${risk.riskLevel}`);
  }

  await prisma.$disconnect();
}

runAudit().catch(console.error);
