import { z } from "zod";

export const createDailyLogSchema = z.object({
  logText: z.string({
    required_error: "Log text is required",
    invalid_type_error: "Log text must be a string",
  }).max(2000, "Log text cannot exceed 2000 characters"),
  zone: z.string({
    invalid_type_error: "Zone must be a string",
  }).max(100, "Zone cannot exceed 100 characters").optional().nullable(),
});
