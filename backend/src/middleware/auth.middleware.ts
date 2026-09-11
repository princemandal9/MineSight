import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  contractorId?: string | null;
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

export const authorizeRole = (requiredRole: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }
    if (req.user.role !== requiredRole) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};

import { prisma } from "../models/prisma";

export const requireActiveContractor = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError("Authentication required.", 401));
  }
  
  if (req.user.role === "SUPERVISOR" || req.user.role === "ADMIN") {
    return next();
  }
  
  if (req.user.role === "CONTRACTOR") {
    if (!req.user.contractorId) {
       return next(new AppError("Contractor profile not found.", 403));
    }
    
    try {
      const contractor = await prisma.contractor.findUnique({
        where: { id: req.user.contractorId }
      });
      
      if (!contractor) {
        return next(new AppError("Contractor profile not found.", 403));
      }
      
      if (contractor.status === "PENDING") {
        return next(new AppError("Your contractor profile is pending supervisor approval.", 403));
      }
      
      if (contractor.status === "REJECTED") {
        return next(new AppError(`Your contractor registration was rejected: ${contractor.rejectionReason || "No reason provided"}`, 403));
      }
      
      if (contractor.status !== "ACTIVE") {
        return next(new AppError(`Contractor account is ${contractor.status}`, 403));
      }
      
      next();
    } catch (error) {
      return next(new AppError("Failed to verify contractor status.", 500));
    }
  } else {
    next();
  }
};
