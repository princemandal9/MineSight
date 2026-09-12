import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.contractor.findFirst({ where: { email: "eastern.contractor@minesight.com" } });
  console.log(c?.status, c?.rejectionReason);
}
main();
