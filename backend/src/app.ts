import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import apiRouter from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/appError";

const app: Application = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-role"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from the public directory (for photo uploads)
app.use(express.static(path.join(__dirname, "../public")));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/v1", apiRouter);

// 404 Not Found Handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404));
});

// Central Error Handler
app.use(errorHandler);

export default app;

