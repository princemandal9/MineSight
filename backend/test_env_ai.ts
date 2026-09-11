import "dotenv/config";
import { EnvironmentalDocumentAIProvider } from "./src/services/environmental-ai.provider";

async function main() {
    console.log("Testing EnvironmentalDocumentAIProvider...");
    try {
        const dummyBuffer = Buffer.from("Test Document PM10 = 50.1 limit 100 PASS");
        const result = await EnvironmentalDocumentAIProvider.extract(dummyBuffer, "text/plain");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch(e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
main();
