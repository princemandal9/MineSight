import { Request, Response, NextFunction } from "express";
import { ContractorService } from "../services/contractor.service";

export class ContractorController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractor = await ContractorService.create(req.body);
      res.status(201).json({
        success: true,
        data: contractor,
        message: "Contractor onboarded successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ContractorService.list(req.query as any);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contractor = await ContractorService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: contractor,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await ContractorService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updated,
        message: "Contractor profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ContractorService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: "Contractor record deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

