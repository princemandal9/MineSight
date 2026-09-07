import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";

export class ExplosivesService {
  public static async create(data: any) {
    const contractor = await prisma.contractor.findUnique({
      where: { id: data.contractorId },
    });

    if (!contractor) {
      throw new AppError("Contractor not found", 404);
    }

    if (contractor.taskType !== "blasting") {
      throw new AppError("Only blasting contractors can maintain explosives stock", 400);
    }

    return prisma.explosivesStock.create({
      data,
    });
  }

  public static async list(query: any) {
    const { contractorId, explosiveType, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (contractorId) where.contractorId = contractorId;
    if (explosiveType) where.explosiveType = explosiveType;

    const [stock, total] = await Promise.all([
      prisma.explosivesStock.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.explosivesStock.count({ where }),
    ]);

    return {
      data: stock,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  public static async getById(id: string) {
    const stock = await prisma.explosivesStock.findUnique({
      where: { id },
      include: {
        contractor: {
          select: { name: true, contractorCode: true },
        },
      },
    });

    if (!stock) {
      throw new AppError("Explosives stock record not found", 404);
    }

    return stock;
  }

  public static async update(id: string, data: any) {
    const existing = await prisma.explosivesStock.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Explosives stock record not found", 404);
    }

    return prisma.explosivesStock.update({
      where: { id },
      data,
    });
  }

  public static async delete(id: string) {
    const existing = await prisma.explosivesStock.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Explosives stock record not found", 404);
    }

    await prisma.explosivesStock.delete({ where: { id } });
    return true;
  }
}
