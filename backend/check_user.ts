import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function check() {
  const user = await prisma.user.findUnique({ where: { id: "61ded305-f2b9-451b-9bd3-e7db7710bd05" } });
  console.log(user);
}
check();
