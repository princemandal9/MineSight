import { prisma } from "../models/prisma";
import { EnvironmentalDocumentAIProvider } from "./environmental-ai.provider";
import { AIProviderError } from "./gemini-core.provider";
import { z } from "zod";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";

// ─────────────────────────────────────────────
// Zod Schema — final validation boundary
// ─────────────────────────────────────────────
const measurementSchema = z.object({
  category: z.string().nullable().optional(),
  siteId: z.string().nullable().optional(),
  siteName: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  parameter: z.string(),
  value: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  regulatoryLimit: z.number().nullable().optional(),
  status: z.enum(["PASS", "FAIL", "UNKNOWN"]).nullable().optional(),
  source: z.object({
    page: z.number().nullable().optional(),
    text: z.string().nullable().optional()
  }).nullable().optional()
});

export const extractionSchema = z.object({
  document: z.object({
    title: z.string().nullable().optional(),
    reportId: z.string().nullable().optional(),
    facilityName: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    samplingDate: z.string().nullable().optional(),
    reportingPeriod: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
    documentType: z.string().nullable().optional(),
  }).nullable().optional(),
  measurements: z.array(measurementSchema).optional().default([]),
  complianceFindings: z.array(z.any()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function computeHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// ─────────────────────────────────────────────
// EnvironmentalReportService
// ─────────────────────────────────────────────
export class EnvironmentalReportService {

  /**
   * Analyze an uploaded environmental document via Gemini AI.
   * 
   * Flow:
   *   1. Compute SHA-256 hash of the uploaded file.
   *   2. Call EnvironmentalDocumentAIProvider (primary Gemini 2.5 Flash → fallback Flash-Lite).
   *   3. Validate the structured output with Zod.
   *   4. If AI fails (all retries exhausted), check if a previously confirmed extraction exists for this exact document.
   *   5. If cached extraction found → return it with resultType: "CACHED".
   *   6. If no cache → throw AIProviderError for controlled frontend error.
   */
  public static async analyzeDocument(file: Express.Multer.File): Promise<{
    extraction: any;
    resultType: "LIVE" | "CACHED";
    model?: string;
    usedFallback?: boolean;
  }> {
    if (!file) throw new Error("No file provided.");

    const documentHash = computeHash(file.buffer);

    // --- Attempt live AI extraction ---
    try {
      const { data: rawExtraction, model, usedFallback } =
        await EnvironmentalDocumentAIProvider.extract(file.buffer, file.mimetype);

      // Zod validation — the final backend boundary
      let validated;
      try {
        validated = extractionSchema.parse(rawExtraction);
      } catch (zodErr: any) {
        console.error("[EnvironmentalAI] Zod validation failed:", zodErr);
        throw new AIProviderError(
          "AI_MALFORMED_RESPONSE",
          "AI returned a structurally invalid response.",
          model
        );
      }

      return {
        extraction: validated,
        resultType: "LIVE",
        model,
        usedFallback,
      };

    } catch (aiErr: any) {
      const isAIError = aiErr instanceof AIProviderError;
      const isRetryable = isAIError && aiErr.retryable;

      // Only check cache for transient/retryable provider failures
      if (!isRetryable) throw aiErr;

      console.warn(`[EnvironmentalAI] Live extraction failed. Checking cache for hash=${documentHash.substring(0, 12)}...`);

      // --- Last-resort cache lookup ---
      const cached = await prisma.environmentalReport.findFirst({
        where: {
          documentHash,
          status: "CONFIRMED",
        },
        orderBy: { createdAt: "desc" },
      });

      if (cached) {
        console.log(`[EnvironmentalAI] Cache hit for document. reportId=${cached.id}`);
        let cachedExtraction;
        try {
          cachedExtraction = JSON.parse(cached.extractedData);
        } catch {
          cachedExtraction = {};
        }
        return {
          extraction: cachedExtraction,
          resultType: "CACHED",
        };
      }

      // No cache, propagate the original AI error
      console.warn(`[EnvironmentalAI] Cache miss for document.`);
      throw aiErr;
    }
  }

  /**
   * Persists the human-reviewed extraction data into EnvironmentalReport
   * and generates a corresponding EnvironmentalLog for the deterministic risk engine.
   * Only saves VALIDATED data. Never caches failed or fabricated results.
   */
  public static async confirmExtraction(
    fileBuffer: Buffer,
    filename: string,
    extractedData: any,
    uploadedBy: string
  ) {
    // 1. Compute document hash for deduplication / cache
    const documentHash = computeHash(fileBuffer);

    // 2. Save file to disk
    const uploadDir = path.join(__dirname, "../../public/uploads/reports");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const finalFilename = `env-report-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(filename)}`;
    const filePath = path.join(uploadDir, finalFilename);
    fs.writeFileSync(filePath, fileBuffer);
    const documentUrl = `/uploads/reports/${finalFilename}`;

    // 3. Validate user-submitted data to ensure no tampering with types
    const validData = extractionSchema.parse(extractedData);
    const docMeta = validData.document || {};

    let date = new Date();
    if (docMeta.samplingDate && !isNaN(Date.parse(docMeta.samplingDate))) {
      date = new Date(docMeta.samplingDate);
    }

    // 4. Extract aggregates for the EnvironmentalLog
    // MineSight deterministic logic needs dailyTonnage, pm10Dust, effluentPh, noiseDb
    let avgPm10 = 0, pm10Count = 0;
    let avgPh = 0, phCount = 0;
    let avgNoise = 0, noiseCount = 0;

    for (const m of validData.measurements) {
      if (m.value == null) continue;
      const param = m.parameter?.toLowerCase() || "";
      if (param.includes("pm10") || param.includes("pm 10")) {
        avgPm10 += m.value;
        pm10Count++;
      } else if (param.includes("ph") && !param.includes("orp")) {
        avgPh += m.value;
        phCount++;
      } else if (param.includes("noise") || param.includes("leq") || m.unit?.toLowerCase().includes("db")) {
        avgNoise += m.value;
        noiseCount++;
      }
    }

    // Use the latest existing domain values if the extracted report is missing them
    const latestEnvLog = await prisma.environmentalLog.findFirst({
      orderBy: { date: "desc" },
    });

    const finalPm10 = pm10Count > 0 ? avgPm10 / pm10Count : (latestEnvLog?.pm10Dust ?? 78.0);
    const finalPh = phCount > 0 ? avgPh / phCount : (latestEnvLog?.effluentPh ?? 7.2);
    const finalNoise = noiseCount > 0 ? avgNoise / noiseCount : (latestEnvLog?.noiseDb ?? 79.5);
    const finalTonnage = latestEnvLog?.dailyTonnage ?? 1420.0;

    // 5. Deterministic environmental risk calculation (untouched from original)
    let penalty = 0;
    if (finalPm10 > 100) penalty += (finalPm10 - 100) * 1.5;
    if (finalPh < 6.5) penalty += (6.5 - finalPh) * 20;
    if (finalPh > 8.5) penalty += (finalPh - 8.5) * 20;
    if (finalNoise > 85) penalty += (finalNoise - 85) * 3;

    const riskScore = Math.min(100, Math.max(5, Math.round(penalty + 15)));
    let riskLabel = "Low";
    if (riskScore >= 60) riskLabel = "Critical";
    else if (riskScore >= 30) riskLabel = "Moderate";

    // 6. Save to database using transaction
    const report = await prisma.$transaction(async (tx) => {
      // Upsert by documentHash so re-confirms are idempotent
      const existingByHash = await tx.environmentalReport.findFirst({
        where: { documentHash },
      });

      let envReport;
      if (existingByHash) {
        // Update existing record (re-confirmation)
        envReport = await tx.environmentalReport.update({
          where: { id: existingByHash.id },
          data: {
            status: "CONFIRMED",
            extractedData: JSON.stringify(validData),
            uploadedBy,
          },
        });
      } else {
        envReport = await tx.environmentalReport.create({
          data: {
            documentType: docMeta.documentType || "UNKNOWN",
            reportId: docMeta.reportId,
            facilityName: docMeta.facilityName,
            location: docMeta.location,
            samplingDate: date,
            provider: docMeta.provider,
            uploadedBy,
            documentUrl,
            documentHash,
            status: "CONFIRMED",
            extractedData: JSON.stringify(validData),
          },
        });
      }

      // Create or Update the deterministically-calculated EnvironmentalLog
      // This ensures re-confirming a document pushes it to the dashboard immediately.
      const existingLog = await tx.environmentalLog.findFirst({
        where: { environmentalReportId: envReport.id },
      });

      if (existingLog) {
        await tx.environmentalLog.update({
          where: { id: existingLog.id },
          data: {
            dailyTonnage: finalTonnage,
            pm10Dust: finalPm10,
            effluentPh: finalPh,
            noiseDb: finalNoise,
            riskScore,
            riskLabel,
            loggedBy: uploadedBy,
            notes: `Updated from AI extraction of ${docMeta.documentType || "report"}.`,
          },
        });
      } else {
        await tx.environmentalLog.create({
          data: {
            date,
            dailyTonnage: finalTonnage,
            pm10Dust: finalPm10,
            effluentPh: finalPh,
            noiseDb: finalNoise,
            riskScore,
            riskLabel,
            loggedBy: uploadedBy,
            notes: `Generated from AI extraction of ${docMeta.documentType || "report"}.`,
            environmentalReportId: envReport.id,
          },
        });
      }

      return envReport;
    });

    return report;
  }
}
