import "dotenv/config";
import { AIGovernanceProvider } from "./src/services/governance-ai.provider";
import { prisma } from "./src/models/prisma";

async function main() {
    try {
        const contractor = await prisma.contractor.findFirst();
        console.log(`Analyzing contractor: ${contractor!.name}`);
        const result = await AIGovernanceProvider.analyzeContractor(contractor!.id);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch(e) {
        console.error("Caught error:", e);
    }
}
main();
