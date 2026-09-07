import { Request, Response, NextFunction } from "express";
import { MachineryService } from "../services/machinery.service";

export class MachineryController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const machinery = await MachineryService.create(req.body);
      res.status(201).json({
        success: true,
        data: machinery,
        message: "Machinery registered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
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
      const machinery = await MachineryService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: machinery,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await MachineryService.update(req.params.id, req.body);
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
      await MachineryService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: "Machinery deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
