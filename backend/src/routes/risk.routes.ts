import { Router } from "express";
import { RiskController } from "../controllers/risk.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Apply authentication to all risk routes
router.use(authenticateToken);

// Mine-wide risk overview (Supervisor and Management only)
router.get("/overview", RiskController.getOverview);

// Get all contractor risks (Supervisor and Management only)
router.get("/contractors", RiskController.getContractors);

// Get specific contractor risk (Contractor can view their own, Supervisor can view all)
router.get("/contractors/:id", RiskController.getContractorRisk);

export default router;
