import { Router } from "express";
import authRoutes from "./auth.routes";
import contractorRoutes from "./contractor.routes";
import observationRoutes from "./observation.routes";
import metricRoutes from "./metric.routes";

const router = Router();

// API Health Check
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "MineSight Governance API",
    version: "1.0.0",
  });
});

// Mount Resource Routes
router.use("/auth", authRoutes);
router.use("/contractors", contractorRoutes);
router.use("/observations", observationRoutes);
router.use("/metrics", metricRoutes);

export default router;

