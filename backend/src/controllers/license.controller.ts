import { Request, Response, NextFunction } from "express";
import { LicenseService } from "../services/license.service";

export class LicenseController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const license = await LicenseService.create(req.body);
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
      const license = await LicenseService.getById(req.params.id);
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
      const updated = await LicenseService.update(req.params.id, req.body);
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
      await LicenseService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: "License deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
