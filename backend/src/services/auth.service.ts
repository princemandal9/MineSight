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
  private static generateToken(user: { id: string; email: string; role: string }): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
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
        const count = await prisma.contractor.count();
        const code = `CON-${String(count + 1).padStart(4, "0")}`;
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

    return user;
  }
}

