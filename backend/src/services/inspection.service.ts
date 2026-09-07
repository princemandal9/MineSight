import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";
import { ContractorService } from "./contractor.service";
import fs from "fs";
import path from "path";

export interface CreateInspectionInput {
  clientRefId?: string;
  mineId?: string;
  zone?: string;
  inspectorId: string;
  contractorId?: string;
  taskType?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  startedAt: Date;
  status?: string;
  observations: {
    contractorId: string;
    category: string;
    severity: string;
    description: string;
    photoUrl?: string;
    photoBase64?: string;
  }[];
}

export class InspectionService {
  /**
   * Generates unique observation code like OBS-2026-0001
   */
  private static async generateObservationCode(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.observation.count();
    const padded = String(count + 1).padStart(4, "0");
    return `OBS-${year}-${padded}`;
  }

  /**
   * Supervisor creates a new Inspection
   */
  public static async createInspection(data: CreateInspectionInput) {
    if (data.clientRefId) {
      const existing = await prisma.inspection.findUnique({
        where: { clientRefId: data.clientRefId },
      });
      if (existing) {
        // Idempotency: Already processed this offline submission
        return existing;
      }
    }

    if (!data.observations || !Array.isArray(data.observations)) {
      throw new AppError("Invalid payload: observations array is missing or invalid.", 400);
    }

    // Validation: Ensure all observations have a contractor
    for (const obsData of data.observations) {
      if (!obsData.contractorId || obsData.contractorId.trim() === "") {
        throw new AppError("All observations must be assigned to a contractor.", 400);
      }
    }

    const inspection = await prisma.$transaction(async (tx) => {
      // 1. Create inspection record
      const ins = await tx.inspection.create({
        data: {
          clientRefId: data.clientRefId,
          mineId: data.mineId,
          zone: data.zone,
          inspectorId: data.inspectorId,
          contractorId: data.contractorId,
          taskType: data.taskType,
          latitude: data.latitude,
          longitude: data.longitude,
          locationAccuracy: data.locationAccuracy,
          startedAt: data.startedAt,
          submittedAt: new Date(),
          status: data.status || "SUBMITTED",
        },
      });

      // 2. Create nested observations
      const contractorImpacts = new Set<string>();

      for (const obsData of data.observations) {
        const obsCode = await this.generateObservationCode(tx);
        
        let gpsString = null;
        if (data.latitude && data.longitude) {
            gpsString = `${data.latitude},${data.longitude}`;
        }
        
        let savedPhotoUrl = obsData.photoUrl || null;

        // Process Base64 photo if provided
        if (obsData.photoBase64) {
          try {
            // Strip data:image/jpeg;base64, prefix if present
            const base64Data = obsData.photoBase64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const filename = `evidence-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
            
            // public/uploads/evidence must exist (created during setup)
            const uploadDir = path.join(__dirname, "../../public/uploads/evidence");
            // Ensure directory exists
            fs.mkdirSync(uploadDir, { recursive: true });
            
            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);
            savedPhotoUrl = `/uploads/evidence/${filename}`;
          } catch (err) {
            console.error("Failed to save photo locally:", err);
          }
        }

        const obs = await tx.observation.create({
          data: {
            observationCode: obsCode,
            contractorId: obsData.contractorId,
            supervisorName: data.inspectorId,
            zone: data.zone || "Unknown",
            category: obsData.category,
            severity: obsData.severity,
            description: obsData.description,
            photoUrl: savedPhotoUrl,
            status: "OPEN",
            inspectionId: ins.id,
            gpsCoordinates: gpsString,
          }
        });

        // Increment contractor violation count
        await tx.contractor.update({
          where: { id: obsData.contractorId },
          data: {
            violationCount: { increment: 1 },
          },
        });

        // Audit trail
        await tx.auditLog.create({
          data: {
            observationId: obs.id,
            action: "CREATED",
            actorRole: "SUPERVISOR",
            actorName: data.inspectorId,
            details: `Field inspection observation logged with severity ${obsData.severity}: ${obsData.description}`,
          },
        });

        contractorImpacts.add(obsData.contractorId);
      }

      return { ins, contractorImpacts };
    });

    // 4. Recalculate deterministic risk and apply contractor red flag for affected contractors
    for (const cId of Array.from(inspection.contractorImpacts)) {
      await ContractorService.recalculateRisk(cId);
    }

    return inspection.ins;
  }

  /**
   * List inspections (optionally filtered by inspector or contractor)
   */
  public static async listInspections(filters: { inspectorId?: string; contractorId?: string }) {
    const where: any = {};
    if (filters.inspectorId) where.inspectorId = filters.inspectorId;
    if (filters.contractorId) where.contractorId = filters.contractorId;

    return await prisma.inspection.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        contractor: true,
        observations: true,
      },
    });
  }
}
