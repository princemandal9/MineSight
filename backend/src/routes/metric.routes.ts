import { Router } from "express";
import { MetricController } from "../controllers/metric.controller";

const router = Router();

router.get("/overview", MetricController.getOverview);
router.post("/environmental", MetricController.logEnvironmental);

export default router;

