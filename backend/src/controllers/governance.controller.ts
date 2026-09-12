import { Request, Response } from "express";
import { AIGovernanceProvider } from "../services/governance-ai.provider";

export const analyzeGovernance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contractorId } = req.body;

    if (!contractorId || typeof contractorId !== "string" || !contractorId.trim()) {
      res.status(400).json({ success: false, error: "contractorId is required." });
      return;
    }

    // Role guard — middleware enforces this, but belt-and-suspenders
    if (req.user?.role !== "SUPERVISOR" && req.user?.role !== "ADMIN") {
      res.status(403).json({ success: false, error: { message: "Only supervisors can run governance analysis." } });
      return;
    }

    const analysis = await AIGovernanceProvider.analyzeContractor(contractorId.trim());

    res.status(200).json({
      success: true,
      data: analysis.data,
      metadata: {
        model: analysis.model,
        usedFallback: analysis.usedFallback,
      },
    });
  } catch (error: any) {
    console.error("[GovernanceController] Error:", error.name, error.code, error.message);

    if (error.name === "AIProviderError") {
      const httpStatus =
        error.code === "AI_INVALID_API_KEY"
          ? 503
          : error.code === "AI_MALFORMED_RESPONSE"
          ? 502
          : 503;

      res.status(httpStatus).json({
        success: false,
        error: {
          message: "AI Governance Analysis is temporarily unavailable. Please try again.",
          code: error.code,
        }
      });
      return;
    }

    if (error.message === "Contractor not found") {
      res.status(404).json({ success: false, error: "Contractor not found." });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error during AI analysis.",
    });
  }
};
