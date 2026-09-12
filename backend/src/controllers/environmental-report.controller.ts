import { Request, Response } from "express";
import { EnvironmentalReportService } from "../services/environmental-report.service";
import { EnvironmentalDocumentAIProvider } from "../services/environmental-ai.provider";
import { AIProviderError } from "../services/gemini-core.provider";

export class EnvironmentalReportController {
  public static async analyze(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user || user.role !== "SUPERVISOR") {
        res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "Only Supervisors can analyze environmental documents.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          code: "NO_FILE",
          message: "No file uploaded. Must provide a 'document' file.",
        });
        return;
      }

      const file = req.file;

      // Validate MIME type
      const allowedMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          code: "UNSUPPORTED_FILE_TYPE",
          message: "Unsupported file type. Allowed: PDF, PNG, JPEG, WEBP.",
        });
        return;
      }

      const { extraction, resultType, model, usedFallback } =
        await EnvironmentalReportService.analyzeDocument(file);

      res.status(200).json({
        success: true,
        resultType,         // "LIVE" | "CACHED"
        model: model || null,
        usedFallback: usedFallback ?? false,
        data: extraction,
      });

    } catch (error: any) {
      // Classify AI provider errors — never expose stack traces or secrets
      if (error instanceof AIProviderError) {
        console.error(`[EnvironmentalAI] Controlled failure: code=${error.code} model=${error.model} message=${error.message}`);

        const httpStatus = error.code === "AI_INVALID_API_KEY" ? 503 : 503;
        res.status(httpStatus).json({
          success: false,
          error: {
            code: error.code,
            message:
              error.code === "AI_PROVIDER_UNAVAILABLE"
                ? "AI extraction service is temporarily unavailable. Please retry."
                : error.code === "AI_PROVIDER_TIMEOUT"
                ? "AI extraction timed out. Please try again."
                : error.code === "AI_INVALID_API_KEY"
                ? "AI service is misconfigured. Contact administrator."
                : error.code === "AI_MALFORMED_RESPONSE"
                ? "AI returned an invalid response. Please retry."
                : "AI extraction failed. Please retry.",
          },
          provider: "gemini",
          retryable: error.retryable,
        });
        return;
      }

      // Unexpected/unknown errors — log details but return minimal info
      console.error("[EnvironmentalAI] Unexpected analysis error:", error);
      res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred during analysis. Please retry.",
        retryable: true,
      });
    }
  }

  public static async confirm(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user || user.role !== "SUPERVISOR") {
        res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "Only Supervisors can confirm environmental documents.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          code: "NO_FILE",
          message: "No file uploaded. Must provide the 'document' file.",
        });
        return;
      }

      const file = req.file;
      const extractedDataStr = req.body.extractedData;
      if (!extractedDataStr) {
        res.status(400).json({
          success: false,
          code: "NO_EXTRACTED_DATA",
          message: "No extracted data provided for confirmation.",
        });
        return;
      }

      let extractedData;
      try {
        extractedData = JSON.parse(extractedDataStr);
      } catch (e) {
        res.status(400).json({
          success: false,
          code: "INVALID_JSON",
          message: "extractedData must be a valid JSON string.",
        });
        return;
      }

      const uploadedBy = user ? user.name || user.email : "Unknown Supervisor";

      const report = await EnvironmentalReportService.confirmExtraction(
        file.buffer,
        file.originalname,
        extractedData,
        uploadedBy
      );

      res.status(201).json({
        success: true,
        data: report,
      });

    } catch (error: any) {
      console.error("[EnvironmentalAI] Confirm error:", error);
      res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to confirm extraction.",
      });
    }
  }
}
