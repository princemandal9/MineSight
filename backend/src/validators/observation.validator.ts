import { z } from "zod";

export const CategoryEnum = z.enum([
  "PPE",
  "DUST",
  "EFFLUENT",
  "EQUIPMENT",
  "BLASTING",
  "OTHER",
]);

export const SeverityEnum = z.enum(["LOW", "MODERATE", "CRITICAL"]);

export const ObservationStatusEnum = z.enum([
  "OPEN",
  "EVIDENCE_SUBMITTED",
  "RESOLVED",
]);

export const createObservationSchema = z.object({
  contractorId: z.string().min(1, "contractorId is required"),
  supervisorName: z.string().trim().min(2, "supervisorName is required"),
  zone: z.string().trim().min(1, "zone is required"),
  category: CategoryEnum,
  severity: SeverityEnum,
  description: z.string().trim().min(5, "description must be at least 5 characters"),
  photoUrl: z.string().optional().or(z.literal("")),
  gpsCoordinates: z.string().optional().or(z.literal("")),
});

export const submitEvidenceSchema = z.object({
  evidenceUrl: z.string().optional().or(z.literal("")),
  evidenceNotes: z.string().trim().min(3, "evidenceNotes must be at least 3 characters"),
  submittedBy: z.string().trim().optional().default("Contractor Representative"),
});

export const verifyObservationSchema = z.object({
  verifiedBy: z.string().trim().min(2, "verifiedBy supervisor name is required"),
  resolutionNotes: z.string().trim().optional(),
});

export const queryObservationSchema = z.object({
  contractorId: z.string().optional(),
  category: CategoryEnum.optional(),
  severity: SeverityEnum.optional(),
  status: ObservationStatusEnum.optional(),
  zone: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

