import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

router.get("/", NotificationController.listForUser);
router.get("/unread-count", NotificationController.getUnreadCount);
router.post("/mark-all-read", NotificationController.markAllAsRead);
router.patch("/:id/read", NotificationController.markAsRead);

export default router;
