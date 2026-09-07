import { Router } from "express";
import { LicenseController } from "../controllers/license.controller";
import { validate } from "../middleware/validate";
import {
  createLicenseSchema,
  updateLicenseSchema,
  queryLicenseSchema,
} from "../validators/license.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createLicenseSchema }),
  LicenseController.create
);

router.get(
  "/",
  validate({ query: queryLicenseSchema }),
  LicenseController.list
);

router.get("/:id", LicenseController.getById);

router.put(
  "/:id",
  validate({ body: updateLicenseSchema }),
  LicenseController.update
);

router.delete("/:id", LicenseController.delete);

export default router;
