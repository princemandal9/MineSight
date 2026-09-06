"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  HardHat,
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
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/api";

export default function SupervisorPage() {
  const [metrics, setMetrics] = useState<any>(null);
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
    try {
      setLoading(true);
      setBackendError(null);

      const [metricsRes, contractorsRes, observationsRes, authRes] = await Promise.all([
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
      ]);

      setMetrics(metricsRes.data);
      setContractors(contractorsRes.data || []);
      setObservations(observationsRes.data || []);
      setAuthRecords(authRes?.data || []);
      setStorageFiles(authRes?.storageFiles || null);

      if (contractorsRes.data?.length > 0 && !selectedContractorId) {
        setSelectedContractorId(contractorsRes.data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load backend data:", err);
      setBackendError(
        "Could not connect to Backend API at http://localhost:5000/api/v1. Make sure 'npm run dev' is running in the backend folder."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Verify and Clear Flag
  const handleVerifyObservation = async (observationId: string) => {
    try {
      await api.verifyObservation(observationId, {
        verifiedBy: "Inspector R. Verma",
        resolutionNotes: "Physical on-site inspection passed. Safety compliance restored.",
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
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
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Logged in as: <strong className="text-slate-800 dark:text-zinc-200">Inspector R. Verma</strong> (Senior Field Inspector)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Live Data
          </button>
          <Link
            href="/contractor?task=blasting"
            className="px-4 py-2 text-sm font-bold text-white bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-90 transition"
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
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. TOP METRICS BAR (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Active Contractors Onsite
            </div>
            <div className="text-3xl font-black mt-2 text-slate-900 dark:text-zinc-50">
              {top.totalActiveContractors}
            </div>
            <div className="text-xs text-slate-400 mt-1">Full shift deployments across 3 zones</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-rose-500 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Critical Open Observations
            </div>
            <div className="text-3xl font-black mt-2 text-rose-600 dark:text-rose-400">
              {top.criticalOpenObservations}
            </div>
            <div className="text-xs text-slate-400 mt-1">Requires immediate contractor proof</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-emerald-500 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Overall Compliance Rate
            </div>
            <div className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
              {top.overallComplianceRate}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Aggregated across all active licenses & machinery</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 border-l-4 border-l-amber-500 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Mine Environmental Risk
            </div>
            <div className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">
              {top.mineEnvironmentalRiskPercentage}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Deterministic sensor score (Low - Moderate)</div>
          </div>
        </section>

        {/* 2. ENVIRONMENTAL & YIELD LOG */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              Daily Yield & Environmental Sensors
            </h2>
            <span className="text-xs text-slate-500">Auto-synced with latest statutory telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
              <div className="text-xs text-slate-500 dark:text-zinc-400">Daily Coal Output</div>
              <div className="text-2xl font-bold mt-1">{env.dailyTonnage} Tonnes</div>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                On Target (1,400 T)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
              <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Wind size={14} /> Air Quality (PM10 Dust)
              </div>
              <div className="text-2xl font-bold mt-1">{env.pm10Dust.value} µg/m³</div>
              <span
                className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded ${
                  env.pm10Dust.isAboveLimit
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                }`}
              >
                {env.pm10Dust.isAboveLimit ? "Above Limit (100)" : "Below Safety Limit (100)"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
              <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Droplet size={14} /> Effluent / Water pH
              </div>
              <div className="text-2xl font-bold mt-1">{env.effluentPh.value} pH</div>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Safe Range (6.5 - 8.5)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
              <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Volume2 size={14} /> Pit Noise Level
              </div>
              <div className="text-2xl font-bold mt-1">{env.noiseLevel.value} dB</div>
              <span className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Below Safety Limit (85)
              </span>
            </div>
          </div>
        </section>

        {/* 3. CONTRACTORS DIRECTORY */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Contractors Directory (Live Database)</h2>
              <p className="text-xs text-slate-500">Real-time status and unresolved issues from SQLite database</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractor or code..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-2">Contractor</th>
                  <th className="py-3 px-2">Task Type</th>
                  <th className="py-3 px-2">Risk Level</th>
                  <th className="py-3 px-2">Compliance Rate</th>
                  <th className="py-3 px-2">Unresolved Issues</th>
                  <th className="py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredContractors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-2 font-medium">
                      <div>{c.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{c.contractorCode}</div>
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
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          c.riskLevel === "CRITICAL"
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
                        <div className="w-16 bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              c.complianceRate > 80 ? "bg-emerald-500" : c.complianceRate > 50 ? "bg-amber-500" : "bg-rose-500"
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition"
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

        {/* 4. ACTIVE COMPLIANCE & RED-FLAGGED OPERATIONS (Live Feed) */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="text-rose-600" size={20} />
              Active Observations & Red-Flag Feed
            </h2>
            <span className="text-xs text-slate-400">Live issues affecting contractor clearance</span>
          </div>

          <div className="space-y-3">
            {observations.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No active observations. All contractors are currently compliant!
              </div>
            ) : (
              observations.map((obs) => {
                const isResolved = obs.status === "RESOLVED";
                return (
                  <div
                    key={obs.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isResolved
                        ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                        : "bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isResolved
                              ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200"
                              : "bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200"
                          }`}
                        >
                          {obs.severity} · {obs.category}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-zinc-400">
                          {obs.observationCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          — {obs.contractor?.name}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{obs.description}</p>
                      <div className="text-xs text-slate-400">
                        Zone: {obs.zone} · Status:{" "}
                        <strong className={isResolved ? "text-emerald-600" : "text-rose-600"}>
                          {obs.status}
                        </strong>
                        {obs.evidenceNotes && (
                          <span className="ml-2 italic text-slate-600 dark:text-zinc-300">
                            (Remediation: "{obs.evidenceNotes}")
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold">
                          <CheckCircle2 size={14} /> Closed & Sealed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerifyObservation(obs.id)}
                          className="px-3.5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
                        >
                          Review Evidence & Clear Flag
                        </button>
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
          className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <HardHat className="text-amber-500" size={20} />
              Quick Observation Logger ("Report Issue")
            </h2>
            <span className="text-xs text-slate-400">Submitting will immediately red-flag the contractor</span>
          </div>

          {formSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleCreateObservation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Select Contractor
                </label>
                <select
                  value={selectedContractorId}
                  onChange={(e) => setSelectedContractorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
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
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
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
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Zone</label>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="e.g. Pit A - Sector 3"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2">Severity Level</label>
              <div className="flex gap-3">
                {["LOW", "MODERATE", "CRITICAL"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition border ${
                      severity === lvl
                        ? lvl === "CRITICAL"
                          ? "bg-rose-600 text-white border-rose-600"
                          : lvl === "MODERATE"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-transparent"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                Observation Remarks
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detail the safety hazard or non-compliance spotted on site..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition"
            >
              {submitting ? "Logging Observation & Red-Flagging..." : "Submit Observation & Red-Flag Contractor"}
            </button>
          </form>
        </section>

        {/* 6. USER AUTHENTICATION & REGISTRATION FILE LOG */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileCheck className="text-emerald-600" size={20} />
                User Authentication & Registration File Log (Live File Audit)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live records read from: <code className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">backend/logs/user_auth_records.json</code>
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              {authRecords.length} Events Logged to Disk
            </span>
          </div>

          <div className="space-y-2.5">
            {authRecords.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                No user auth events recorded in file yet. Register or log in to see entries recorded to disk!
              </div>
            ) : (
              authRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-2 py-1 rounded uppercase tracking-wider ${
                        rec.type === "REGISTRATION"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
                      }`}
                    >
                      {rec.type}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {rec.user?.name}
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400 ml-1.5">
                        ({rec.user?.email})
                      </span>
                      {rec.user?.companyName && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-700 font-semibold">
                          {rec.user?.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="font-mono">Role: {rec.user?.role}</span>
                    <span>·</span>
                    <span className="font-mono">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

