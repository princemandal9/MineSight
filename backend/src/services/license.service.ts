import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";

export class LicenseService {
  public static async create(data: any) {
    // Verify contractor exists
    const contractor = await prisma.contractor.findUnique({
      where: { id: data.contractorId },
    });

    if (!contractor) {
      throw new AppError("Contractor not found", 404);
    }

    return prisma.license.create({
      data: {
        ...data,
        expiryDate: new Date(data.expiryDate),
      },
    });
  }

  public static async list(query: any) {
    const { contractorId, status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (contractorId) where.contractorId = contractorId;
    if (status) where.status = status;

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { expiryDate: "asc" },
      }),
      prisma.license.count({ where }),
    ]);

    return {
      data: licenses,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  public static async getById(id: string, authorizedContractorId?: string) {
    const where: any = { id };
    if (authorizedContractorId) where.contractorId = authorizedContractorId;
    
    const license = await prisma.license.findFirst({
      where,
      include: {
        contractor: {
          select: { name: true, contractorCode: true },
        },
      },
    });

    if (!license) {
      throw new AppError("License not found", 404);
    }

    return license;
  }

  public static async update(id: string, data: any, authorizedContractorId?: string) {
    const where: any = { id };
    if (authorizedContractorId) where.contractorId = authorizedContractorId;

    const existing = await prisma.license.findFirst({ where });
    if (!existing) {
      throw new AppError("License not found", 404);
    }

    const updateData = { ...data };
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    return prisma.license.update({
      where: { id },
      data: updateData,
    });
  }

  public static async delete(id: string, authorizedContractorId?: string) {
    const where: any = { id };
    if (authorizedContractorId) where.contractorId = authorizedContractorId;

    const existing = await prisma.license.findFirst({ where });
    if (!existing) {
      throw new AppError("License not found", 404);
    }

    await prisma.license.delete({ where: { id } });
    return true;
  }
}
