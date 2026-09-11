import { Request, Response, NextFunction } from "express";
import { MachineryService } from "../services/machinery.service";

export class MachineryController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body };
      if (req.user?.role === "CONTRACTOR" && req.user.contractorId) {
        data.contractorId = req.user.contractorId;
      }
      const item = await MachineryService.create(data);
      res.status(201).json({
        success: true,
        data: item,
        message: "Machinery registered successfully",
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
      const result = await MachineryService.list(req.query);
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
      const item = await MachineryService.getById(req.params.id, authorizedContractorId);
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizedContractorId = req.user?.role === "CONTRACTOR" ? req.user.contractorId || undefined : undefined;
      const updated = await MachineryService.update(req.params.id, req.body, authorizedContractorId);
      res.status(200).json({
        success: true,
        data: updated,
        message: "Machinery updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizedContractorId = req.user?.role === "CONTRACTOR" ? req.user.contractorId || undefined : undefined;
      await MachineryService.delete(req.params.id, authorizedContractorId);
      res.status(200).json({
        success: true,
        message: "Machinery deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
