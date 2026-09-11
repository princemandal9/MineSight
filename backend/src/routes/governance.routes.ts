import { Router } from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware";
import { analyzeGovernance } from "../controllers/governance.controller";

const router = Router();

// Only SUPERVISOR role can trigger AI governance analysis
router.post("/analyze", authenticateToken, authorizeRole("SUPERVISOR"), analyzeGovernance);

export default router;
