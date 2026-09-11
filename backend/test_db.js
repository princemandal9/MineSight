const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const licenses = await prisma.license.findMany();
    console.log("Licenses:", licenses.length);
}
main().finally(() => prisma.$disconnect());
