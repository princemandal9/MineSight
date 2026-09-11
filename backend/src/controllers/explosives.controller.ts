import { Request, Response, NextFunction } from "express";
import { ExplosivesService } from "../services/explosives.service";

export class ExplosivesController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body };
      if (req.user?.role === "CONTRACTOR" && req.user.contractorId) {
        data.contractorId = req.user.contractorId;
      }
      const stock = await ExplosivesService.create(data);
      res.status(201).json({
        success: true,
        data: stock,
        message: "Explosives stock logged successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === "CONTRACTOR" && req.user.contractorId) {
        req.query.contractorId = req.user.contractorId;
      }
      const result = await ExplosivesService.list(req.query);
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
      const authorizedContractorId = req.user?.role === "CONTRACTOR" ? req.user.contractorId || undefined : undefined;
      const stock = await ExplosivesService.getById(req.params.id, authorizedContractorId);
      res.status(200).json({
        success: true,
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizedContractorId = req.user?.role === "CONTRACTOR" ? req.user.contractorId || undefined : undefined;
      const updated = await ExplosivesService.update(req.params.id, req.body, authorizedContractorId);
      res.status(200).json({
        success: true,
        data: updated,
        message: "Explosives stock updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizedContractorId = req.user?.role === "CONTRACTOR" ? req.user.contractorId || undefined : undefined;
      await ExplosivesService.delete(req.params.id, authorizedContractorId);
      res.status(200).json({
        success: true,
        message: "Explosives stock record deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
