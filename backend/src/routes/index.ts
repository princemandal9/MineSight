import { Router } from "express";
import authRoutes from "./auth.routes";
import contractorRoutes from "./contractor.routes";
import observationRoutes from "./observation.routes";
import metricRoutes from "./metric.routes";
import licenseRoutes from "./license.routes";
import machineryRoutes from "./machinery.routes";
import workerRoutes from "./worker.routes";
import explosivesRoutes from "./explosives.routes";
import complianceRoutes from "./compliance.routes";
import riskRoutes from "./risk.routes";
import inspectionRoutes from "./inspection.routes";

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
router.use("/licenses", licenseRoutes);
router.use("/machinery", machineryRoutes);
router.use("/workers", workerRoutes);
router.use("/explosives", explosivesRoutes);
router.use("/compliance", complianceRoutes);
router.use("/risk", riskRoutes);
router.use("/inspections", inspectionRoutes);

export default router;

