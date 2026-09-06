import { Request, Response, NextFunction } from "express";
import { MetricService } from "../services/metric.service";

export class MetricController {
  public static async getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await MetricService.getOverviewMetrics();
      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logEnvironmental(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await MetricService.logEnvironmentalReading(req.body);
      res.status(201).json({
        success: true,
        data: log,
        message: "Environmental reading logged successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

