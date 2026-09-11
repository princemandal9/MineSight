import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ComplianceService } from "../services/compliance.service";
import { NotificationService } from "../services/notification.service";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /compliance/report — Compliance summary stats (single source of truth)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/report", async (req, res) => {
  try {
    const stats = await ComplianceService.getComplianceStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /compliance — List obligations with filtering
//    Supports: contractorId, domain, status, taskType, search
//    Auto-sweeps due dates before returning
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // Sweep first so returned statuses reflect reality
    await ComplianceService.sweepAndUpdateStatuses();

    const { contractorId, domain, status, taskType } = req.query;
    const where: any = {};
    if (contractorId) where.contractorId = contractorId as string;
    
    // RBAC: Contractors can only view their own obligations
    if (req.user?.role === "CONTRACTOR") {
      where.contractorId = req.user.contractorId;
    }

    if (domain) where.domain = domain as string;
    if (status) where.status = status as string;

    // Applicability engine: filter by taskType if provided
    if (taskType) where.taskType = taskType as string;

    const obligations = await prisma.statutoryObligation.findMany({
      where,
      include: {
        contractor: {
          select: { id: true, name: true, contractorCode: true, taskType: true, riskLevel: true },
        },
        auditLogs: { orderBy: { timestamp: "desc" }, take: 10 },
        escalations: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { dueDate: "asc" },
    });

    res.json({ success: true, data: obligations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /compliance — Create obligation (authenticated, SUPERVISOR only)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "SUPERVISOR") {
      return res.status(403).json({
        success: false,
        error: { message: "Only supervisors can create compliance obligations." },
      });
    }

    const data = req.body;
    const obligation = await prisma.statutoryObligation.create({
      data: {
        title: data.title,
        description: data.description,
        domain: data.domain,
        contractorId: data.contractorId || null,
        taskType: data.taskType || null,
        zone: data.zone || null,
        frequency: data.frequency,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        evidenceRequired: data.evidenceRequired ?? true,
        sourceReference: data.sourceReference || null,
        notes: data.notes || null,
        status: data.status || "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        obligationId: obligation.id,
        action: "CREATED",
        actorRole: "SUPERVISOR",
        actorName: req.user?.email || "Supervisor",
        details: `Obligation '${obligation.title}' created by supervisor.`,
      },
    });

    res.status(201).json({ success: true, data: obligation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH /compliance/:id/evidence — Submit Evidence (authenticated, CONTRACTOR)
//    Contractor submits evidence → status becomes PENDING_VERIFICATION
//    A contractor CANNOT skip this step and call /verify directly.
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/evidence", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { evidenceUrl, evidenceNotes, submittedBy } = req.body;

    // Verify obligation ownership
    const existingObligation = await prisma.statutoryObligation.findUnique({ where: { id } });
    if (!existingObligation) {
      return res.status(404).json({ success: false, error: { message: "Obligation not found." } });
    }
    if (req.user?.role === "CONTRACTOR" && existingObligation.contractorId !== req.user.contractorId) {
      return res.status(403).json({ success: false, error: { message: "Access denied." } });
    }

    // Any authenticated user (contractor or supervisor) can submit evidence
    const obligation = await prisma.statutoryObligation.update({
      where: { id },
      data: {
        evidenceUrl: evidenceUrl || null,
        evidenceNotes: evidenceNotes || null,
        status: "PENDING_VERIFICATION",
      },
      include: { contractor: true },
    });

    await prisma.auditLog.create({
      data: {
        obligationId: obligation.id,
        action: "EVIDENCE_SUBMITTED",
        actorRole: req.user?.role || "CONTRACTOR",
        actorName: submittedBy || req.user?.email || (obligation.contractor?.name ?? "Contractor"),
        details: `Evidence submitted for '${obligation.title}'. Awaiting supervisor verification. Notes: ${evidenceNotes || "None"}`,
      },
    });

    res.json({ success: true, data: obligation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH /compliance/:id/verify — Approve or Reject (SUPERVISOR ONLY — enforced backend)
//    A CONTRACTOR calling this receives a 403. Backend-enforced, not frontend-hidden.
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/verify", authenticateToken, async (req, res) => {
  try {
    // *** RBAC ENFORCEMENT — Backend, not frontend ***
    if (req.user?.role !== "SUPERVISOR") {
      return res.status(403).json({
        success: false,
        error: {
          message: "Access denied. Only supervisors can verify compliance obligations. Self-approval is not permitted.",
        },
      });
    }

    const { id } = req.params;
    const { verifiedBy, approved, notes } = req.body;

    if (typeof approved !== "boolean") {
      return res.status(400).json({
        success: false,
        error: { message: "'approved' must be a boolean." },
      });
    }

    const newStatus = approved ? "COMPLIANT" : "NON_COMPLIANT";
    const actorName = verifiedBy || req.user?.email || "Supervisor";

    const obligation = await prisma.statutoryObligation.update({
      where: { id },
      data: {
        status: newStatus,
        verifiedBy: actorName,
        verifiedAt: new Date(),
        notes: notes || null,
        lastCompletedAt: approved ? new Date() : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        obligationId: obligation.id,
        action: approved ? "VERIFIED_APPROVED" : "REJECTED",
        actorRole: "SUPERVISOR",
        actorName: actorName,
        details: `Evidence ${approved ? "APPROVED" : "REJECTED"} for '${obligation.title}'. Reason/Notes: ${notes || "None"}`,
      },
    });

    res.json({ success: true, data: obligation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. POST /compliance/:id/escalate — Escalate an overdue/non-compliant obligation
//    SUPERVISOR ONLY — creates an immutable escalation record
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/escalate", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "SUPERVISOR") {
      return res.status(403).json({
        success: false,
        error: { message: "Only supervisors can escalate compliance obligations." },
      });
    }

    const { id } = req.params;
    const { reason, level } = req.body;

    // Verify obligation exists
    const obligation = await prisma.statutoryObligation.findUnique({ where: { id } });
    if (!obligation) {
      return res.status(404).json({ success: false, error: { message: "Obligation not found." } });
    }

    const escalation = await prisma.escalation.create({
      data: {
        obligationId: id,
        level: level || "MANAGEMENT",
        reason: reason || "Obligation is overdue or non-compliant.",
        triggeredBy: req.user?.email || "Supervisor",
      },
    });

    await prisma.auditLog.create({
      data: {
        obligationId: id,
        action: "ESCALATED",
        actorRole: "SUPERVISOR",
        actorName: req.user?.email || "Supervisor",
        details: `Escalated to ${level || "MANAGEMENT"}. Reason: ${reason || "Overdue/Non-compliant."}`,
      },
    });

    if (obligation.contractorId) {
      const contractorUsers = await prisma.user.findMany({
        where: { contractorId: obligation.contractorId, role: "CONTRACTOR" }
      });
      for (const u of contractorUsers) {
        await NotificationService.create({
          recipientId: u.id,
          type: "Compliance",
          title: "Compliance Escalation",
          message: `Obligation '${obligation.title}' has been escalated to ${level || "MANAGEMENT"}.`,
        });
      }
    }

    res.status(201).json({ success: true, data: escalation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET /compliance/:id/escalations — View escalation history for an obligation
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/escalations", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const escalations = await prisma.escalation.findMany({
      where: { obligationId: id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: escalations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. GET /compliance/:id/audit — Audit trail for an obligation
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/audit", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await prisma.auditLog.findMany({
      where: { obligationId: id },
      orderBy: { timestamp: "asc" },
    });
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
