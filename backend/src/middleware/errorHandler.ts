import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle AppError (Known operational errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: formattedErrors,
      },
    });
    return;
  }

  // Handle Prisma Database Errors
  if ("code" in err && typeof (err as any).code === "string") {
    const prismaErr = err as any;
    if (prismaErr.code === "P2002") {
      const target = prismaErr.meta?.target ? ` (${prismaErr.meta.target})` : "";
      res.status(409).json({
        success: false,
        error: {
          message: `Unique constraint violated${target}`,
        },
      });
      return;
    }

    if (prismaErr.code === "P2025") {
      res.status(404).json({
        success: false,
        error: {
          message: "Record not found in database",
        },
      });
      return;
    }
  }

  // Default fallback for unhandled 500 errors
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message || "An unexpected error occurred",
    },
  });
};

