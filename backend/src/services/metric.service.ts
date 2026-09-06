import { prisma } from "../models/prisma";

export class MetricService {
  /**
   * Deterministically calculates system-wide governance & compliance metrics
   */
  public static async getOverviewMetrics() {
    const [
      activeContractorsCount,
      criticalOpenObservationsCount,
      contractors,
      latestEnvLog,
    ] = await Promise.all([
      prisma.contractor.count({ where: { status: "ACTIVE" } }),
      prisma.observation.count({
        where: {
          severity: "CRITICAL",
          status: { in: ["OPEN", "EVIDENCE_SUBMITTED"] },
        },
      }),
      prisma.contractor.findMany({
        where: { status: "ACTIVE" },
        select: { complianceRate: true },
      }),
      prisma.environmentalLog.findFirst({
        orderBy: { date: "desc" },
      }),
    ]);

    // Average compliance rate
    const overallComplianceRate =
      contractors.length > 0
        ? Math.round(
            (contractors.reduce((acc, c) => acc + c.complianceRate, 0) /
              contractors.length) *
              10
          ) / 10
        : 100.0;

    // Environmental readings fallback or from latest log
    const environmental = latestEnvLog || {
      dailyTonnage: 1420.0,
      pm10Dust: 78.0, // Safe threshold: 100 µg/m³
      effluentPh: 7.2, // Safe range: 6.5 - 8.5
      noiseDb: 79.5, // Safe threshold: 85 dB
      riskScore: 28.0,
      riskLabel: "Low",
    };

    return {
      topMetrics: {
        totalActiveContractors: activeContractorsCount,
        criticalOpenObservations: criticalOpenObservationsCount,
        overallComplianceRate,
        mineEnvironmentalRiskPercentage: environmental.riskScore,
        environmentalRiskLabel: environmental.riskLabel,
      },
      environmentalReadings: {
        dailyTonnage: environmental.dailyTonnage,
        pm10Dust: {
          value: environmental.pm10Dust,
          unit: "µg/m³",
          threshold: 100,
          isAboveLimit: environmental.pm10Dust > 100,
        },
        effluentPh: {
          value: environmental.effluentPh,
          unit: "pH",
          safeRange: "6.5 - 8.5",
          isOutOfRange: environmental.effluentPh < 6.5 || environmental.effluentPh > 8.5,
        },
        noiseLevel: {
          value: environmental.noiseDb,
          unit: "dB",
          threshold: 85,
          isAboveLimit: environmental.noiseDb > 85,
        },
      },
    };
  }

  /**
   * Log daily environmental readings
   */
  public static async logEnvironmentalReading(data: {
    dailyTonnage: number;
    pm10Dust: number;
    effluentPh: number;
    noiseDb: number;
    loggedBy: string;
    notes?: string;
  }) {
    // Deterministic environmental risk calculation
    let penalty = 0;
    if (data.pm10Dust > 100) penalty += (data.pm10Dust - 100) * 1.5;
    if (data.effluentPh < 6.5) penalty += (6.5 - data.effluentPh) * 20;
    if (data.effluentPh > 8.5) penalty += (data.effluentPh - 8.5) * 20;
    if (data.noiseDb > 85) penalty += (data.noiseDb - 85) * 3;

    const riskScore = Math.min(100, Math.max(5, Math.round(penalty + 15)));
    let riskLabel = "Low";
    if (riskScore >= 60) riskLabel = "Critical";
    else if (riskScore >= 30) riskLabel = "Moderate";

    return await prisma.environmentalLog.create({
      data: {
        dailyTonnage: data.dailyTonnage,
        pm10Dust: data.pm10Dust,
        effluentPh: data.effluentPh,
        noiseDb: data.noiseDb,
        riskScore,
        riskLabel,
        loggedBy: data.loggedBy,
        notes: data.notes || null,
      },
    });
  }
}

