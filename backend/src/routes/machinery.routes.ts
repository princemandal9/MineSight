import { Router } from "express";
import { MachineryController } from "../controllers/machinery.controller";
import { validate } from "../middleware/validate";
import {
  createMachinerySchema,
  updateMachinerySchema,
  queryMachinerySchema,
} from "../validators/machinery.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createMachinerySchema }),
  MachineryController.create
);

router.get(
  "/",
  validate({ query: queryMachinerySchema }),
  MachineryController.list
);

router.get("/:id", MachineryController.getById);

router.put(
  "/:id",
  validate({ body: updateMachinerySchema }),
  MachineryController.update
);

router.delete("/:id", MachineryController.delete);

export default router;
