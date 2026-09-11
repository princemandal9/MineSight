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
import notificationRoutes from "./notification.routes";
import dailyLogRoutes from "./dailyLog.routes";
import environmentalReportRoutes from "./environmental-report.routes";
import { authenticateToken, requireActiveContractor } from "../middleware/auth.middleware";

import governanceRoutes from "./governance.routes";

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
router.use("/observations", authenticateToken, requireActiveContractor, observationRoutes);
router.use("/metrics", metricRoutes);
router.use("/licenses", authenticateToken, requireActiveContractor, licenseRoutes);
router.use("/machinery", authenticateToken, requireActiveContractor, machineryRoutes);
router.use("/workers", authenticateToken, requireActiveContractor, workerRoutes);
router.use("/explosives", authenticateToken, requireActiveContractor, explosivesRoutes);
router.use("/compliance", authenticateToken, requireActiveContractor, complianceRoutes);
router.use("/risk", authenticateToken, requireActiveContractor, riskRoutes);
router.use("/inspections", inspectionRoutes);
router.use("/notifications", authenticateToken, requireActiveContractor, notificationRoutes);
router.use("/daily-logs", authenticateToken, requireActiveContractor, dailyLogRoutes);
router.use("/environmental-documents", environmentalReportRoutes);
router.use("/governance", authenticateToken, requireActiveContractor, governanceRoutes);

export default router;
