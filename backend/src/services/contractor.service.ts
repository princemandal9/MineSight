import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";

export interface CreateContractorInput {
  contractorCode?: string;
  name: string;
  email?: string;
  phone?: string;
  taskType: string;
  activeWorkers?: number;
  activeMachinery?: number;
  riskLevel?: string;
}

export interface UpdateContractorInput {
  name?: string;
  email?: string;
  phone?: string;
  taskType?: string;
  activeWorkers?: number;
  activeMachinery?: number;
  riskLevel?: string;
  status?: string;
  isRestricted?: boolean;
}

export interface ContractorQueryParams {
  search?: string;
  taskType?: string;
  riskLevel?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class ContractorService {
  /**
   * Generates a unique contractor code if not provided (e.g. CON-8421)
   */
  private static async generateContractorCode(): Promise<string> {
    const count = await prisma.contractor.count();
    const padded = String(count + 1).padStart(4, "0");
    return `CON-${padded}`;
  }

  /**
   * Recalculates risk deterministically based on open observations and licenses
   */
  public static async recalculateRisk(contractorId: string): Promise<void> {
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        observations: { where: { status: { in: ["OPEN", "EVIDENCE_SUBMITTED"] } } },
        licenses: true,
        machinery: true,
      },
    });

    if (!contractor) return;

    const criticalCount = contractor.observations.filter(
      (o) => o.severity === "CRITICAL"
    ).length;
    const moderateCount = contractor.observations.filter(
      (o) => o.severity === "MODERATE"
    ).length;
    const openCount = contractor.observations.length;

    const hasExpiredLicense = contractor.licenses.some(
      (l) => l.status === "EXPIRED" || new Date(l.expiryDate) < new Date()
    );

    let newRiskLevel = "LOW";
    let isRestricted = false;

    if (criticalCount > 0 || hasExpiredLicense) {
      newRiskLevel = "CRITICAL";
      isRestricted = true;
    } else if (moderateCount > 0 || openCount >= 2) {
      newRiskLevel = "MODERATE";
    } else if (openCount > 0) {
      newRiskLevel = "LOW";
    }

    // Deterministic compliance rate: 100 - (critical * 25 + moderate * 15 + low * 5)
    const lowCount = contractor.observations.filter((o) => o.severity === "LOW").length;
    const penalty = criticalCount * 25 + moderateCount * 15 + lowCount * 5;
    const complianceRate = Math.max(0, Math.min(100, 100 - penalty));

    await prisma.contractor.update({
      where: { id: contractorId },
      data: {
        riskLevel: newRiskLevel,
        isRestricted,
        complianceRate,
      },
    });
  }

  /**
   * Create a new contractor
   */
  public static async create(data: CreateContractorInput) {
    const contractorCode = data.contractorCode || (await this.generateContractorCode());

    const existing = await prisma.contractor.findUnique({
      where: { contractorCode },
    });
    if (existing) {
      throw new AppError(`Contractor with code '${contractorCode}' already exists`, 409);
    }

    return await prisma.contractor.create({
      data: {
        contractorCode,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        taskType: data.taskType,
        activeWorkers: data.activeWorkers || 0,
        activeMachinery: data.activeMachinery || 0,
        riskLevel: data.riskLevel || "LOW",
        complianceRate: 100.0,
      },
    });
  }

  /**
   * List contractors with filters & pagination
   */
  public static async list(query: ContractorQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.taskType) {
      where.taskType = query.taskType;
    }
    if (query.riskLevel) {
      where.riskLevel = query.riskLevel;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { contractorCode: { contains: query.search } },
      ];
    }

    const [total, contractors] = await Promise.all([
      prisma.contractor.count({ where }),
      prisma.contractor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              observations: {
                where: { status: { in: ["OPEN", "EVIDENCE_SUBMITTED"] } },
              },
              licenses: true,
              machinery: true,
            },
          },
        },
      }),
    ]);

    return {
      data: contractors.map((c) => ({
        ...c,
        unresolvedObservationsCount: c._count.observations,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single contractor by ID or contractorCode
   */
  public static async getById(idOrCode: string) {
    const contractor = await prisma.contractor.findFirst({
      where: {
        OR: [{ id: idOrCode }, { contractorCode: idOrCode }],
      },
      include: {
        licenses: { orderBy: { expiryDate: "asc" } },
        machinery: { orderBy: { nextDue: "asc" } },
        workers: { take: 50 },
        explosivesStock: true,
        observations: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!contractor) {
      throw new AppError(`Contractor '${idOrCode}' not found`, 404);
    }

    return contractor;
  }

  /**
   * Update contractor
   */
  public static async update(id: string, data: UpdateContractorInput) {
    await this.getById(id);

    const updated = await prisma.contractor.update({
      where: { id },
      data,
    });

    await this.recalculateRisk(id);
    return updated;
  }

  /**
   * Delete or archive contractor
   */
  public static async delete(id: string) {
    await this.getById(id);

    return await prisma.contractor.delete({
      where: { id },
    });
  }
}

