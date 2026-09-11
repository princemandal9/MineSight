import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.middleware";
import { EnvironmentalReportController } from "../controllers/environmental-report.controller";

const router = Router();

// Store file in memory to send it to Gemini API
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max size
  },
});

// Protect all routes
router.use(authenticateToken);

// Document Intelligence routes
router.post("/analyze", upload.single("document"), EnvironmentalReportController.analyze);
router.post("/confirm", upload.single("document"), EnvironmentalReportController.confirm);

export default router;
