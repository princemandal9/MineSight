import { Router } from "express";
import { InspectionController } from "../controllers/inspection.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.post("/", InspectionController.create);
router.get("/", InspectionController.list);

export default router;
