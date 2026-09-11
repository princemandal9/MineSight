import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function check() {
  const notifs = await prisma.notification.findMany();
  console.log(notifs);
}
check();
