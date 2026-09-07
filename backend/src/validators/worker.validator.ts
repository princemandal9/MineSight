import { z } from "zod";

export const TrainingStatusEnum = z.enum(["COMPLETE", "MISSING"]);

export const createWorkerSchema = z.object({
  contractorId: z.string().uuid("Invalid contractor ID format"),
  workerCode: z.string().min(2, "Worker code is required"),
  fullName: z.string().min(2, "Full name is required").optional(),
  role: z.string().min(2, "Role is required").optional(),
  trainingStatus: TrainingStatusEnum.optional(),
  ppeIssued: z.boolean().optional(),
});

export const updateWorkerSchema = z.object({
  workerCode: z.string().min(2).optional(),
  fullName: z.string().min(2).optional(),
  role: z.string().min(2).optional(),
  trainingStatus: TrainingStatusEnum.optional(),
  ppeIssued: z.boolean().optional(),
});

export const queryWorkerSchema = z.object({
  contractorId: z.string().uuid().optional(),
  trainingStatus: TrainingStatusEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
