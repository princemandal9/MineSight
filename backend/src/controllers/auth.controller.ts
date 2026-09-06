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
}

