import { Request, Response, NextFunction } from "express";
import { InspectionService } from "../services/inspection.service";
import { AppError } from "../utils/appError";

export class InspectionController {
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      console.log("POST /inspections received body keys:", Object.keys(data));
      const inspectorId = req.user?.email || "Unknown Inspector"; // Use authenticated user

      const inspection = await InspectionService.createInspection({
        ...data,
        inspectorId,
      });

      res.status(201).json({
        status: "success",
        data: inspection,
      });
    } catch (err: any) {
      console.error("Inspection creation failed:", err);
      next(err);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { inspectorId, contractorId } = req.query;

      // If user is a contractor, force contractorId filter
      let filterContractorId = contractorId as string;
      if (req.user?.role === "CONTRACTOR") {
        filterContractorId = req.user.contractorId as string;
      }

      const inspections = await InspectionService.listInspections({
        inspectorId: inspectorId as string,
        contractorId: filterContractorId,
      });

      res.status(200).json({
        status: "success",
        data: inspections,
      });
    } catch (err: any) {
      next(err);
    }
  }
}
