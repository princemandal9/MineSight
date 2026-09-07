"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Plus, Trash2, CheckCircle2, Camera } from "lucide-react";
import { queueInspection } from "@/lib/offlineSync";

export function FieldInspectionModal({
  isOpen,
  onClose,
  contractors,
  supervisorName,
}: {
  isOpen: boolean;
  onClose: () => void;
  contractors: any[];
  supervisorName: string;
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [formData, setFormData] = useState({
    zone: "",
    taskType: "ROUTINE",
    contractorId: "",
    latitude: null as number | null,
    longitude: null as number | null,
    locationAccuracy: null as number | null,
    startedAt: new Date(),
    observations: [] as {
      id: string;
      contractorId: string;
      category: string;
      severity: string;
      description: string;
      photoBase64?: string | null;
      photoPreview?: string | null;
    }[],
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        zone: "",
        taskType: "ROUTINE",
        contractorId: contractors[0]?.id || "",
        latitude: null,
        longitude: null,
        locationAccuracy: null,
        startedAt: new Date(),
        observations: [],
      });
      setLocationError("");
    }
  }, [isOpen, contractors]);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationAccuracy: position.coords.accuracy,
        }));
        setLocationError("");
      },
      (error) => {
        setLocationError(error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleAddObservation = () => {
    setFormData((prev) => ({
      ...prev,
      observations: [
        ...prev.observations,
        {
          id: Date.now().toString(),
          contractorId: prev.contractorId, // default to inspection level contractor
          category: "PPE",
          severity: "MODERATE",
          description: "",
          photoBase64: null,
          photoPreview: null,
        },
      ],
    }));
  };

  const handleUpdateObservation = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      observations: prev.observations.map((obs) =>
        obs.id === id ? { ...obs, [field]: value } : obs
      ),
    }));
  };

  const handlePhotoCapture = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        observations: prev.observations.map((obs) =>
          obs.id === id ? { ...obs, photoBase64: base64, photoPreview: base64 } : obs
        ),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      observations: prev.observations.map((obs) =>
        obs.id === id ? { ...obs, photoBase64: null, photoPreview: null } : obs
      ),
    }));
  };

  const handleRemoveObservation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      observations: prev.observations.filter((obs) => obs.id !== id),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (formData.observations.length === 0) {
      alert("Please add at least one observation before submitting.");
      return;
    }
    const missingContractor = formData.observations.some(obs => !obs.contractorId);
    if (missingContractor) {
      alert("Please assign a contractor to all observations.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        clientRefId: `ins-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inspectorId: supervisorName,
        zone: formData.zone,
        contractorId: formData.contractorId || undefined,
        taskType: formData.taskType,
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationAccuracy: formData.locationAccuracy,
        startedAt: formData.startedAt,
        observations: formData.observations,
      };

      // 1. Save to Offline DB immediately
      await queueInspection(payload.clientRefId, payload);

      // 2. Try to sync if online
      if (navigator.onLine) {
        try {
          const { api } = await import("@/lib/api");
          const token = localStorage.getItem("minesight_auth_token") || undefined;
          await api.createInspection(payload, token);
          
          // Remove from queue since it succeeded
          const { removeQueuedInspection } = await import("@/lib/offlineSync");
          await removeQueuedInspection(payload.clientRefId);
        } catch (err: any) {
          // If the server rejected it (400/500), we should surface the error
          console.warn("API Error during online submission:", err);
          
          // Mark the queued item as failed
          const { updateQueuedInspectionStatus } = await import("@/lib/offlineSync");
          await updateQueuedInspectionStatus(payload.clientRefId, "FAILED", err.message);
          
          alert(`Submission failed: ${err.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      onClose();
      // Inform the user
      alert("Inspection saved successfully!");
      
      // Trigger a sync of pending items and reload
      const { syncPendingInspections } = await import("@/lib/offlineSync");
      await syncPendingInspections();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to save inspection locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-mine-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 dark:border-mine-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-neutral-100 dark:border-mine-800 flex justify-between items-center bg-neutral-50 dark:bg-mine-950/50">
          <div>
            <h2 className="text-xl font-black text-mine-950 dark:text-white flex items-center gap-2">
              Start Field Inspection
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded dark:bg-blue-900/40 dark:text-blue-300">
                OFFLINE READY
              </span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Capture GPS, time, and multiple observations seamlessly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-mine-950 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-mine-100 mb-3 uppercase tracking-wider">
                  1. Context & Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-1">
                      Zone / Area
                    </label>
                    <input
                      type="text"
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800"
                      placeholder="e.g. Haul Road B"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-1">
                      Task Type
                    </label>
                    <select
                      value={formData.taskType}
                      onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800"
                    >
                      <option value="ROUTINE">Routine Patrol</option>
                      <option value="TARGETED">Targeted Audit</option>
                      <option value="INCIDENT">Incident Follow-up</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-600 dark:text-mine-400 mb-1">
                      Primary Contractor (Optional)
                    </label>
                    <select
                      value={formData.contractorId}
                      onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-mine-700 bg-neutral-50 dark:bg-mine-800"
                    >
                      <option value="">-- Mine-wide (No specific contractor) --</option>
                      {contractors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    GPS Coordinates
                  </div>
                  {formData.latitude ? (
                    <div className="text-xs text-blue-700 dark:text-blue-400 mt-1 font-mono">
                      {formData.latitude.toFixed(6)}, {formData.longitude?.toFixed(6)}{" "}
                      (±{Math.round(formData.locationAccuracy || 0)}m)
                    </div>
                  ) : (
                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                      Not captured yet
                    </div>
                  )}
                  {locationError && (
                    <div className="text-xs text-rose-500 mt-1">{locationError}</div>
                  )}
                </div>
                <button
                  onClick={handleGetLocation}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  <MapPin size={14} /> Capture Location
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-mine-100 uppercase tracking-wider">
                  2. Record Observations
                </h3>
                <button
                  onClick={handleAddObservation}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <Plus size={14} /> Add Observation
                </button>
              </div>

              {formData.observations.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-neutral-200 dark:border-mine-800 rounded-xl text-neutral-500">
                  <p className="text-sm">No observations recorded yet.</p>
                  <button
                    onClick={handleAddObservation}
                    className="mt-3 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-mine-950 text-xs font-bold rounded-lg"
                  >
                    Add First Observation
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.observations.map((obs, idx) => (
                    <div
                      key={obs.id}
                      className="p-4 border border-neutral-200 dark:border-mine-700 rounded-xl bg-neutral-50 dark:bg-mine-800/30 space-y-3 relative"
                    >
                      <button
                        onClick={() => handleRemoveObservation(obs.id)}
                        className="absolute top-3 right-3 text-neutral-400 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                      <h4 className="text-xs font-bold uppercase text-neutral-500">
                        Observation #{idx + 1}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={obs.category}
                          onChange={(e) =>
                            handleUpdateObservation(obs.id, "category", e.target.value)
                          }
                          className="px-2 py-1.5 text-xs rounded border border-neutral-200 dark:border-mine-700 bg-white dark:bg-mine-900"
                        >
                          <option value="PPE">PPE Violation</option>
                          <option value="DUST">Dust / Air Quality</option>
                          <option value="EFFLUENT">Effluent / Water Spill</option>
                          <option value="EQUIPMENT">Machinery / Equipment Safety</option>
                          <option value="BLASTING">Blasting Safety Zone</option>
                          <option value="OTHER">Other Field Hazard</option>
                        </select>
                        <select
                          value={obs.severity}
                          onChange={(e) =>
                            handleUpdateObservation(obs.id, "severity", e.target.value)
                          }
                          className="px-2 py-1.5 text-xs rounded border border-neutral-200 dark:border-mine-700 bg-white dark:bg-mine-900"
                        >
                          <option value="LOW">Low Severity</option>
                          <option value="MODERATE">Moderate</option>
                          <option value="CRITICAL">Critical Flag</option>
                        </select>
                      </div>
                      <select
                        value={obs.contractorId}
                        onChange={(e) =>
                          handleUpdateObservation(obs.id, "contractorId", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-xs rounded border border-neutral-200 dark:border-mine-700 bg-white dark:bg-mine-900"
                      >
                        <option value="">-- Assign Contractor --</option>
                        {contractors.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={obs.description}
                        onChange={(e) =>
                          handleUpdateObservation(obs.id, "description", e.target.value)
                        }
                        placeholder="Describe the issue..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs rounded border border-neutral-200 dark:border-mine-700 bg-white dark:bg-mine-900 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                      
                      {/* Photo Capture Section */}
                      <div className="pt-2 border-t border-neutral-200 dark:border-mine-700">
                        {obs.photoPreview ? (
                          <div className="relative inline-block mt-2">
                            <img src={obs.photoPreview} alt="Evidence preview" className="w-24 h-24 object-cover rounded-lg border border-neutral-200 dark:border-mine-600" />
                            <button
                              onClick={() => handleRemovePhoto(obs.id)}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition"
                            >
                              <X size={12} />
                            </button>
                            <div className="text-[10px] text-neutral-500 mt-1">Photo Attached</div>
                          </div>
                        ) : (
                          <div className="flex items-center mt-2">
                            <label className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-neutral-300 dark:border-mine-700 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition group">
                              <Camera size={16} className="text-neutral-400 group-hover:text-purple-500" />
                              <span className="text-xs font-semibold text-neutral-500 group-hover:text-purple-600 dark:text-mine-400 dark:group-hover:text-purple-400">Add Field Photo</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                className="hidden" 
                                onChange={(e) => handlePhotoCapture(obs.id, e)}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-mine-100 uppercase tracking-wider text-center">
                3. Final Review
              </h3>
              <div className="p-4 bg-neutral-50 dark:bg-mine-800/50 border border-neutral-200 dark:border-mine-700 rounded-xl space-y-3 text-sm">
                <p>
                  <strong>Zone:</strong> {formData.zone || "Not specified"}
                </p>
                <p>
                  <strong>GPS:</strong> {formData.latitude?.toFixed(4)},{" "}
                  {formData.longitude?.toFixed(4)}
                </p>
                <p>
                  <strong>Observations:</strong> {formData.observations.length} recorded
                </p>
              </div>
              <p className="text-xs text-center text-neutral-500">
                This inspection will be saved to your local offline queue and synchronized with the
                server automatically.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-100 dark:border-mine-800 flex justify-between bg-neutral-50 dark:bg-mine-950/50">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || isSubmitting}
            className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 text-sm font-bold bg-neutral-900 dark:bg-white text-white dark:text-mine-950 rounded-lg hover:opacity-90 transition"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? "Saving..." : "Submit Inspection"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
