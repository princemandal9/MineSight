import { config } from "dotenv";
config();
import { AIGovernanceProvider } from "./src/services/governance-ai.provider";

async function run() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const contractor = await prisma.contractor.findFirst();
    if (!contractor) {
        console.log("No contractor found");
        return;
    }
    console.log(`Testing with contractor: ${contractor.id}`);
    const res = await AIGovernanceProvider.analyzeContractor(contractor.id);
    console.log("Success!", res);
  } catch (err: any) {
    console.log("Error:", err.message);
  }
}
run();
