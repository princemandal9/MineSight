import { prisma } from "../models/prisma";
import { ComplianceService } from "./compliance.service";

export interface RiskFactor {
  category: string;
  feature: string;
  contribution: number;
  direction: "POSITIVE" | "NEGATIVE";
  explanation: string;
  source: string;
}

export interface AnomalyDetection {
  metric: string;
  currentValue: number;
  baseline: number;
  unit: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  explanation: string;
}

export class RiskService {
  /**
   * Calculates dynamic risk score for a specific contractor based on live compliance and field data.
   */
  public static async calculateContractorRisk(contractorId: string) {
    // 1. Fetch data
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        statutoryObligations: true,
        observations: {
          where: { status: { in: ["OPEN", "EVIDENCE_SUBMITTED"] } },
        },
      },
    });

    if (!contractor) {
      throw new Error("Contractor not found");
    }

    // Ensure obligation statuses are up to date before calculating risk
    await ComplianceService.sweepAndUpdateStatuses();
    const updatedObligations = await prisma.statutoryObligation.findMany({
      where: { contractorId },
    });

    let riskScore = 10; // Baseline
    const riskFactors: RiskFactor[] = [];
    let recommendedAction = "Continue standard monitoring.";

    // 2. Analyze Obligations
    const overdueObs = updatedObligations.filter((o) => o.status === "OVERDUE");
    const nonCompliantObs = updatedObligations.filter((o) => o.status === "NON_COMPLIANT");

    if (overdueObs.length > 0) {
      const penalty = overdueObs.length * 15;
      riskScore += penalty;
      riskFactors.push({
        category: "COMPLIANCE",
        feature: "overdue_obligations",
        contribution: penalty,
        direction: "NEGATIVE",
        explanation: `${overdueObs.length} overdue statutory obligations`,
        source: "Statutory Compliance",
      });
    }

    if (nonCompliantObs.length > 0) {
      const penalty = nonCompliantObs.length * 20;
      riskScore += penalty;
      riskFactors.push({
        category: "COMPLIANCE",
        feature: "non_compliant_obligations",
        contribution: penalty,
        direction: "NEGATIVE",
        explanation: `${nonCompliantObs.length} rejected/non-compliant submissions`,
        source: "Statutory Compliance",
      });
    }

    // 3. Analyze Observations
    const criticalObs = contractor.observations.filter((o) => o.severity === "CRITICAL");
    const moderateObs = contractor.observations.filter((o) => o.severity === "MODERATE");

    if (criticalObs.length > 0) {
      const penalty = criticalObs.length * 25;
      riskScore += penalty;
      riskFactors.push({
        category: "SAFETY",
        feature: "critical_observations",
        contribution: penalty,
        direction: "NEGATIVE",
        explanation: `${criticalObs.length} critical field safety violations`,
        source: "Field Inspections",
      });
    }

    if (moderateObs.length > 0) {
      const penalty = moderateObs.length * 10;
      riskScore += penalty;
      riskFactors.push({
        category: "SAFETY",
        feature: "moderate_observations",
        contribution: penalty,
        direction: "NEGATIVE",
        explanation: `${moderateObs.length} moderate field safety violations`,
        source: "Field Inspections",
      });
    }

    // 4. Trend / Recurring Violation Detection
    // Count observation categories
    const categoryCounts: Record<string, number> = {};
    contractor.observations.forEach((o) => {
      categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
    });

    const recurringCategories = Object.entries(categoryCounts).filter(([_, count]) => count >= 2);
    if (recurringCategories.length > 0) {
      const penalty = recurringCategories.length * 15;
      riskScore += penalty;
      const categoriesStr = recurringCategories.map(([cat, _]) => cat).join(", ");
      riskFactors.push({
        category: "TREND",
        feature: "recurring_violations",
        contribution: penalty,
        direction: "NEGATIVE",
        explanation: `Recurring issues in categories: ${categoriesStr}`,
        source: "Pattern Analysis",
      });
      recommendedAction = `Schedule targeted contractor review focused on ${categoriesStr} compliance.`;
    } else if (riskScore >= 75) {
      recommendedAction = "Prioritize immediate contractor safety review and halt critical operations.";
    } else if (riskScore >= 50) {
      recommendedAction = "Escalate compliance review and conduct targeted field inspections.";
    }

    // Clamp score 0 - 100
    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel = "LOW";
    if (riskScore >= 75) riskLevel = "CRITICAL";
    else if (riskScore >= 50) riskLevel = "HIGH";
    else if (riskScore >= 25) riskLevel = "MODERATE";

    // Sort risk factors by contribution (highest first)
    riskFactors.sort((a, b) => b.contribution - a.contribution);

    return {
      contractorId: contractor.id,
      contractorName: contractor.name,
      contractorCode: contractor.contractorCode,
      riskScore,
      riskLevel,
      riskFactors,
      recommendedAction,
    };
  }

  /**
   * Z-Score anomaly detection for numerical environmental data
   */
  public static async detectEnvironmentalAnomalies(): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    const logs = await prisma.environmentalLog.findMany({
      orderBy: { date: "desc" },
      take: 30, // Get last 30 readings as baseline
    });

    if (logs.length < 2) {
      return anomalies; // Insufficient data
    }

    const current = logs[0];
    const historical = logs.slice(1);

    // Helper for z-score
    const checkAnomaly = (
      metricName: string,
      currentVal: number,
      historicalVals: number[],
      unit: string
    ) => {
      const sum = historicalVals.reduce((a, b) => a + b, 0);
      const mean = sum / historicalVals.length;
      
      const variance = historicalVals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historicalVals.length;
      const stdDev = Math.sqrt(variance);

      // Avoid division by zero
      const safeStdDev = stdDev === 0 ? 0.01 : stdDev;
      const zScore = Math.abs(currentVal - mean) / safeStdDev;

      // Anomaly threshold: Z-score > 2.0 (approx 95% confidence interval)
      // For a demo with limited data, a lower z-score threshold (1.5) might be better to trigger it.
      if (zScore > 1.8) {
        let severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "MODERATE";
        if (zScore > 3.0) severity = "CRITICAL";
        else if (zScore > 2.5) severity = "HIGH";

        const direction = currentVal > mean ? "above" : "below";
        
        anomalies.push({
          metric: metricName,
          currentValue: currentVal,
          baseline: Math.round(mean * 10) / 10,
          unit,
          severity,
          explanation: `Current ${metricName} is significantly ${direction} the recent baseline (Z-Score: ${zScore.toFixed(2)}).`,
        });
      }
    };

    checkAnomaly("PM10 Dust", current.pm10Dust, historical.map(l => l.pm10Dust), "µg/m³");
    checkAnomaly("Effluent pH", current.effluentPh, historical.map(l => l.effluentPh), "pH");
    checkAnomaly("Noise Level", current.noiseDb, historical.map(l => l.noiseDb), "dB");
    checkAnomaly("Daily Coal Output", current.dailyTonnage, historical.map(l => l.dailyTonnage), "Tonnes");

    return anomalies;
  }

  /**
   * Aggregates mine-wide risk
   */
  public static async getMineWideRiskOverview() {
    const contractors = await prisma.contractor.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    const contractorRisks = await Promise.all(
      contractors.map((c) => this.calculateContractorRisk(c.id))
    );

    // Sort contractors by highest risk first
    contractorRisks.sort((a, b) => b.riskScore - a.riskScore);

    const anomalies = await this.detectEnvironmentalAnomalies();

    // Overall Mine Risk Score
    // Base 20. Add average contractor risk. Add penalties for critical anomalies.
    let totalRisk = 0;
    if (contractorRisks.length > 0) {
      totalRisk = contractorRisks.reduce((acc, curr) => acc + curr.riskScore, 0) / contractorRisks.length;
    }

    const anomalyPenalty = anomalies.reduce((acc, an) => {
      if (an.severity === "CRITICAL") return acc + 25;
      if (an.severity === "HIGH") return acc + 15;
      if (an.severity === "MODERATE") return acc + 5;
      return acc;
    }, 0);

    let overallRiskScore = Math.round(totalRisk + anomalyPenalty);
    overallRiskScore = Math.max(0, Math.min(100, overallRiskScore));

    let overallRiskLevel = "LOW";
    if (overallRiskScore >= 75) overallRiskLevel = "CRITICAL";
    else if (overallRiskScore >= 50) overallRiskLevel = "HIGH";
    else if (overallRiskScore >= 25) overallRiskLevel = "MODERATE";

    // Recurring Mine-Wide issues
    const recurringIssuesTracker = [];
    const allFactors = contractorRisks.flatMap(cr => cr.riskFactors);
    const overdueCount = allFactors.filter(f => f.feature === "overdue_obligations").length;
    if (overdueCount > 0) {
      recurringIssuesTracker.push({ title: "Overdue Compliance Submissions", occurrences: overdueCount });
    }
    const criticalObsCount = allFactors.filter(f => f.feature === "critical_observations").length;
    if (criticalObsCount > 0) {
      recurringIssuesTracker.push({ title: "Critical Safety Observations", occurrences: criticalObsCount });
    }
    const recurringCatCount = allFactors.filter(f => f.feature === "recurring_violations").length;
    if (recurringCatCount > 0) {
      recurringIssuesTracker.push({ title: "Recurring Contractor Violations", occurrences: recurringCatCount });
    }
    
    // Check if we have enough historical data
    const logsCount = await prisma.environmentalLog.count();
    const dataQuality = logsCount >= 2 ? "ADEQUATE" : "INSUFFICIENT_HISTORY";

    return {
      overallRiskScore,
      overallRiskLevel,
      topRiskContractors: contractorRisks.slice(0, 3),
      allContractorRisks: contractorRisks,
      recentAnomalies: anomalies,
      recurringIssues: recurringIssuesTracker,
      dataQuality,
    };
  }
}
