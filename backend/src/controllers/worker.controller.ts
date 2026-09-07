import { Request, Response, NextFunction } from "express";
import { WorkerService } from "../services/worker.service";

export class WorkerController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worker = await WorkerService.create(req.body);
      res.status(201).json({
        success: true,
        data: worker,
        message: "Worker added successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await WorkerService.list(req.query);
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
      const worker = await WorkerService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: worker,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await WorkerService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updated,
        message: "Worker updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await WorkerService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: "Worker deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
