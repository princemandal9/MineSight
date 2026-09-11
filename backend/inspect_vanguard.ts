import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function inspect() {
  const v = await prisma.contractor.findUnique({
    where: { id: "767c7ea2-fd71-403e-9057-77c92ca2a319" },
    include: { observations: true, statutoryObligations: true }
  });
  console.log(JSON.stringify(v, null, 2));
}
inspect();
