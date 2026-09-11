import React, { useState } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  XCircle,
  FileSignature,
  ShieldAlert,
  FileSearch,
  Wind,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types — matches the backend GovernanceAnalysisSchema exactly
// ─────────────────────────────────────────────────────────────────────────────
interface KeyConcern {
  title: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  explanation: string;
  sourceReferences: string[];
}

interface FollowUpAction {
  id: string;
  label: string;
  type: string;
}

interface GovernanceAnalysis {
  executiveSummary: string;
  riskExplanation: string;
  complianceExplanation: string;
  keyConcerns: KeyConcern[];
  evidenceAssessment: string;
  recommendedReviewActions: string[];
  dataLimitations: string[];
  followUpActions: FollowUpAction[];
  disclaimer: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface AIGovernanceAnalysisProps {
  contractorId: string;
  contractorName: string;
  onFollowUpAction: (actionId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const FOLLOW_UP_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  REVIEW_CRITICAL_OBSERVATIONS: ShieldAlert,
  REVIEW_OVERDUE_OBLIGATIONS: AlertCircle,
  REVIEW_ENVIRONMENTAL_FINDINGS: Wind,
  REVIEW_RISK_FACTORS: BarChart2,
};

function getSeverityClasses(severity: string) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return {
        badge: "text-red-700 bg-red-100 border-red-300 dark:text-red-300 dark:bg-red-900/30 dark:border-red-800",
        card: "border-l-4 border-red-500",
      };
    case "HIGH":
      return {
        badge: "text-orange-700 bg-orange-100 border-orange-300 dark:text-orange-300 dark:bg-orange-900/30 dark:border-orange-800",
        card: "border-l-4 border-orange-500",
      };
    case "MODERATE":
      return {
        badge: "text-yellow-700 bg-yellow-100 border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800",
        card: "border-l-4 border-yellow-500",
      };
    default:
      return {
        badge: "text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-800",
        card: "border-l-4 border-emerald-500",
      };
  }
}

// Map AI error codes to user-friendly messages
function getErrorMessage(err: any): string {
  const msg: string = err?.message || "";
  if (msg.includes("AI_INVALID_API_KEY")) {
    return "The AI analysis service is not configured. Please contact your system administrator.";
  }
  if (msg.includes("AI_PROVIDER_TIMEOUT")) {
    return "The AI analysis timed out. Please try again.";
  }
  if (msg.includes("AI_MALFORMED_RESPONSE")) {
    return "The AI returned an unexpected response. Please try again.";
  }
  if (msg.includes("AI_PROVIDER_UNAVAILABLE")) {
    return "The AI analysis service is temporarily unavailable. Please try again in a few moments.";
  }
  if (msg.includes("503") || msg.includes("unavailable")) {
    return "The AI analysis service is temporarily unavailable. Please try again.";
  }
  if (msg.includes("Failed to fetch") || msg.includes("network")) {
    return "Network error — unable to reach the analysis service. Check your connection.";
  }
  return "An unexpected error occurred while generating the governance analysis. Please try again.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function AIGovernanceAnalysis({
  contractorId,
  contractorName,
  onFollowUpAction,
}: AIGovernanceAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GovernanceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      // fetchApi throws on non-2xx or success:false, so on success `res` is
      // always { success: true, data: GovernanceAnalysis, metadata: {...} }
      const res = await api.analyzeGovernance(contractorId);
      setAnalysis(res.data as GovernanceAnalysis);
    } catch (err: any) {
      console.error("[AIGovernanceAnalysis] Error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-mine-950 border border-neutral-200 dark:border-mine-800 rounded-[2rem] p-6 shadow-sm mb-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-500" />
            AI Governance Analysis
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Generative explanation of {contractorName}'s current deterministic governance state.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 md:mt-0 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-full flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="h-4 w-4" />
          )}
          {analysis ? "Regenerate Analysis" : "Generate Analysis"}
        </button>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-500 dark:text-neutral-400">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Analyzing governance records…</p>
          <p className="text-xs text-neutral-400">This may take up to 30 seconds.</p>
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400">Analysis Failed</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* ── Analysis output ── */}
      {!loading && analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Disclaimer */}
          <div className="p-3 bg-neutral-100 dark:bg-mine-900/50 rounded-xl flex items-start gap-2 border border-neutral-200 dark:border-mine-800">
            <Info className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400 italic leading-relaxed">
              {analysis.disclaimer}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Left column ── */}
            <div className="space-y-4">

              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-mine-900/20 border border-neutral-100 dark:border-mine-800">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-indigo-500" />
                  Executive Summary
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {analysis.executiveSummary}
                </p>
              </div>

              {/* Risk Explanation */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-mine-900/20 border border-neutral-100 dark:border-mine-800">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Risk Explanation
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {analysis.riskExplanation}
                </p>
              </div>

              {/* Compliance Explanation */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-mine-900/20 border border-neutral-100 dark:border-mine-800">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Compliance Explanation
                </h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {analysis.complianceExplanation}
                </p>
              </div>

              {/* Evidence Assessment */}
              {analysis.evidenceAssessment && (
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-mine-900/20 border border-neutral-100 dark:border-mine-800">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-blue-500" />
                    Evidence Assessment
                  </h4>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {analysis.evidenceAssessment}
                  </p>
                </div>
              )}

              {/* Data Limitations */}
              {analysis.dataLimitations.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2 uppercase tracking-wider">
                    Data Limitations
                  </h4>
                  <ul className="space-y-1">
                    {analysis.dataLimitations.map((limitation, i) => (
                      <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="space-y-4">

              {/* Key Concerns */}
              {analysis.keyConcerns.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
                    Key Concerns
                  </h4>
                  <div className="space-y-3">
                    {analysis.keyConcerns.map((concern, i) => {
                      const { badge, card } = getSeverityClasses(concern.severity);
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl bg-white dark:bg-mine-950 border border-neutral-200 dark:border-mine-800 shadow-sm ${card}`}
                        >
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h5 className="text-sm font-semibold text-neutral-900 dark:text-white flex-1">
                              {concern.title}
                            </h5>
                            <span
                              className={`flex-shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badge}`}
                            >
                              {concern.severity}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                            {concern.explanation}
                          </p>
                          {concern.sourceReferences.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {concern.sourceReferences.map((ref, j) => (
                                <span
                                  key={j}
                                  className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-mine-800 text-neutral-500 dark:text-neutral-400 rounded font-mono"
                                >
                                  {ref}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Review Actions */}
              {analysis.recommendedReviewActions.length > 0 && (
                <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Recommended for Supervisor Review
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendedReviewActions.map((action, i) => (
                      <li key={i} className="text-sm text-indigo-800 dark:text-indigo-200 flex items-start gap-2">
                        <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Actions — server-approved navigation buttons only */}
              {analysis.followUpActions.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-mine-950 border border-neutral-200 dark:border-mine-800">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
                    Follow-up Review
                  </h4>
                  <div className="space-y-2">
                    {analysis.followUpActions.map((action) => {
                      const Icon = FOLLOW_UP_ICONS[action.id] ?? ChevronRight;
                      return (
                        <button
                          key={action.id}
                          onClick={() => onFollowUpAction(action.id)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-900/40 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-500 transition-colors group"
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={16} className="text-indigo-500" />
                            {action.label}
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-neutral-400 group-hover:text-indigo-500 transition-colors"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
