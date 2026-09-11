import { Router } from "express";
import { ContractorController } from "../controllers/contractor.controller";
import { validate } from "../middleware/validate";
import {
  createContractorSchema,
  updateContractorSchema,
  queryContractorSchema,
} from "../validators/contractor.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createContractorSchema }),
  ContractorController.create
);

router.get(
  "/",
  validate({ query: queryContractorSchema }),
  ContractorController.list
);

router.get("/:id", ContractorController.getById);

import { authenticateToken, authorizeRole } from "../middleware/auth.middleware";

router.put(
  "/:id",
  validate({ body: updateContractorSchema }),
  ContractorController.update
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRole("SUPERVISOR"),
  ContractorController.updateStatus
);

router.delete("/:id", ContractorController.delete);

export default router;

