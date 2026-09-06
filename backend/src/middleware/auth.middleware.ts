import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "minesight-sih-2026-fallback-secret";

export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    // Check fallback dev header
    const mockRole = req.headers["x-user-role"] as string;
    const mockId = req.headers["x-user-id"] as string;
    if (mockRole && mockId) {
      req.user = {
        id: mockId,
        email: "dev@minesight.in",
        role: mockRole.toUpperCase(),
      };
      return next();
    }
    return next(new AppError("Authentication required. Please provide a valid Bearer token.", 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError("Invalid or expired authentication token", 401));
  }
};

