"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  HardHat,
  FileSignature,
  Truck as TruckIcon,
  Bomb as BombIcon,
  MessageSquare,
  User,
  Pencil,
  AlertTriangle, 
  FileCheck as FileCheckIcon, 
  CheckCircle2,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  Truck,
  Bomb,
  Pickaxe,
  Activity,
  Droplet,
  Wind,
  Volume2,
  ArrowLeft,
  FileCheck,
} from "lucide-react";
import Image from "next/image";

import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/api";


import { FieldInspectionModal } from "@/components/FieldInspectionModal";
import { BrainCircuit } from "lucide-react";

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "risk", label: "AI Risk Intelligence", icon: BrainCircuit },
  { id: "compliance", label: "Statutory Compliance", icon: FileCheckIcon },
  { id: "inspections", label: "Inspections", icon: FileText },
  { id: "contractors", label: "Contractors Directory", icon: HardHat },
  { id: "reports", label: "Reports & Analytics", icon: MessageSquare },
];

const generalItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "logout", label: "Logout", icon: LogOut },
];

export default function SupervisorPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [obligations, setObligations] = useState<any[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);

  // Risk Engine State
  const [riskOverview, setRiskOverview] = useState<any>(null);
  const [selectedRiskContractor, setSelectedRiskContractor] = useState<any>(null);

  // Compliance filter state
  const [complianceDomainFilter, setComplianceDomainFilter] = useState("");
  const [complianceStatusFilter, setComplianceStatusFilter] = useState("");
  const [complianceSearch, setComplianceSearch] = useState("");

  // Escalation state
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalateReason, setEscalateReason] = useState("");

  // Reject reason state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Field Inspection State
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  const sessionUser = typeof window !== "undefined" ? auth.getUser() : null;
  const sessionToken = typeof window !== "undefined" ? auth.getToken() : null;
  const supervisorName = sessionUser?.name || "Inspector R. Verma";

  const loadObligations = async () => {
    try {
      const res = await api.getObligations();
      if (res.data) setObligations(res.data);
      const reportRes = await api.getComplianceReport();
      if (reportRes.data) setComplianceReport(reportRes.data);
    } catch (err) {
      console.error("Failed to load obligations:", err);
    }
  };

  useEffect(() => {
    loadObligations();
  }, []);

  const handleVerifyCompliance = async (id: string, approved: boolean, notes?: string) => {
    try {
      await api.verifyCompliance(
        id,
        {
          verifiedBy: supervisorName,
          approved,
          notes: notes || (approved ? "Evidence verified and approved." : "Rejected — inadequate evidence."),
        },
        sessionToken || undefined
      );
      setRejectingId(null);
      setRejectReason("");
      await loadObligations();
    } catch (e: any) {
      alert(`Verify failed: ${e.message}`);
    }
  };

  const handleEscalate = async (id: string) => {
    if (!escalateReason.trim()) return;
    try {
      await api.escalateObligation(id, { reason: escalateReason, level: "MANAGEMENT" }, sessionToken || undefined);
      setEscalatingId(null);
      setEscalateReason("");
      await loadObligations();
    } catch (e: any) {
      alert(`Escalation failed: ${e.message}`);
    }
  };

  const [contractors, setContractors] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [authRecords, setAuthRecords] = useState<any[]>([]);
  const [storageFiles, setStorageFiles] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Form State
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [category, setCategory] = useState("PPE");
  const [severity, setSeverity] = useState("CRITICAL");
  const [zone, setZone] = useState("Pit A - Sector 3");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const loggerRef = useRef<HTMLDivElement>(null);

  // Fetch all live data from backend
  const loadData = async () => {
    if (!sessionUser || sessionUser.role !== "SUPERVISOR") {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      setBackendError(null);

      // Trigger offline sync before fetching live data
      try {
        const { syncPendingInspections } = await import("@/lib/offlineSync");
        await syncPendingInspections();
      } catch (err) {
        console.warn("Offline sync check failed:", err);
      }

      const [metricsRes, contractorsRes, observationsRes, authRes, riskRes] = await Promise.all([
        api.getMetricsOverview().catch((err) => {
          throw new Error(`Metrics API error: ${err.message}`);
        }),
        api.getContractors().catch((err) => {
          throw new Error(`Contractors API error: ${err.message}`);
        }),
        api.getObservations().catch((err) => {
          throw new Error(`Observations API error: ${err.message}`);
        }),
        api.getAuthRecords().catch(() => ({ data: [], storageFiles: null })),
        api.getRiskOverview(sessionToken || undefined).catch((err) => {
          console.error("Risk API error:", err);
          return null; // Fallback so we don't break the whole app if risk fails
        }),
      ]);

      setMetrics(metricsRes.data);
      setContractors(contractorsRes.data || []);
      setObservations(observationsRes.data || []);
      setAuthRecords(authRes?.data || []);
      setStorageFiles(authRes?.storageFiles || null);
      if (riskRes) {
        setRiskOverview(riskRes);
      }

      if (contractorsRes.data?.length > 0 && !selectedContractorId) {
        setSelectedContractorId(contractorsRes.data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load backend data:", err);
      setBackendError(
        "Could not load data from Backend API. Please check your network connection and ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for coming back online
    const handleOnline = async () => {
      const { syncPendingInspections } = await import("@/lib/offlineSync");
      await syncPendingInspections();
      loadData();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Quick Observation Submit
  const handleCreateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorId || !description.trim()) return;

    try {
      setSubmitting(true);
      setFormSuccess(null);

      await api.createObservation({
        contractorId: selectedContractorId,
        supervisorName: "Inspector R. Verma",
        zone,
        category,
        severity,
        description,
      });

      setDescription("");
      setFormSuccess("Observation logged successfully! Red-flag applied to contractor.");
      await loadData();
    } catch (err: any) {
      alert(`Failed to log observation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Verify and Clear Flag or Reject Evidence
  const handleVerifyObservation = async (observationId: string, isApproved: boolean) => {
    try {
      const promptText = isApproved ? "Enter resolution notes:" : "Enter rejection reason:";
      const defaultText = isApproved ? "Physical on-site inspection passed. Safety compliance restored." : "Evidence insufficient.";
      const notes = window.prompt(promptText, defaultText);
      if (notes === null) return; // cancelled

      await api.verifyObservation(observationId, {
        verifiedBy: supervisorName,
        resolutionNotes: notes,
        isApproved
      });
      await loadData();
    } catch (err: any) {
      alert(`Failed to verify observation: ${err.message}`);
    }
  };

  // Filter contractors
  const filteredContractors = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taskType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top = metrics?.topMetrics || {
    totalActiveContractors: contractors.length,
    criticalOpenObservations: observations.filter((o) => o.severity === "CRITICAL" && o.status !== "RESOLVED").length,
    overallComplianceRate: 85,
    mineEnvironmentalRiskPercentage: 28,
  };

  const env = metrics?.environmentalReadings || {
    dailyTonnage: 1420.5,
    pm10Dust: { value: 86.0, threshold: 100, isAboveLimit: false },
    effluentPh: { value: 7.2, safeRange: "6.5 - 8.5", isOutOfRange: false },
    noiseLevel: { value: 79.5, threshold: 85, isAboveLimit: false },
  };

  
  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. TOP METRICS BAR (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-mine-900 p-5 rounded-2xl border border-neutral-200 dark:border-mine-800 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-mine-400">
              Active Contractors Onsite
            </div>
            <div className="text-3xl font-black mt-2 text-neutral-900 dark:text-mine-50">
              {top.totalActiveContractors}
            </div>
            <div className="text-xs text-neutral-400 mt-1">Full shift deployments across 3 zones</div>
          </div>

          <div className="bg-white dark:bg-mine-900 p-5 rounded-2xl border border-neutral-200 dark:border-mine-800 border-l-4 border-l-rose-500 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Critical Open Observations
            </div>
            <div className="text-3xl font-black mt-2 text-rose-600 dark:text-rose-400">
              {top.criticalOpenObservations}
            </div>
            <div className="text-xs text-neutral-400 mt-1">Requires immediate contractor proof</div>
          </div>

          <div className="bg-white dark:bg-mine-900 p-5 rounded-2xl border border-neutral-200 dark:border-mine-800 border-l-4 border-l-emerald-500 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Overall Compliance Rate
            </div>
            <div className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
              {top.overallComplianceRate}%
            </div>
            <div className="text-xs text-neutral-400 mt-1">Aggregated across all active licenses & machinery</div>
          </div>

          <div className="bg-white dark:bg-mine-900 p-5 rounded-2xl border border-neutral-200 dark:border-mine-800 border-l-4 border-l-amber-500 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Mine Environmental Risk
            </div>
            <div className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">
              {top.mineEnvironmentalRiskPercentage}%
            </div>
            <div className="text-xs text-neutral-400 mt-1">Deterministic sensor score (Low - Moderate)</div>
          </div>
        </section>
      {/* 2. ENVIRONMENTAL & YIELD LOG */}
        <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              Daily Yield & Environmental Sensors
            </h2>
            <span className="text-xs text-neutral-500">Auto-synced with latest statutory telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-mine-800/60 border border-neutral-200 dark:border-mine-700/60">
              <div className="text-xs text-neutral-500 dark:text-mine-400">Daily Coal Output</div>
              <div className="text-2xl font-bold mt-1">{env.dailyTonnage} Tonnes</div>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                On Target (1,400 T)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-mine-800/60 border border-neutral-200 dark:border-mine-700/60">
              <div className="text-xs text-neutral-500 dark:text-mine-400 flex items-center gap-1">
                <Wind size={14} /> Air Quality (PM10 Dust)
              </div>
              <div className="text-2xl font-bold mt-1">{env.pm10Dust.value} µg/m³</div>
              <span
                className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded ${env.pm10Dust.isAboveLimit
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                  }`}
              >
                {env.pm10Dust.isAboveLimit ? "Above Limit (100)" : "Below Safety Limit (100)"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-mine-800/60 border border-neutral-200 dark:border-mine-700/60">
              <div className="text-xs text-neutral-500 dark:text-mine-400 flex items-center gap-1">
                <Droplet size={14} /> Effluent / Water pH
              </div>
              <div className="text-2xl font-bold mt-1">{env.effluentPh.value} pH</div>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Safe Range (6.5 - 8.5)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-mine-800/60 border border-neutral-200 dark:border-mine-700/60">
              <div className="text-xs text-neutral-500 dark:text-mine-400 flex items-center gap-1">
                <Volume2 size={14} /> Pit Noise Level
              </div>
              <div className="text-2xl font-bold mt-1">{env.noiseLevel.value} dB</div>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Below Safety Limit (85)
              </span>
            </div>
          </div>
        </section>
    </div>
  );

  const renderRiskIntelligence = () => {
    if (!riskOverview) {
      return (
        <div className="flex justify-center py-20 text-neutral-400">
          Loading AI Risk Intelligence...
        </div>
      );
    }

    const { overallRiskScore, overallRiskLevel, topRiskContractors, recentAnomalies, recurringIssues, dataQuality } = riskOverview;

    const riskColor = (level: string) => {
      if (level === "CRITICAL") return "text-rose-600 bg-rose-100 border-rose-300 dark:text-rose-400 dark:bg-rose-900/40 dark:border-rose-800";
      if (level === "HIGH") return "text-amber-600 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-900/40 dark:border-amber-800";
      if (level === "MODERATE") return "text-yellow-600 bg-yellow-100 border-yellow-300 dark:text-yellow-400 dark:bg-yellow-900/40 dark:border-yellow-800";
      return "text-emerald-600 bg-emerald-100 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-900/40 dark:border-emerald-800";
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border flex flex-col justify-center items-center text-center shadow-xs ${riskColor(overallRiskLevel)}`}>
            <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">
              Overall Mine Risk
            </div>
            <div className="text-6xl font-black mb-1">
              {overallRiskScore}
            </div>
            <div className="text-lg font-bold tracking-widest uppercase">
              {overallRiskLevel}
            </div>
            {dataQuality === "INSUFFICIENT_HISTORY" && (
              <span className="mt-4 text-[10px] font-bold px-2 py-1 bg-white/50 dark:bg-black/20 rounded uppercase">
                [DEMO] Insufficient History - Limited Confidence
              </span>
            )}
          </div>
          
          <div className="md:col-span-2 bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 shadow-xs space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-mine-950 dark:text-white">
              <AlertTriangle className="text-amber-500" size={20} />
              Operational Anomalies
            </h2>
            {recentAnomalies.length === 0 ? (
              <div className="text-sm text-neutral-500 py-4 italic">No recent environmental or production anomalies detected.</div>
            ) : (
              <div className="space-y-3">
                {recentAnomalies.map((an: any, idx: number) => (
                  <div key={idx} className="p-3 border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">{an.severity} ANOMALY</span>
                      <strong className="text-sm">{an.metric}</strong>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-mine-300">{an.explanation}</p>
                    <div className="text-[10px] mt-2 font-mono text-neutral-500">
                      CURRENT: {an.currentValue} {an.unit} | HISTORICAL BASELINE: {an.baseline} {an.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 shadow-xs space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-mine-950 dark:text-white">
              <HardHat className="text-rose-500" size={20} />
              Highest Risk Contractors
            </h2>
            <div className="space-y-3">
              {topRiskContractors.map((c: any) => (
                <div key={c.contractorId} className="p-4 border border-neutral-100 dark:border-mine-800 rounded-xl bg-neutral-50 dark:bg-mine-800/40 flex justify-between items-center transition hover:border-purple-300 dark:hover:border-purple-500/50 cursor-pointer" onClick={() => setSelectedRiskContractor(c)}>
                  <div>
                    <div className="text-sm font-bold">{c.contractorName}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{c.contractorCode}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${riskColor(c.riskLevel)}`}>
                      {c.riskLevel} - {c.riskScore}
                    </span>
                    <span className="text-xs text-purple-600 font-bold hover:underline">Details &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 shadow-xs space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-mine-950 dark:text-white">
              <RefreshCw className="text-blue-500" size={20} />
              Recurring Issues
            </h2>
            <div className="space-y-3">
              {recurringIssues.length === 0 ? (
                <div className="text-sm text-neutral-500 py-4 italic">No recurring patterns detected across the mine.</div>
              ) : (
                recurringIssues.map((issue: any, idx: number) => (
                  <div key={idx} className="p-3 border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-200">{issue.title}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-white dark:bg-mine-900 rounded-full text-blue-700 dark:text-blue-400">
                      {issue.occurrences} Occurrences
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RISK DETAIL MODAL */}
        {selectedRiskContractor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedRiskContractor(null)}>
            <div className="bg-white dark:bg-mine-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 dark:border-mine-800 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              
              <div className={`p-6 border-b ${riskColor(selectedRiskContractor.riskLevel)} border-opacity-30`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black">{selectedRiskContractor.contractorName}</h3>
                    <p className="opacity-80 font-mono text-sm mt-1">{selectedRiskContractor.contractorCode}</p>
                  </div>
                  <button onClick={() => setSelectedRiskContractor(null)} className="text-current hover:opacity-70 font-bold p-2">&times;</button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black">{selectedRiskContractor.riskScore}</div>
                  <div className="text-sm font-bold tracking-widest uppercase opacity-80 border border-current px-3 py-1 rounded">{selectedRiskContractor.riskLevel} RISK</div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Why is this risky?</h4>
                  <div className="space-y-2">
                    {selectedRiskContractor.riskFactors.map((rf: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-mine-800/40 rounded-lg border border-neutral-100 dark:border-mine-800">
                        <div className="mt-0.5 text-rose-500"><AlertTriangle size={16} /></div>
                        <div>
                          <div className="text-sm font-semibold">{rf.explanation}</div>
                          <div className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Source: {rf.source} • Impact: +{rf.contribution}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">AI Recommended Action</h4>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">"{selectedRiskContractor.recommendedAction}"</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-neutral-100 dark:border-mine-800 flex justify-end">
                  <button onClick={() => { setActiveTab("compliance"); setComplianceSearch(selectedRiskContractor.contractorName); setSelectedRiskContractor(null); }} className="px-4 py-2 text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-mine-950 rounded-lg hover:opacity-90 transition">
                    Review Evidence &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompliance = () => {
    const statusColor = (s: string) => {
      if (s === 'COMPLIANT') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300';
      if (s === 'DUE_SOON' || s === 'DUE_TODAY') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300';
      if (s === 'OVERDUE') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300';
      if (s === 'PENDING_VERIFICATION') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
      if (s === 'NON_COMPLIANT') return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300';
      return 'bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-mine-800 dark:border-mine-700';
    };

    const filteredObs = obligations.filter((ob: any) => {
      if (complianceDomainFilter && ob.domain !== complianceDomainFilter) return false;
      if (complianceStatusFilter && ob.status !== complianceStatusFilter) return false;
      if (complianceSearch) {
        const q = complianceSearch.toLowerCase();
        return (ob.title?.toLowerCase().includes(q) || ob.contractor?.name?.toLowerCase().includes(q) || ob.zone?.toLowerCase().includes(q));
      }
      return true;
    });

    return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* STATUTORY COMPLIANCE CENTER */}
      <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold flex items-center gap-2 text-mine-950 dark:text-white">
            <FileCheckIcon className="text-purple-600" size={20} />
            Statutory Compliance Center
            <span className="text-xs font-normal text-neutral-400 dark:text-mine-500">(Data-backed · Auto-sweep on load)</span>
          </h2>
          <button onClick={loadObligations} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-mine-700 bg-white dark:bg-mine-900 hover:bg-neutral-50 dark:hover:bg-mine-800 transition">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={complianceDomainFilter}
            onChange={e => setComplianceDomainFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800 focus:outline-none focus:ring-1 focus:ring-purple-400"
          >
            <option value="">All Domains</option>
            <option value="SAFETY">Safety</option>
            <option value="ENVIRONMENT">Environment</option>
            <option value="PRODUCTION">Production</option>
            <option value="LABOUR">Labour</option>
          </select>
          <select
            value={complianceStatusFilter}
            onChange={e => setComplianceStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800 focus:outline-none focus:ring-1 focus:ring-purple-400"
          >
            <option value="">All Statuses</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DUE_SOON">Due Soon</option>
            <option value="DUE_TODAY">Due Today</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="NON_COMPLIANT">Non-Compliant</option>
            <option value="COMPLIANT">Compliant</option>
          </select>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
            <input
              type="text"
              value={complianceSearch}
              onChange={e => setComplianceSearch(e.target.value)}
              placeholder="Search title, contractor, zone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
          <span className="text-xs text-neutral-400">{filteredObs.length} of {obligations.length}</span>
        </div>

        {/* ── Obligation Cards ── */}
        <div className="space-y-3">
          {filteredObs.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 dark:text-neutral-400 text-sm">
              No obligations match the current filters.
            </div>
          ) : (
            filteredObs.map((ob: any) => (
              <div key={ob.id} className="p-4 border border-neutral-100 dark:border-mine-800 rounded-xl bg-neutral-50/50 dark:bg-mine-900/40 space-y-3">
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor(ob.status)}`}>
                        {ob.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded">
                        {ob.domain}
                      </span>
                      {ob.frequency && (
                        <span className="text-[10px] text-neutral-500 dark:text-mine-400 uppercase tracking-wider">{ob.frequency}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-mine-950 dark:text-white leading-tight">{ob.title}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{ob.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      <span>Contractor: <strong className="text-neutral-600 dark:text-mine-300">{ob.contractor?.name ?? 'Mine-wide'}</strong></span>
                      <span>Due: <strong className="text-neutral-600 dark:text-mine-300">{ob.dueDate ? new Date(ob.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric'}) : 'N/A'}</strong></span>
                      {ob.zone && <span>Zone: <strong className="text-neutral-600 dark:text-mine-300">{ob.zone}</strong></span>}
                      {ob.taskType && <span>Task Type: <strong className="text-neutral-600 dark:text-mine-300">{ob.taskType}</strong></span>}
                      {ob.sourceReference && <span>Ref: <em className="text-neutral-500">{ob.sourceReference}</em></span>}
                    </div>

                    {/* Rejection reason */}
                    {ob.status === 'NON_COMPLIANT' && ob.notes && (
                      <div className="flex items-start gap-2 mt-1 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-400">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                        <span><strong>Rejection Reason:</strong> {ob.notes}</span>
                      </div>
                    )}

                    {/* Verified by */}
                    {ob.status === 'COMPLIANT' && ob.verifiedBy && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} /> Verified by <strong>{ob.verifiedBy}</strong>
                        {ob.verifiedAt && <span className="text-neutral-400">· {new Date(ob.verifiedAt).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="shrink-0 flex flex-col gap-2 min-w-[150px]">
                    {ob.evidenceUrl && (
                      <a href={ob.evidenceUrl} target="_blank" rel="noreferrer"
                        className="text-center text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline py-1">
                        View Evidence ↗
                      </a>
                    )}

                    {ob.status === 'PENDING_VERIFICATION' && (
                      <>
                        <button
                          onClick={() => handleVerifyCompliance(ob.id, true)}
                          className="btn-hover-effect py-1.5 bg-transparent text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold tracking-wider"
                        >
                          ✓ Approve
                        </button>
                        {rejectingId === ob.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              placeholder="Rejection reason..."
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              className="w-full px-2 py-1 text-[10px] rounded border border-red-300 dark:border-red-700 bg-white dark:bg-mine-800"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleVerifyCompliance(ob.id, false, rejectReason)}
                                className="btn-hover-effect-red flex-1 py-1 bg-transparent text-rose-700 dark:text-rose-400 rounded text-[9px] font-bold"
                              >
                                Confirm Reject
                              </button>
                              <button onClick={() => setRejectingId(null)} className="flex-1 py-1 text-[9px] text-neutral-500 hover:text-neutral-700 font-bold">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectingId(ob.id)}
                            className="btn-hover-effect-red py-1.5 bg-transparent text-rose-700 dark:text-rose-400 rounded-lg text-[10px] font-bold tracking-wider"
                          >
                            ✕ Reject
                          </button>
                        )}
                      </>
                    )}

                    {ob.status === 'COMPLIANT' && (
                      <span className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}

                    {/* Escalate button for OVERDUE / NON_COMPLIANT */}
                    {(ob.status === 'OVERDUE' || ob.status === 'NON_COMPLIANT') && (
                      escalatingId === ob.id ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Escalation reason..."
                            value={escalateReason}
                            onChange={e => setEscalateReason(e.target.value)}
                            className="w-full px-2 py-1 text-[10px] rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-mine-800"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEscalate(ob.id)}
                              className="flex-1 py-1 text-[9px] bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition"
                            >
                              Escalate
                            </button>
                            <button onClick={() => setEscalatingId(null)} className="flex-1 py-1 text-[9px] text-neutral-500 hover:text-neutral-700 font-bold">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEscalatingId(ob.id)}
                          className="py-1.5 px-2 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                        >
                          ⬆ Escalate to Management
                        </button>
                      )
                    )}

                    {/* Escalation badge if already escalated */}
                    {ob.escalations && ob.escalations.length > 0 && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-center">
                        Escalated ({ob.escalations.length})
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence notes if present */}
                {ob.evidenceNotes && ob.status !== 'NON_COMPLIANT' && (
                  <div className="text-[11px] italic text-neutral-500 dark:text-mine-400 px-1">
                    Evidence notes: "{ob.evidenceNotes}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
    );
  };



  const renderInspections = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 4. ACTIVE COMPLIANCE & RED-FLAGGED OPERATIONS (Live Feed) */}
        <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="text-rose-600" size={20} />
              Active Observations & Red-Flag Feed
            </h2>
            <span className="text-xs text-neutral-400">Live issues affecting contractor clearance</span>
          </div>

          <div className="space-y-3">
            {observations.length === 0 ? (
              <div className="text-center py-8 text-sm text-neutral-400">
                No active observations. All contractors are currently compliant!
              </div>
            ) : (
              observations.map((obs) => {
                const isResolved = obs.status === "RESOLVED";
                return (
                  <div
                    key={obs.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isResolved
                        ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                        : "bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40"
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${isResolved
                              ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200"
                              : "bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200"
                            }`}
                        >
                          {obs.severity} · {obs.category}
                        </span>
                        <span className="font-mono text-xs font-bold text-neutral-500 dark:text-mine-400">
                          {obs.observationCode}
                        </span>
                        <span className="text-xs font-semibold text-neutral-700 dark:text-mine-300">
                          — {obs.contractor?.name}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-mine-100">{obs.description}</p>
                      <div className="text-xs text-neutral-400">
                        Zone: {obs.zone} · Status:{" "}
                        <strong className={isResolved ? "text-emerald-600" : "text-rose-600"}>
                          {obs.status}
                        </strong>
                        {obs.evidenceNotes && (
                          <span className="ml-2 italic text-neutral-600 dark:text-mine-300">
                            (Remediation: "{obs.evidenceNotes}")
                          </span>
                        )}
                      </div>
                      {obs.photoUrl && (
                        <div className="mt-3">
                          <a href={`http://localhost:5001${obs.photoUrl}`} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={`http://localhost:5001${obs.photoUrl}`} 
                              alt="Field Evidence" 
                              className="h-20 w-20 object-cover rounded-lg border border-neutral-300 dark:border-mine-700 hover:opacity-80 transition"
                            />
                          </a>
                        </div>
                      )}
                    </div>

                    <div>
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold">
                          <CheckCircle2 size={14} /> Closed & Sealed
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyObservation(obs.id, true)}
                            className="btn-hover-effect-red px-3 py-1 text-[9px] font-bold rounded-lg bg-transparent text-emerald-700 dark:text-emerald-400 transition"
                          >
                            Approve Evidence & Clear Flag
                          </button>
                          <button
                            onClick={() => handleVerifyObservation(obs.id, false)}
                            className="btn-hover-effect-red px-3 py-1 text-[9px] font-bold rounded-lg bg-transparent text-rose-700 dark:text-rose-400 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      {/* 5. QUICK OBSERVATION LOGGER FORM */}
        <section
          ref={loggerRef}
          className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <HardHat className="text-amber-500" size={20} />
              Observation Logger (Legacy)
            </h2>
            <div className="flex gap-4">
               <button onClick={() => setIsInspectionModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-2">
                  <FileText size={16} /> New Field Inspection
               </button>
            </div>
          </div>

          {formSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleCreateObservation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-1">
                  Select Contractor
                </label>
                <select
                  value={selectedContractorId}
                  onChange={(e) => setSelectedContractorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800"
                  required
                >
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.contractorCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800"
                >
                  <option value="PPE">PPE Violation</option>
                  <option value="DUST">Dust / Air Quality</option>
                  <option value="EFFLUENT">Effluent / Water Spill</option>
                  <option value="EQUIPMENT">Machinery / Equipment Safety</option>
                  <option value="BLASTING">Blasting Safety Zone</option>
                  <option value="OTHER">Other Field Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-1">Zone</label>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="e.g. Pit A - Sector 3"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-2">Severity Level</label>
              <div className="flex gap-3">
                {["LOW", "MODERATE", "CRITICAL"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition border ${severity === lvl
                        ? lvl === "CRITICAL"
                          ? "bg-rose-600 text-white border-rose-600"
                          : lvl === "MODERATE"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-emerald-600 text-white border-emerald-600"
                        : "bg-neutral-100 dark:bg-mine-800 text-neutral-700 dark:text-mine-300 border-transparent"
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-1">
                Observation Remarks
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detail the safety hazard or non-compliance spotted on site..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-hover-effect-red w-full py-2 bg-transparent text-rose-700 dark:text-rose-400 text-[9px] font-bold rounded-xl shadow-xs transition"
            >
              {submitting ? "Logging Observation & Red-Flagging..." : "Submit Observation & Red-Flag Contractor"}
            </button>
          </form>
        </section>
    </div>
  );

  const renderContractors = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 3. CONTRACTORS DIRECTORY */}
        <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Contractors Directory (Live Database)</h2>
              <p className="text-xs text-neutral-500">Real-time status and unresolved issues from SQLite database</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractor or code..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-neutral-400 border-b border-neutral-100 dark:border-mine-800">
                <tr>
                  <th className="py-3 px-2">Contractor</th>
                  <th className="py-3 px-2">Task Type</th>
                  <th className="py-3 px-2">Risk Level</th>
                  <th className="py-3 px-2">Compliance Rate</th>
                  <th className="py-3 px-2">Unresolved Issues</th>
                  <th className="py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-mine-800">
                {filteredContractors.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/60 dark:hover:bg-mine-800/40 transition">
                    <td className="py-3 px-2 font-medium">
                      <div>{c.name}</div>
                      <div className="text-xs text-neutral-400 font-mono">{c.contractorCode}</div>
                    </td>
                    <td className="py-3 px-2 capitalize">
                      <span className="inline-flex items-center gap-1.5">
                        {c.taskType === "blasting" && <Bomb size={14} className="text-rose-500" />}
                        {c.taskType === "transportation" && <Truck size={14} className="text-blue-500" />}
                        {c.taskType === "excavation" && <Pickaxe size={14} className="text-amber-500" />}
                        {c.taskType}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.riskLevel === "CRITICAL"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                            : c.riskLevel === "MODERATE"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          }`}
                      >
                        {c.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-neutral-100 dark:bg-mine-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${c.complianceRate > 80 ? "bg-emerald-500" : c.complianceRate > 50 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                            style={{ width: `${c.complianceRate}%` }}
                          />
                        </div>
                        <span className="text-xs">{c.complianceRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-bold">{c.unresolvedObservationsCount ?? 0}</span>
                      {c.isRestricted && (
                        <span className="ml-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                          (Restricted)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => {
                          setSelectedContractorId(c.id);
                          loggerRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="btn-hover-effect inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-transparent text-mine-800 dark:text-mine-300"
                      >
                        <Plus size={12} /> Log Remark
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  );

  const renderReports = () => {
    const rpt = complianceReport?.summary;
    const domains = complianceReport?.domains || {};
    const domainNames = ["SAFETY", "ENVIRONMENT", "PRODUCTION", "LABOUR"];
    const domainColors: Record<string, string> = {
      SAFETY: "text-rose-600 dark:text-rose-400",
      ENVIRONMENT: "text-emerald-600 dark:text-emerald-400",
      PRODUCTION: "text-amber-600 dark:text-amber-400",
      LABOUR: "text-blue-600 dark:text-blue-400",
    };

    return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* ── COMPLIANCE REPORT SECTION ── */}
      <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileCheckIcon className="text-purple-600" size={20} />
              Compliance Report & Analytics
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Same source of truth as Overview dashboard — calculated from actual obligation records
            </p>
          </div>
          <button onClick={loadObligations} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-mine-700 bg-white dark:bg-mine-900 hover:bg-neutral-50 transition">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {!rpt ? (
          <div className="text-center py-8 text-neutral-400 text-sm">Loading compliance data...</div>
        ) : (
          <>
            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Obligations", value: rpt.total, color: "text-neutral-700 dark:text-mine-200" },
                { label: "Compliant", value: rpt.compliant, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Due Soon", value: rpt.dueSoon, color: "text-amber-600 dark:text-amber-400" },
                { label: "Overdue", value: rpt.overdue, color: "text-rose-600 dark:text-rose-400" },
                { label: "Non-Compliant", value: rpt.nonCompliant, color: "text-red-700 dark:text-red-400" },
                { label: "Pending Verify", value: rpt.pendingVerification, color: "text-blue-600 dark:text-blue-400" },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl bg-neutral-50 dark:bg-mine-800/60 border border-neutral-200 dark:border-mine-700 text-center">
                  <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Overall rate */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{rpt.overallCompliancePercentage}%</div>
              <div>
                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Overall Compliance Rate</div>
                <div className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                  Formula: (Compliant + Pending Verification) ÷ Total × 100 — identical to Overview dashboard
                </div>
              </div>
            </div>

            {/* Domain breakdown table */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Breakdown by Domain</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase text-neutral-400 border-b border-neutral-100 dark:border-mine-800">
                      <th className="py-2 px-2">Domain</th>
                      <th className="py-2 px-2">Total</th>
                      <th className="py-2 px-2">Compliant</th>
                      <th className="py-2 px-2">Due Soon</th>
                      <th className="py-2 px-2">Overdue</th>
                      <th className="py-2 px-2">Non-Compliant</th>
                      <th className="py-2 px-2">Pending Verify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-mine-800">
                    {domainNames.map(d => {
                      const row = domains[d] || {};
                      return (
                        <tr key={d} className="hover:bg-neutral-50/60 dark:hover:bg-mine-800/40 transition">
                          <td className={`py-2 px-2 font-bold ${domainColors[d]}`}>{d}</td>
                          <td className="py-2 px-2 font-semibold">{row.total ?? 0}</td>
                          <td className="py-2 px-2 text-emerald-600 dark:text-emerald-400 font-semibold">{row.compliant ?? 0}</td>
                          <td className="py-2 px-2 text-amber-600 dark:text-amber-400 font-semibold">{row.dueSoon ?? 0}</td>
                          <td className="py-2 px-2 text-rose-600 dark:text-rose-400 font-semibold">{row.overdue ?? 0}</td>
                          <td className="py-2 px-2 text-red-700 dark:text-red-400 font-semibold">{row.nonCompliant ?? 0}</td>
                          <td className="py-2 px-2 text-blue-600 dark:text-blue-400 font-semibold">{row.pendingVerification ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 6. USER AUTHENTICATION & REGISTRATION FILE LOG */}
        <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileCheck className="text-emerald-600" size={20} />
                User Authentication & Registration File Log (Live File Audit)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Live records read from: <code className="font-mono text-xs bg-neutral-100 dark:bg-mine-800 px-1.5 py-0.5 rounded">backend/logs/user_auth_records.json</code>
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              {authRecords.length} Events Logged to Disk
            </span>
          </div>

          <div className="space-y-2.5">
            {authRecords.length === 0 ? (
              <div className="text-center py-6 text-sm text-neutral-400">
                No user auth events recorded in file yet. Register or log in to see entries recorded to disk!
              </div>
            ) : (
              authRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-neutral-100 dark:border-mine-800 bg-neutral-50/70 dark:bg-mine-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-2 py-1 rounded uppercase tracking-wider ${rec.type === "REGISTRATION"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
                        }`}
                    >
                      {rec.type}
                    </span>
                    <div>
                      <span className="font-bold text-neutral-800 dark:text-white">
                        {rec.user?.name}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400 ml-1.5">
                        ({rec.user?.email})
                      </span>
                      {rec.user?.companyName && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-mine-700 font-semibold">
                          {rec.user?.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-400">
                    <span className="font-mono">Role: {rec.user?.role}</span>
                    <span>·</span>
                    <span className="font-mono">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
    </div>
    );
  };


return (
  <div className="min-h-screen bg-neutral-50 dark:bg-mine-950 transition-colors duration-300 flex font-sans text-neutral-900 dark:text-neutral-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-mine-950 border-r border-neutral-200 dark:border-mine-800 flex flex-col hidden lg:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-100 dark:border-mine-800 shadow-sm bg-white">
            <Image src="/logo.jpg" alt="MineSight" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-mine-950 dark:text-white">MineSight</span>
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-4 px-2 uppercase tracking-wider">Menu</p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === item.id
                    ? "bg-mine-700 text-white shadow-sm shadow-mine-700/20"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-mine-950 dark:hover:text-white hover:bg-mine-100/50 dark:hover:bg-mine-900/50"
                  }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 py-2 mt-auto pb-8">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-4 px-2 uppercase tracking-wider">General</p>
          <nav className="space-y-1.5">
            {generalItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === item.id
                    ? "bg-mine-700 text-white shadow-sm shadow-mine-700/20"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-mine-950 dark:hover:text-white hover:bg-mine-100/50 dark:hover:bg-mine-900/50"
                  }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-mine-800">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-mine-200"
            >
              <ArrowLeft size={16} /> Home
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
              Zone Coverage: Pit A · Haul Road · Zone B
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            North Jharia Colliery — Supervisor Portal
          </h1>
          <p className="text-sm text-neutral-500 dark:text-mine-400">
            Logged in as: <strong className="text-neutral-800 dark:text-mine-200">Inspector R. Verma</strong> (Senior Field Inspector)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-neutral-200 dark:border-mine-700 bg-white dark:bg-mine-900 hover:bg-neutral-100 dark:hover:bg-mine-800 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Live Data
          </button>
          <Link
            href="/contractor?task=blasting"
            className="px-4 py-2 text-sm font-bold text-white bg-neutral-900 dark:bg-mine-100 dark:text-mine-900 rounded-lg hover:opacity-90 transition"
          >
            Switch to Contractor View →
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-6 space-y-8">

          {backendError && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-600" />
              <div>
                <div className="font-bold">Backend API Connection Alert</div>
                <div className="text-sm">{backendError}</div>
              </div>
            </div>
            <button
              onClick={loadData}
              className="btn-hover-effect px-4 py-2 bg-transparent text-mine-900 dark:text-mine-100 rounded-lg text-xs font-bold transition"
            >
              Retry
            </button>
          </div>
        )}
          {activeTab === "overview" && renderOverview()}
          {activeTab === "risk" && renderRiskIntelligence()}
          {activeTab === "compliance" && renderCompliance()}
          {activeTab === "inspections" && renderInspections()}
          {activeTab === "contractors" && renderContractors()}
          {activeTab === "reports" && renderReports()}
        </main>
      </div>
      <FieldInspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        contractors={contractors}
        supervisorName={supervisorName}
      />
    </main>
  </div>
);
}
