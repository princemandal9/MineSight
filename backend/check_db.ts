import "dotenv/config";
import { prisma } from "./src/models/prisma";

async function main() {
    const logs = await prisma.environmentalLog.findMany({
        where: { parameter: "PM10" }
    });
    console.log(logs);
}
main();
