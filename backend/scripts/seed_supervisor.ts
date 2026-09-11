import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERVISOR_EMAIL || "supervisor@minesight.com";
  const password = process.env.SUPERVISOR_PASSWORD || "Admin@123";

  // Check if supervisor already exists
  const existingSupervisor = await prisma.user.findUnique({
    where: { email },
  });

  if (existingSupervisor) {
    console.log(`Supervisor account with email ${email} already exists. Skipping creation.`);
    
    // Optionally update the role just to be safe
    if (existingSupervisor.role !== "SUPERVISOR") {
      await prisma.user.update({
        where: { email },
        data: { role: "SUPERVISOR" },
      });
      console.log(`Updated existing user ${email} to SUPERVISOR role.`);
    }
  } else {
    // Create new supervisor
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        name: "Mine Supervisor",
        email,
        password: hashedPassword,
        role: "SUPERVISOR",
      },
    });

    console.log(`Successfully created dedicated Supervisor account with email: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
