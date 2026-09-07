import { z } from "zod";

export const createExplosivesSchema = z.object({
  contractorId: z.string().uuid("Invalid contractor ID format"),
  explosiveType: z.string().min(2, "Explosive type is required"),
  procured: z.coerce.number().nonnegative(),
  used: z.coerce.number().nonnegative(),
  remaining: z.coerce.number().nonnegative(),
  unit: z.string().min(1, "Unit is required"),
});

export const updateExplosivesSchema = z.object({
  explosiveType: z.string().min(2).optional(),
  procured: z.coerce.number().nonnegative().optional(),
  used: z.coerce.number().nonnegative().optional(),
  remaining: z.coerce.number().nonnegative().optional(),
  unit: z.string().min(1).optional(),
});

export const queryExplosivesSchema = z.object({
  contractorId: z.string().uuid().optional(),
  explosiveType: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
