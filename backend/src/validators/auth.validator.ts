import { z } from "zod";

export const RoleEnum = z.enum(["CONTRACTOR", "SUPERVISOR"]);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: RoleEnum.optional().default("CONTRACTOR"),
  phone: z.string().trim().optional().or(z.literal("")),
  companyName: z.string().trim().optional().or(z.literal("")),
  taskType: z
    .enum(["blasting", "transportation", "excavation", "maintenance"])
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

