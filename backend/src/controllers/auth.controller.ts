import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthLogService } from "../services/authLog.service";

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await AuthService.register(req.body, clientIp, userAgent);
      res.status(201).json({
        success: true,
        data: result,
        message: "User registered successfully and logged to auth activity file",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      const result = await AuthService.login(req.body, clientIp, userAgent);
      res.status(200).json({
        success: true,
        data: result,
        message: "User logged in successfully and logged to auth activity file",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: "Unauthorized" } });
        return;
      }
      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.id) {
        const user = await AuthService.getMe(req.user.id);
        const clientIp = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"];
        
        await AuthLogService.recordAuthEvent("LOGOUT", {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
          taskType: user.taskType,
          phone: user.phone,
          contractorId: user.contractorId
        }, clientIp, userAgent);
      }

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAuthRecords(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = AuthLogService.getAuthRecords();
      const files = AuthLogService.getFilePath();
      res.status(200).json({
        success: true,
        count: records.length,
        data: records,
        storageFiles: {
          jsonFile: files.json,
          logFile: files.text,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: "Unauthorized" } });
        return;
      }
      const user = await AuthService.updateProfile(req.user.id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  public static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: "Unauthorized" } });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: { message: "Missing passwords" } });
        return;
      }
      
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  public static async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: { message: "Unauthorized" } });
        return;
      }
      const data = await AuthService.exportData(req.user.id, req.user.contractorId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

