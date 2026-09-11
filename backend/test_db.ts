import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const report = await prisma.environmentalReport.findFirst({ orderBy: { updatedAt: 'desc' }});
  const logs = await prisma.environmentalLog.findMany({ where: { environmentalReportId: report.id }});
  console.log("EnvironmentalLog count:", logs.length);
  if (logs.length > 0) {
    console.log("EnvironmentalLog date:", logs[0].date);
  }
}
main();
