import { Request, Response } from "express";
import { RiskService } from "../services/risk.service";
import { prisma } from "../models/prisma";

export class RiskController {
  public static async getOverview(req: Request, res: Response) {
    try {
      if (req.user?.role !== "SUPERVISOR" && req.user?.role !== "MANAGEMENT") {
        return res.status(403).json({ error: "Forbidden. Only supervisors can access mine-wide risk overview." });
      }

      const overview = await RiskService.getMineWideRiskOverview();
      return res.json(overview);
    } catch (error: any) {
      console.error("[RiskController] getOverview error:", error);
      return res.status(500).json({ error: "Failed to calculate mine risk overview." });
    }
  }

  public static async getContractors(req: Request, res: Response) {
    try {
      if (req.user?.role !== "SUPERVISOR" && req.user?.role !== "MANAGEMENT") {
        return res.status(403).json({ error: "Forbidden. Only supervisors can access contractor risk rankings." });
      }

      const contractors = await prisma.contractor.findMany({
        where: { status: "ACTIVE" },
        select: { id: true },
      });

      const contractorRisks = await Promise.all(
        contractors.map((c) => RiskService.calculateContractorRisk(c.id))
      );

      // Sort by risk descending
      contractorRisks.sort((a, b) => b.riskScore - a.riskScore);

      return res.json(contractorRisks);
    } catch (error: any) {
      console.error("[RiskController] getContractors error:", error);
      return res.status(500).json({ error: "Failed to fetch contractor risk profiles." });
    }
  }

  public static async getContractorRisk(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // RBAC check: if user is CONTRACTOR, they can only view their own risk
      if (req.user?.role === "CONTRACTOR" && req.user.contractorId !== id) {
        return res.status(403).json({ error: "Forbidden. Cannot view other contractors' risk profiles." });
      }

      const riskProfile = await RiskService.calculateContractorRisk(id);
      return res.json(riskProfile);
    } catch (error: any) {
      console.error("[RiskController] getContractorRisk error:", error);
      if (error.message === "Contractor not found") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to calculate contractor risk." });
    }
  }
}
