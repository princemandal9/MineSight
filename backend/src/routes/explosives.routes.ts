import { Router } from "express";
import { ExplosivesController } from "../controllers/explosives.controller";
import { validate } from "../middleware/validate";
import {
  createExplosivesSchema,
  updateExplosivesSchema,
  queryExplosivesSchema,
} from "../validators/explosives.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createExplosivesSchema }),
  ExplosivesController.create
);

router.get(
  "/",
  validate({ query: queryExplosivesSchema }),
  ExplosivesController.list
);

router.get("/:id", ExplosivesController.getById);

router.put(
  "/:id",
  validate({ body: updateExplosivesSchema }),
  ExplosivesController.update
);

router.delete("/:id", ExplosivesController.delete);

export default router;
