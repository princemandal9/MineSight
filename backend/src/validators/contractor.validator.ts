import { z } from "zod";

export const TaskTypeEnum = z.enum([
  "blasting",
  "transportation",
  "excavation",
  "maintenance",
]);

export const RiskLevelEnum = z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]);

export const ContractorStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]);

export const createContractorSchema = z.object({
  contractorCode: z.string().trim().min(2).optional(),
  name: z.string().trim().min(2, "Contractor name must be at least 2 characters long"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  taskType: TaskTypeEnum,
  activeWorkers: z.coerce.number().int().nonnegative().optional(),
  activeMachinery: z.coerce.number().int().nonnegative().optional(),
  riskLevel: RiskLevelEnum.optional(),
});

export const updateContractorSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  taskType: TaskTypeEnum.optional(),
  activeWorkers: z.coerce.number().int().nonnegative().optional(),
  activeMachinery: z.coerce.number().int().nonnegative().optional(),
  riskLevel: RiskLevelEnum.optional(),
  status: ContractorStatusEnum.optional(),
  isRestricted: z.boolean().optional(),
});

export const queryContractorSchema = z.object({
  search: z.string().optional(),
  taskType: TaskTypeEnum.optional(),
  riskLevel: RiskLevelEnum.optional(),
  status: ContractorStatusEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

