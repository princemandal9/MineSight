import { prisma } from "../models/prisma";

/**
 * Centralized due-date window configuration.
 * All status calculation logic uses ONLY these constants.
 */
export const COMPLIANCE_WINDOWS = {
  DUE_SOON_DAYS: 7,
  CRITICAL_OVERDUE_DAYS: 30,
};

export type ComplianceStatus =
  | "COMPLIANT"
  | "DUE_SOON"
  | "DUE_TODAY"
  | "OVERDUE"
  | "NON_COMPLIANT"
  | "PENDING_VERIFICATION"
  | "NOT_APPLICABLE";

/**
 * Deterministic status calculation — single source of truth.
 * Frontend consumes calculated status, never invents its own.
 */
export function calculateObligationStatus(ob: {
  status: string;
  dueDate: Date | null;
  evidenceUrl: string | null;
  verifiedAt: Date | null;
  evidenceNotes: string | null;
}): ComplianceStatus {
  if (ob.status === "COMPLIANT") return "COMPLIANT";
  if (ob.status === "NON_COMPLIANT") return "NON_COMPLIANT";
  if (ob.status === "NOT_APPLICABLE") return "NOT_APPLICABLE";
  if (ob.status === "PENDING_VERIFICATION") return "PENDING_VERIFICATION";

  const now = new Date();
  if (!ob.dueDate) return "COMPLIANT";

  const dueDate = new Date(ob.dueDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / msPerDay);

  if (daysUntilDue < 0) return "OVERDUE";
  if (daysUntilDue === 0) return "DUE_TODAY";
  if (daysUntilDue <= COMPLIANCE_WINDOWS.DUE_SOON_DAYS) return "DUE_SOON";

  return "COMPLIANT";
}

export class ComplianceService {
  /**
   * Sweeps all non-finalized obligations and recalculates status from due dates.
   * Called on every GET /compliance and GET /compliance/report.
   */
  public static async sweepAndUpdateStatuses(): Promise<void> {
    const obligations = await prisma.statutoryObligation.findMany({
      where: {
        status: {
          notIn: ["COMPLIANT", "NON_COMPLIANT", "NOT_APPLICABLE", "PENDING_VERIFICATION"],
        },
      },
      select: {
        id: true,
        status: true,
        dueDate: true,
        evidenceUrl: true,
        verifiedAt: true,
        evidenceNotes: true,
      },
    });

    for (const ob of obligations) {
      const newStatus = calculateObligationStatus(ob);
      if (newStatus !== ob.status) {
        await prisma.statutoryObligation.update({
          where: { id: ob.id },
          data: { status: newStatus },
        });
      }
    }
  }

  /**
   * Single source of truth for compliance statistics.
   * Used by BOTH overview dashboard AND reports page.
   * Formula: overallCompliancePercentage = (COMPLIANT + PENDING_VERIFICATION) / total * 100
   */
  public static async getComplianceStats() {
    await this.sweepAndUpdateStatuses();

    const obligations = await prisma.statutoryObligation.findMany({
      include: { contractor: { select: { id: true, name: true, taskType: true } } },
      orderBy: { dueDate: "asc" },
    });

    const total = obligations.length;
    const compliant = obligations.filter((o) => o.status === "COMPLIANT").length;
    const dueSoon = obligations.filter((o) => o.status === "DUE_SOON" || o.status === "DUE_TODAY").length;
    const overdue = obligations.filter((o) => o.status === "OVERDUE").length;
    const nonCompliant = obligations.filter((o) => o.status === "NON_COMPLIANT").length;
    const pendingVerification = obligations.filter((o) => o.status === "PENDING_VERIFICATION").length;
    const notApplicable = obligations.filter((o) => o.status === "NOT_APPLICABLE").length;

    const overallCompliancePercentage =
      total > 0 ? Math.round(((compliant + pendingVerification) / total) * 100) : 100;

    const domainNames = ["SAFETY", "ENVIRONMENT", "PRODUCTION", "LABOUR"] as const;
    const domains: Record<string, any> = {};
    for (const d of domainNames) {
      const dObs = obligations.filter((o) => o.domain === d);
      domains[d] = {
        total: dObs.length,
        compliant: dObs.filter((o) => o.status === "COMPLIANT").length,
        dueSoon: dObs.filter((o) => o.status === "DUE_SOON" || o.status === "DUE_TODAY").length,
        overdue: dObs.filter((o) => o.status === "OVERDUE").length,
        nonCompliant: dObs.filter((o) => o.status === "NON_COMPLIANT").length,
        pendingVerification: dObs.filter((o) => o.status === "PENDING_VERIFICATION").length,
      };
    }

    return {
      summary: {
        total,
        compliant,
        dueSoon,
        overdue,
        nonCompliant,
        pendingVerification,
        notApplicable,
        overallCompliancePercentage,
      },
      domains,
      obligations,
    };
  }
}
