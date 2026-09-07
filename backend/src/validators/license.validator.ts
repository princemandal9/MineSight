import { z } from "zod";

export const LicenseStatusEnum = z.enum(["VALID", "EXPIRING_SOON", "EXPIRED"]);

export const createLicenseSchema = z.object({
  contractorId: z.string().uuid("Invalid contractor ID format"),
  documentType: z.string().min(2, "Document type is required"),
  documentNumber: z.string().min(1, "Document number is required"),
  holder: z.string().min(2, "Holder name is required"),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  status: LicenseStatusEnum.optional(),
});

export const updateLicenseSchema = z.object({
  documentType: z.string().min(2).optional(),
  documentNumber: z.string().min(1).optional(),
  holder: z.string().min(2).optional(),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  status: LicenseStatusEnum.optional(),
});

export const queryLicenseSchema = z.object({
  contractorId: z.string().uuid().optional(),
  status: LicenseStatusEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
