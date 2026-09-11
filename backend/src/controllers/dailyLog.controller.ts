import { Request, Response, NextFunction } from "express";
import { prisma } from "../models/prisma";

export class DailyLogController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === "CONTRACTOR" && !req.user?.contractorId) {
        res.status(403).json({ success: false, error: { message: "Contractor ID is required to view logs" } });
        return;
      }
      
      const whereClause = req.user?.role === "CONTRACTOR" 
        ? { contractorId: req.user.contractorId as string } 
        : {};

      const logs = await prisma.dailyLog.findMany({
        where: whereClause,
        orderBy: { timestamp: "desc" },
        take: 50,
      });
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.contractorId) {
        res.status(403).json({ success: false, error: { message: "Only contractors can create daily logs" } });
        return;
      }
      const { logText, zone } = req.body;
      if (!logText) {
        res.status(400).json({ success: false, error: { message: "logText is required" } });
        return;
      }
      const log = await prisma.dailyLog.create({
        data: {
          contractorId: req.user.contractorId,
          logText,
          zone: zone || null,
          loggedBy: req.user.email || "Unknown",
        },
      });
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      next(error);
    }
  }
}
