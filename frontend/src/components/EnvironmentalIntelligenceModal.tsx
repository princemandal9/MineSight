import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle2, FileText, AlertTriangle, FileCheck, X, File, RefreshCw, Clock } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

interface EnvironmentalIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ANALYZE_TIMEOUT_MS = 65_000; // 65 seconds — matches backend

export function EnvironmentalIntelligenceModal({ isOpen, onClose, onSuccess }: EnvironmentalIntelligenceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"UPLOAD" | "ANALYZING" | "REVIEW">("UPLOAD");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [resultType, setResultType] = useState<"LIVE" | "CACHED" | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<string>("Analyzing environmental report...");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = () => {
    setFile(null);
    setStep("UPLOAD");
    setExtractedData(null);
    setResultType(null);
    setUsedFallback(false);
    setError(null);
    setErrorCode(null);
    setIsSaving(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setErrorCode(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStep("ANALYZING");
    setError(null);
    setErrorCode(null);
    setAnalyzeStatus("Analyzing environmental report...");

    const formData = new FormData();
    formData.append("document", file);

    // Set up timeout abort
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, ANALYZE_TIMEOUT_MS);

    // Show fallback message after 20s if still analyzing
    const fallbackMessageId = setTimeout(() => {
      setAnalyzeStatus("Primary AI service is busy. Trying backup model...");
    }, 20_000);

    try {
      const token = auth.getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await api.analyzeDocument(formData, token);

      clearTimeout(timeoutId);
      clearTimeout(fallbackMessageId);

      if (res.success && res.data) {
        setExtractedData(res.data);
        setResultType(res.resultType || "LIVE");
        setUsedFallback(res.usedFallback || false);
        setStep("REVIEW");
      } else {
        // Controlled backend failure (503 with JSON body)
        const code = res.code || "AI_PROVIDER_UNAVAILABLE";
        const msg = res.message || "AI analysis failed. Please retry.";
        setErrorCode(code);
        setError(msg);
        setStep("UPLOAD");
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      clearTimeout(fallbackMessageId);

      if (e.name === "AbortError" || (e.message && e.message.includes("aborted"))) {
        setError("AI analysis timed out after 65 seconds. Please retry.");
        setErrorCode("AI_PROVIDER_TIMEOUT");
      } else {
        setError(e.message || "An unexpected error occurred during analysis.");
      }
      setStep("UPLOAD");
    }
  };

  const handleConfirm = async () => {
    if (!file || !extractedData) return;
    setIsSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const token = auth.getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await api.confirmDocument({ extractedData: JSON.stringify(extractedData) }, formData, token);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(res.message || res.error || "Failed to save document");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mine-950/40 dark:bg-mine-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-mine-950 w-full max-w-3xl rounded-2xl shadow-xl border border-neutral-200 dark:border-mine-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-mine-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <FileCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-mine-950 dark:text-white">Environmental Intelligence</h2>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">AI-powered document extraction</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">{error}</div>
                {errorCode && (
                  <div className="text-xs mt-1 opacity-70">
                    {errorCode === "AI_PROVIDER_UNAVAILABLE" || errorCode === "AI_PROVIDER_TIMEOUT"
                      ? "This is a temporary issue. Please wait a moment and try again."
                      : null}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "UPLOAD" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="w-full max-w-md p-10 border-2 border-dashed border-neutral-200 dark:border-mine-800 rounded-2xl flex flex-col items-center justify-center bg-neutral-50/50 dark:bg-mine-900/20 hover:bg-neutral-50 dark:hover:bg-mine-900/40 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <File className="w-12 h-12 text-teal-500 mb-4" />
                    <p className="text-sm font-bold text-mine-900 dark:text-white mb-1">{file.name}</p>
                    <p className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-4 text-xs font-semibold text-red-500 hover:text-red-600">
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center text-neutral-500 dark:text-neutral-400">
                    <UploadCloud className="w-12 h-12 text-neutral-400 mb-4" />
                    <p className="text-sm font-bold text-mine-900 dark:text-white mb-1">Click to upload report</p>
                    <p className="text-xs">PDF, PNG, JPG (Max 10MB)</p>
                  </div>
                )}
              </div>

              {file && (
                <button
                  onClick={handleAnalyze}
                  className="mt-8 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20"
                >
                  <RefreshCw size={18} />
                  Analyze with SightAI
                </button>
              )}
            </div>
          )}

          {step === "ANALYZING" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-lg font-bold text-mine-900 dark:text-white mb-2">{analyzeStatus}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">Extracting structured measurements and traceability context. This may take up to 60 seconds.</p>
            </div>
          )}

          {step === "REVIEW" && extractedData && (
            <div className="space-y-6">
              {/* Result type badge */}
              {resultType === "LIVE" && (
                <div className={clsx(
                  "p-3 rounded-xl flex items-center gap-3 border text-sm font-semibold",
                  usedFallback
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                    : "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                )}>
                  <CheckCircle2 size={18} className="shrink-0" />
                  {usedFallback
                    ? "AI Analysis Complete — Backup Model Used"
                    : "AI Analysis — Live"}
                </div>
              )}

              {resultType === "CACHED" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3 text-blue-700 dark:text-blue-300">
                  <Clock size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">AI Analysis — Cached Previous Result</p>
                    <p className="text-xs mt-1 opacity-90">Live AI service is temporarily unavailable. Showing the previously verified AI extraction for this exact document. Human review and confirmation are still required before saving.</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-300">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">AI-extracted data — verify before saving</p>
                  <p className="text-xs mt-1 opacity-90">The MineSight governance engine remains authoritative and will calculate risk metrics deterministically based on these values after confirmation.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-mine-900/40 border border-neutral-100 dark:border-mine-800">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Document Type</p>
                  <p className="text-sm font-bold text-mine-900 dark:text-white">{extractedData.document?.documentType || "Unknown"}</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-mine-900/40 border border-neutral-100 dark:border-mine-800">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Sampling Date</p>
                  <p className="text-sm font-bold text-mine-900 dark:text-white">{extractedData.document?.samplingDate ? new Date(extractedData.document.samplingDate).toLocaleDateString() : "Unknown"}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-mine-900 dark:text-white mb-3">Extracted Measurements</h4>
                <div className="border border-neutral-200 dark:border-mine-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 dark:bg-mine-900 border-b border-neutral-200 dark:border-mine-800 text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 py-3">Site / Location</th>
                        <th className="px-4 py-3">Parameter</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Limit</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Traceability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-mine-800">
                      {extractedData.measurements?.map((m: any, i: number) => (
                        <tr key={i} className="bg-white dark:bg-mine-950">
                          <td className="px-4 py-3 text-mine-900 dark:text-white font-medium">
                            {m.siteId && <span className="font-bold mr-1">{m.siteId}</span>}
                            {m.siteId && m.siteName && <span>&middot;</span>}
                            {m.siteName && <span className="ml-1">{m.siteName}</span>}
                            {!m.siteId && !m.siteName && <span className="text-neutral-400 italic">{m.location || "Unknown"}</span>}
                          </td>
                          <td className="px-4 py-3 font-semibold text-mine-900 dark:text-white">{m.parameter}</td>
                          <td className="px-4 py-3 text-mine-700 dark:text-neutral-300">
                            {m.value !== null ? m.value : "-"}{m.unit ? ` ${m.unit}` : ""}
                          </td>
                          <td className="px-4 py-3 text-neutral-500">
                            {m.regulatoryLimit !== null ? m.regulatoryLimit : "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={clsx(
                              "px-2 py-1 text-[10px] font-bold rounded-md",
                              m.status === "PASS" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                m.status === "FAIL" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                  "bg-neutral-100 text-neutral-600 dark:bg-mine-800 dark:text-neutral-400"
                            )}>
                              {m.status || "UNKNOWN"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {m.source?.page && <span className="text-[10px] bg-neutral-100 dark:bg-mine-800 px-2 py-1 rounded font-medium text-neutral-600 dark:text-neutral-400 mr-2">Pg {m.source.page}</span>}
                            {m.source?.text && <span className="text-xs text-neutral-400 line-clamp-1 hover:line-clamp-none" title={m.source.text}>"{m.source.text}"</span>}
                          </td>
                        </tr>
                      ))}
                      {(!extractedData.measurements || extractedData.measurements.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No measurements extracted.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {extractedData.warnings?.length > 0 && (
                <div className="p-4 bg-neutral-50 dark:bg-mine-900/20 border border-neutral-200 dark:border-mine-800 rounded-xl">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Extraction Notes</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {extractedData.warnings.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-neutral-600 dark:text-neutral-400">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {step === "REVIEW" && (
          <div className="p-6 border-t border-neutral-100 dark:border-mine-800 bg-neutral-50 dark:bg-mine-900/20 flex justify-between rounded-b-2xl">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-mine-800 transition-colors"
              disabled={isSaving}
            >
              Discard & Restart
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Confirm & Save"}
              {!isSaving && <CheckCircle2 size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
