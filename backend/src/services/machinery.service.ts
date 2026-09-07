import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";

export class MachineryService {
  public static async create(data: any) {
    const contractor = await prisma.contractor.findUnique({
      where: { id: data.contractorId },
    });

    if (!contractor) {
      throw new AppError("Contractor not found", 404);
    }

    return prisma.machinery.create({
      data: {
        ...data,
        lastServiced: data.lastServiced ? new Date(data.lastServiced) : undefined,
        nextDue: data.nextDue ? new Date(data.nextDue) : undefined,
      },
    });
  }

  public static async list(query: any) {
    const { contractorId, status, ownership, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (contractorId) where.contractorId = contractorId;
    if (status) where.status = status;
    if (ownership) where.ownership = ownership;

    const [machinery, total] = await Promise.all([
      prisma.machinery.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.machinery.count({ where }),
    ]);

    return {
      data: machinery,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  public static async getById(id: string) {
    const machinery = await prisma.machinery.findUnique({
      where: { id },
      include: {
        contractor: {
          select: { name: true, contractorCode: true },
        },
      },
    });

    if (!machinery) {
      throw new AppError("Machinery not found", 404);
    }

    return machinery;
  }

  public static async update(id: string, data: any) {
    const existing = await prisma.machinery.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Machinery not found", 404);
    }

    const updateData = { ...data };
    if (updateData.lastServiced) {
      updateData.lastServiced = new Date(updateData.lastServiced);
    }
    if (updateData.nextDue) {
      updateData.nextDue = new Date(updateData.nextDue);
    }

    return prisma.machinery.update({
      where: { id },
      data: updateData,
    });
  }

  public static async delete(id: string) {
    const existing = await prisma.machinery.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Machinery not found", 404);
    }

    await prisma.machinery.delete({ where: { id } });
    return true;
  }
}
