import { z } from "zod";

export const MachineryOwnershipEnum = z.enum(["OWNED", "RENTED", "FINANCED"]);
export const MachineryStatusEnum = z.enum(["ACTIVE", "DUE_SOON", "OVERDUE", "UNDER_MAINTENANCE"]);

export const createMachinerySchema = z.object({
  contractorId: z.string().uuid("Invalid contractor ID format"),
  machineName: z.string().min(2, "Machine name is required"),
  ownership: MachineryOwnershipEnum,
  lastServiced: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  nextDue: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  status: MachineryStatusEnum.optional(),
});

export const updateMachinerySchema = z.object({
  machineName: z.string().min(2).optional(),
  ownership: MachineryOwnershipEnum.optional(),
  lastServiced: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  nextDue: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  status: MachineryStatusEnum.optional(),
});

export const queryMachinerySchema = z.object({
  contractorId: z.string().uuid().optional(),
  status: MachineryStatusEnum.optional(),
  ownership: MachineryOwnershipEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
