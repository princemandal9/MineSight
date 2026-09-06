import { Router } from "express";
import { ObservationController } from "../controllers/observation.controller";
import { validate } from "../middleware/validate";
import {
  createObservationSchema,
  submitEvidenceSchema,
  verifyObservationSchema,
  queryObservationSchema,
} from "../validators/observation.validator";

const router = Router();

router.post(
  "/",
  validate({ body: createObservationSchema }),
  ObservationController.create
);

router.get(
  "/",
  validate({ query: queryObservationSchema }),
  ObservationController.list
);

router.get("/:id", ObservationController.getById);

router.patch(
  "/:id/evidence",
  validate({ body: submitEvidenceSchema }),
  ObservationController.submitEvidence
);

router.patch(
  "/:id/verify",
  validate({ body: verifyObservationSchema }),
  ObservationController.verify
);

router.delete("/:id", ObservationController.delete);

export default router;

