import { Request, Response, NextFunction } from "express";
import { LicenseService } from "../services/license.service";

export class LicenseController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body };
      if (req.user?.role === "CONTRACTOR" && req.user.contractorId) {
        data.contractorId = req.user.contractorId;
      }
      const license = await LicenseService.create(data);
      res.status(201).json({
        success: true,
        data: license,
        message: "License created successfully",
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
      const result = await LicenseService.list(req.query);
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
      const license = await LicenseService.getById(req.params.id, authorizedContractorId);
      res.status(200).json({
        success: true,
        data: license,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizedContractorId = req.user?.role === "CONTRACTOR" ? req.user.contractorId || undefined : undefined;
      const updated = await LicenseService.update(req.params.id, req.body, authorizedContractorId);
      res.status(200).json({
        success: true,
        data: updated,
        message: "License updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizedContractorId = req.user?.role === "CONTRACTOR" ? req.user.contractorId || undefined : undefined;
      await LicenseService.delete(req.params.id, authorizedContractorId);
      res.status(200).json({
        success: true,
        message: "License deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
