import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../models/prisma";
import { AppError } from "../utils/appError";
import { AuthLogService } from "./authLog.service";

const JWT_SECRET = process.env.JWT_SECRET || "minesight-sih-2026-fallback-secret";
const JWT_EXPIRES_IN = "7d";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: "CONTRACTOR" | "SUPERVISOR";
  phone?: string;
  companyName?: string;
  taskType?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Generates JWT Token
   */
  private static generateToken(user: { id: string; email: string; role: string; contractorId?: string | null }): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        contractorId: user.contractorId || null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Register a new user and append details to the file log
   */
  public static async register(
    data: RegisterUserInput,
    clientIp?: string,
    userAgent?: string
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new AppError(`User with email '${data.email}' already exists`, 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role = data.role || "CONTRACTOR";

    // If registering as contractor, link or create Contractor record
    let contractorId: string | undefined = undefined;
    if (role === "CONTRACTOR" && (data.companyName || data.name)) {
      const company = data.companyName || data.name;
      const existingContractor = await prisma.contractor.findFirst({
        where: { name: company },
      });

      if (existingContractor) {
        contractorId = existingContractor.id;
      } else {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        let code = "";
        for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        for (let i = 0; i < 3; i++) code += nums.charAt(Math.floor(Math.random() * nums.length));
        const newContractor = await prisma.contractor.create({
          data: {
            contractorCode: code,
            name: company,
            email: data.email.toLowerCase().trim(),
            phone: data.phone || null,
            taskType: data.taskType || "blasting",
            riskLevel: "LOW",
            complianceRate: 100.0,
          },
        });
        contractorId = newContractor.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        phone: data.phone || null,
        companyName: data.companyName || null,
        taskType: data.taskType || null,
        contractorId: contractorId || null,
      },
    });

    // 📝 Add registration details to the file
    await AuthLogService.recordAuthEvent(
      "REGISTRATION",
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        taskType: user.taskType,
        phone: user.phone,
        contractorId: user.contractorId,
      },
      clientIp,
      userAgent
    );

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        taskType: user.taskType,
        contractorId: user.contractorId,
        contractorCode: contractorId ? (await prisma.contractor.findUnique({ where: { id: contractorId } }))?.contractorCode : undefined,
        contractorStatus: contractorId ? (await prisma.contractor.findUnique({ where: { id: contractorId } }))?.status : undefined,
        rejectionReason: contractorId ? (await prisma.contractor.findUnique({ where: { id: contractorId } }))?.rejectionReason : undefined,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Log in user and append login details to the file log
   */
  public static async login(
    data: LoginUserInput,
    clientIp?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    // 📝 Add login details to the file
    await AuthLogService.recordAuthEvent(
      "LOGIN",
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        taskType: user.taskType,
        phone: user.phone,
        contractorId: user.contractorId,
      },
      clientIp,
      userAgent
    );

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        taskType: user.taskType,
        contractorId: user.contractorId,
        contractorCode: user.contractorId ? (await prisma.contractor.findUnique({ where: { id: user.contractorId } }))?.contractorCode : undefined,
        contractorStatus: user.contractorId ? (await prisma.contractor.findUnique({ where: { id: user.contractorId } }))?.status : undefined,
        rejectionReason: user.contractorId ? (await prisma.contractor.findUnique({ where: { id: user.contractorId } }))?.rejectionReason : undefined,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Get user profile by ID
   */
  public static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        companyName: true,
        taskType: true,
        contractorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    let contractorCode = undefined;
    let contractorStatus = undefined;
    let rejectionReason = undefined;
    if (user.contractorId) {
      const contractor = await prisma.contractor.findUnique({ where: { id: user.contractorId } });
      if (contractor) {
        contractorCode = contractor.contractorCode;
        contractorStatus = contractor.status;
        rejectionReason = contractor.rejectionReason;
      }
    }

    return { ...user, contractorCode, contractorStatus, rejectionReason };
  }

  /**
   * Update user profile by ID
   */
  public static async updateProfile(userId: string, data: { name?: string; phone?: string; companyName?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        companyName: data.companyName,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        companyName: true,
        taskType: true,
        contractorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Also update contractor if the user is linked to one and company name changed
    if (user.contractorId && data.companyName) {
       await prisma.contractor.update({
         where: { id: user.contractorId },
         data: { name: data.companyName }
       });
    }

    return user;
  }

  /**
   * Change user password securely
   */
  public static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters long", 400);
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    return true;
  }

  /**
   * Export all user governance data
   */
  public static async exportData(userId: string, contractorId?: string | null) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, companyName: true, createdAt: true }
    });
    
    let contractorData = null;
    if (contractorId) {
      contractorData = await prisma.contractor.findUnique({
        where: { id: contractorId },
        include: {
          observations: true,
          statutoryObligations: true,
          inspections: true,
          licenses: true,
          machinery: true,
          workers: true,
          explosivesStock: true,
          dailyLogs: true,
        }
      });
    }
    
    return {
      user,
      contractor: contractorData,
      exportedAt: new Date().toISOString()
    };
  }
}

