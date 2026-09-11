import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { AppError } from "../utils/appError";

export class NotificationController {
  public static async listForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }
      const notifications = await NotificationService.listForUser(userId);
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }
      const count = await NotificationService.getUnreadCount(userId);
      res.status(200).json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }
      
      const notificationId = req.params.id;
      const updated = await NotificationService.markAsRead(notificationId, userId);
      
      if (!updated) {
        throw new AppError("Notification not found or unauthorized", 404);
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }
      
      await NotificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }
}
