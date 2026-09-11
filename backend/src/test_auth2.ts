import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(KEY);

async function testFetch() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    const result = await model.generateContent("Give me a JSON with { status: 'ok' }");
    console.log("Status: OK");
    console.log(result.response.text());
  } catch (e: any) {
    console.log("Error object:", e);
    console.log("Error status:", e.status);
    console.log("Error message:", e.message);
  }
}

testFetch();
