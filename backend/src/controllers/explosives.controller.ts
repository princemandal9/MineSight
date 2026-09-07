import { Request, Response, NextFunction } from "express";
import { ExplosivesService } from "../services/explosives.service";

export class ExplosivesController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stock = await ExplosivesService.create(req.body);
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
      const stock = await ExplosivesService.getById(req.params.id);
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
      const updated = await ExplosivesService.update(req.params.id, req.body);
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
      await ExplosivesService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: "Explosives stock record deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
