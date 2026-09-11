import { Router } from "express";
import { DailyLogController } from "../controllers/dailyLog.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { createDailyLogSchema } from "../validators/dailyLog.validator";

const router = Router();

router.get("/", authenticateToken, DailyLogController.list);
router.post("/", authenticateToken, validate({ body: createDailyLogSchema }), DailyLogController.create);

export default router;
