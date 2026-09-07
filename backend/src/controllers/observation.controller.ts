import { Request, Response, NextFunction } from "express";
import { ObservationService } from "../services/observation.service";

export class ObservationController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== "SUPERVISOR") {
        res.status(403).json({ success: false, error: { message: "Only supervisors can create observations." } });
        return;
      }
      const observation = await ObservationService.create(req.body);
      res.status(201).json({
        success: true,
        data: observation,
        message: "Observation logged. Contractor profile has been red-flagged.",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = { ...(req.query as any) };
      if (req.user?.role === "CONTRACTOR") {
        query.contractorId = req.user.contractorId;
      }
      const result = await ObservationService.list(query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const observation = await ObservationService.getById(req.params.id);
      if (req.user?.role === "CONTRACTOR" && observation.contractorId !== req.user.contractorId) {
        res.status(403).json({ success: false, error: { message: "Access denied." } });
        return;
      }
      res.status(200).json({
        success: true,
        data: observation,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async submitEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Access check
      const obs = await ObservationService.getById(req.params.id);
      if (req.user?.role === "CONTRACTOR" && obs.contractorId !== req.user.contractorId) {
        res.status(403).json({ success: false, error: { message: "Access denied." } });
        return;
      }

      const observation = await ObservationService.submitEvidence(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: observation,
        message: "Evidence submitted successfully. Pending supervisor review.",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== "SUPERVISOR") {
        res.status(403).json({ success: false, error: { message: "Only supervisors can verify observations." } });
        return;
      }
      const observation = await ObservationService.verifyAndResolve(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: observation,
        message: "Observation verified and closed. Audit record permanently sealed.",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role !== "SUPERVISOR") {
        res.status(403).json({ success: false, error: { message: "Only supervisors can delete observations." } });
        return;
      }
      const result = await ObservationService.delete(req.params.id);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

