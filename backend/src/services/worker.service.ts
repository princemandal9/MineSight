import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";

export class WorkerService {
  public static async create(data: any) {
    const contractor = await prisma.contractor.findUnique({
      where: { id: data.contractorId },
    });

    if (!contractor) {
      throw new AppError("Contractor not found", 404);
    }

    return prisma.worker.create({
      data,
    });
  }

  public static async list(query: any) {
    const { contractorId, trainingStatus, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (contractorId) where.contractorId = contractorId;
    if (trainingStatus) where.trainingStatus = trainingStatus;

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.worker.count({ where }),
    ]);

    return {
      data: workers,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  public static async getById(id: string) {
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        contractor: {
          select: { name: true, contractorCode: true },
        },
      },
    });

    if (!worker) {
      throw new AppError("Worker not found", 404);
    }

    return worker;
  }

  public static async update(id: string, data: any) {
    const existing = await prisma.worker.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Worker not found", 404);
    }

    return prisma.worker.update({
      where: { id },
      data,
    });
  }

  public static async delete(id: string) {
    const existing = await prisma.worker.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Worker not found", 404);
    }

    await prisma.worker.delete({ where: { id } });
    return true;
  }
}
