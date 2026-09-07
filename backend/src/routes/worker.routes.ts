import { Router } from "express";
import { WorkerController } from "../controllers/worker.controller";
import { validate } from "../middleware/validate";
import {
  createWorkerSchema,
  updateWorkerSchema,
  queryWorkerSchema,
} from "../validators/worker.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createWorkerSchema }),
  WorkerController.create
);

router.get(
  "/",
  validate({ query: queryWorkerSchema }),
  WorkerController.list
);

router.get("/:id", WorkerController.getById);

router.put(
  "/:id",
  validate({ body: updateWorkerSchema }),
  WorkerController.update
);

router.delete("/:id", WorkerController.delete);

export default router;
