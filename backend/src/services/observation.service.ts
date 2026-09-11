import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";
import { ContractorService } from "./contractor.service";
import { NotificationService } from "./notification.service";

export interface CreateObservationInput {
  contractorId: string;
  supervisorName: string;
  supervisorId?: string;
  zone: string;
  category: string;
  severity: string;
  description: string;
  photoUrl?: string;
  gpsCoordinates?: string;
}

export interface SubmitEvidenceInput {
  evidenceUrl?: string;
  evidenceNotes: string;
  correctiveAction?: string;
  submittedBy?: string;
}

export interface VerifyObservationInput {
  verifiedBy: string;
  resolutionNotes?: string;
}

export interface ObservationQueryParams {
  contractorId?: string;
  category?: string;
  severity?: string;
  status?: string;
  zone?: string;
  page?: number;
  limit?: number;
}

export class ObservationService {
  /**
   * Generates unique observation code like OBS-2026-0001
   */
  private static async generateObservationCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.observation.count();
    const padded = String(count + 1).padStart(4, "0");
    return `OBS-${year}-${padded}`;
  }

  /**
   * Supervisor logs new observation
   */
  public static async create(data: CreateObservationInput) {
    // Validate contractor exists
    const contractor = await prisma.contractor.findUnique({
      where: { id: data.contractorId },
    });
    if (!contractor) {
      throw new AppError(`Contractor with ID '${data.contractorId}' not found`, 404);
    }

    const observationCode = await this.generateObservationCode();

    const observation = await prisma.$transaction(async (tx) => {
      // 1. Create observation record
      const obs = await tx.observation.create({
        data: {
          observationCode,
          contractorId: data.contractorId,
          supervisorName: data.supervisorName,
          supervisorId: data.supervisorId || null,
          zone: data.zone,
          category: data.category,
          severity: data.severity,
          description: data.description,
          photoUrl: data.photoUrl || null,
          gpsCoordinates: data.gpsCoordinates || null,
          status: "OPEN",
        },
      });

      // 2. Increment contractor violation count
      await tx.contractor.update({
        where: { id: data.contractorId },
        data: {
          violationCount: { increment: 1 },
        },
      });

      // 3. Log into permanent Audit Trail
      await tx.auditLog.create({
        data: {
          observationId: obs.id,
          action: "CREATED",
          actorRole: "SUPERVISOR",
          actorName: data.supervisorName,
          details: `Safety remark logged in ${data.zone} with severity ${data.severity}: ${data.description}`,
        },
      });

      return obs;
    });

    // 4. Recalculate deterministic risk and apply contractor red flag
    await ContractorService.recalculateRisk(data.contractorId);

    // 5. Notify contractor users (Flow A)
    const contractorUsers = await prisma.user.findMany({
      where: { contractorId: data.contractorId, role: "CONTRACTOR" }
    });
    for (const u of contractorUsers) {
      await NotificationService.create({
        recipientId: u.id,
        type: "Safety",
        title: "New Observation Logged",
        message: `A ${data.severity} severity observation was logged in ${data.zone}.`,
      });
    }

    return observation;
  }

  /**
   * List observations with filters
   */
  public static async list(query: ObservationQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.contractorId) where.contractorId = query.contractorId;
    if (query.category) where.category = query.category;
    if (query.severity) where.severity = query.severity;
    if (query.status) where.status = query.status;
    if (query.zone) where.zone = query.zone;

    const [total, observations] = await Promise.all([
      prisma.observation.count({ where }),
      prisma.observation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contractor: {
            select: {
              id: true,
              contractorCode: true,
              name: true,
              taskType: true,
              riskLevel: true,
            },
          },
        },
      }),
    ]);

    return {
      data: observations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single observation with audit history
   */
  public static async getById(idOrCode: string) {
    const observation = await prisma.observation.findFirst({
      where: {
        OR: [{ id: idOrCode }, { observationCode: idOrCode }],
      },
      include: {
        contractor: true,
        auditLogs: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!observation) {
      throw new AppError(`Observation '${idOrCode}' not found`, 404);
    }

    return observation;
  }

  /**
   * Contractor uploads resolution evidence
   */
  public static async submitEvidence(id: string, data: SubmitEvidenceInput) {
    const observation = await this.getById(id);

    if (observation.status === "RESOLVED") {
      throw new AppError("Cannot submit evidence for an already resolved observation", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const obs = await tx.observation.update({
        where: { id: observation.id },
        data: {
          status: "EVIDENCE_SUBMITTED",
          evidenceUrl: data.evidenceUrl || null,
          evidenceNotes: data.evidenceNotes,
          correctiveAction: data.correctiveAction,
          submittedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          observationId: obs.id,
          action: "EVIDENCE_SUBMITTED",
          actorRole: "CONTRACTOR",
          actorName: data.submittedBy || "Contractor Representative",
          details: `Remediation proof submitted: ${data.evidenceNotes}`,
        },
      });

      return obs;
    });

    // Notify Supervisor (Flow B)
    if (observation.supervisorId) {
      await NotificationService.create({
        recipientId: observation.supervisorId,
        type: "Inspection",
        title: "Evidence Submitted",
        message: `Contractor submitted evidence for observation ${observation.observationCode}.`,
      });
    } else {
      console.warn(`[ObservationService] Skipping supervisor notification for ${observation.id} - no supervisorId linked.`);
    }

    return updated;
  }

  /**
   * Supervisor verifies evidence and clears the observation (Closes the loop)
   */
  public static async verifyAndResolve(id: string, data: VerifyObservationInput & { isApproved?: boolean }) {
    const observation = await this.getById(id);

    if (observation.status === "RESOLVED") {
      throw new AppError("Observation is already resolved", 400);
    }
    
    if (data.isApproved === false) {
      const updated = await prisma.$transaction(async (tx) => {
        const obs = await tx.observation.update({
          where: { id: observation.id },
          data: {
            status: "OPEN", // Revert to OPEN
            resolutionNotes: data.resolutionNotes || "Evidence rejected.",
          },
        });

        await tx.auditLog.create({
          data: {
            observationId: obs.id,
            action: "VERIFIED_REJECTED",
            actorRole: "SUPERVISOR",
            actorName: data.verifiedBy,
            details: `Observation evidence rejected. Status reverted to OPEN. Reason: ${
              data.resolutionNotes || "Not provided."
            }`,
          },
        });

        return obs;
      });
      
      // Recalculate risk just in case
      await ContractorService.recalculateRisk(observation.contractorId);

      // Notify Contractor users (Flow C - Rejected)
      const contractorUsers = await prisma.user.findMany({
        where: { contractorId: observation.contractorId, role: "CONTRACTOR" }
      });
      for (const u of contractorUsers) {
        await NotificationService.create({
          recipientId: u.id,
          type: "Safety",
          title: "Evidence Rejected",
          message: `Evidence for observation ${observation.observationCode} was rejected.`,
        });
      }

      return updated;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const obs = await tx.observation.update({
        where: { id: observation.id },
        data: {
          status: "RESOLVED",
          verifiedBy: data.verifiedBy,
          resolutionNotes: data.resolutionNotes || "Evidence reviewed and approved.",
          resolvedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          observationId: obs.id,
          action: "VERIFIED_APPROVED",
          actorRole: "SUPERVISOR",
          actorName: data.verifiedBy,
          details: `Observation verified and resolved. Red-flag cleared. Notes: ${
            data.resolutionNotes || "Evidence approved."
          }`,
        },
      });

      return obs;
    });

    // Automatically recalculate risk to remove red flag if no other issues remain
    await ContractorService.recalculateRisk(observation.contractorId);

    // Notify Contractor users (Flow C - Approved)
    const contractorUsers = await prisma.user.findMany({
      where: { contractorId: observation.contractorId, role: "CONTRACTOR" }
    });
    for (const u of contractorUsers) {
      await NotificationService.create({
        recipientId: u.id,
        type: "Compliance",
        title: "Observation Resolved",
        message: `Observation ${observation.observationCode} was verified and resolved.`,
      });
    }

    return updated;
  }

  /**
   * Delete observation
   */
  public static async delete(id: string) {
    const observation = await this.getById(id);

    await prisma.observation.delete({
      where: { id: observation.id },
    });

    await ContractorService.recalculateRisk(observation.contractorId);
    return { message: `Observation '${observation.observationCode}' deleted successfully` };
  }
}

