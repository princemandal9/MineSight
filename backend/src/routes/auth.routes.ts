import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticateToken } from "../middleware/auth.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

// User Registration (records to file & creates DB user)
router.post(
  "/register",
  validate({ body: registerSchema }),
  AuthController.register
);

// User Login (records to file & returns JWT)
router.post(
  "/login",
  validate({ body: loginSchema }),
  AuthController.login
);

// Current User Profile
router.get("/me", authenticateToken, AuthController.getMe);

// View Logged In / Registered Users File Records
router.get("/records", AuthController.getAuthRecords);

export default router;

