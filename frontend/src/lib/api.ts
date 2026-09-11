const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api/v1";

export async function fetchApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  let token = undefined;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("minesight_auth_token");
  }
  
  const headers: any = {
    ...options?.headers,
  };
  
  if (!(options?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || `Request failed with status ${res.status}`);
  }

  return json;
}

export const api = {
  // Auth & File Logging
  register: (data: any) =>
    fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: any) =>
    fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: (token?: string) => 
    fetchApi("/auth/logout", { 
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getMe: (token?: string) =>
    fetchApi("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  updateProfile: (data: any, token?: string) =>
    fetchApi("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  changePassword: (data: any, token?: string) =>
    fetchApi("/auth/password", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  exportData: (token?: string) =>
    fetchApi("/auth/export", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getAuthRecords: () => fetchApi("/auth/records"),

  // Health & Metrics
  getHealth: () => fetchApi("/health"),
  getMetricsOverview: () => fetchApi("/metrics/overview"),
  logEnvironmental: (data: any) =>
    fetchApi("/metrics/environmental", { method: "POST", body: JSON.stringify(data) }),

  // Contractors
  getContractors: (params?: { taskType?: string; riskLevel?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.taskType) query.append("taskType", params.taskType);
    if (params?.riskLevel) query.append("riskLevel", params.riskLevel);
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    return fetchApi(`/contractors${query.toString() ? `?${query}` : ""}`);
  },
  getContractor: (idOrCode: string) => fetchApi(`/contractors/${idOrCode}`),
  createContractor: (data: any) =>
    fetchApi("/contractors", { method: "POST", body: JSON.stringify(data) }),
  updateContractorStatus: (id: string, data: { status: "ACTIVE" | "REJECTED"; rejectionReason?: string }, token?: string) =>
    fetchApi(`/contractors/${id}/status`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    }),
  updateContractor: (id: string, data: any) =>
    fetchApi(`/contractors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  // Observations
  getObservations: (params?: { status?: string; contractorId?: string; severity?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/observations${query ? `?${query}` : ""}`);
  },
  getObservation: (id: string) => fetchApi(`/observations/${id}`),
  createObservation: (data: any) =>
    fetchApi("/observations", { method: "POST", body: JSON.stringify(data) }),
  submitEvidence: (id: string, data: { evidenceUrl?: string; evidenceNotes: string; correctiveAction?: string; submittedBy?: string }) =>
    fetchApi(`/observations/${id}/evidence`, { method: "PATCH", body: JSON.stringify(data) }),
  verifyObservation: (id: string, data: { verifiedBy: string; resolutionNotes?: string; isApproved?: boolean }) =>
    fetchApi(`/observations/${id}/verify`, { method: "PATCH", body: JSON.stringify(data) }),

  // Compliance
  getComplianceReport: () => fetchApi("/compliance/report"),
  getObligations: (params?: { contractorId?: string; domain?: string; status?: string; taskType?: string }) => {
    const filtered: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v) filtered[k] = v; });
    }
    const query = new URLSearchParams(filtered).toString();
    return fetchApi(`/compliance${query ? `?${query}` : ""}`);
  },
  createObligation: (data: any, token?: string) =>
    fetchApi("/compliance", {
      method: "POST",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  submitComplianceEvidence: (id: string, data: { evidenceUrl?: string; evidenceNotes?: string; submittedBy?: string }, token?: string) =>
    fetchApi(`/compliance/${id}/evidence`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  verifyCompliance: (id: string, data: { verifiedBy: string; approved: boolean; notes?: string }, token?: string) =>
    fetchApi(`/compliance/${id}/verify`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  escalateObligation: (id: string, data: { reason: string; level?: string }, token?: string) =>
    fetchApi(`/compliance/${id}/escalate`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getObligationAuditLog: (id: string) => fetchApi(`/compliance/${id}/audit`),
  
  // Risk Intelligence
  getRiskOverview: (token?: string) =>
    fetchApi("/risk/overview", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getRiskContractors: (token?: string) =>
    fetchApi("/risk/contractors", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getContractorRisk: (id: string, token?: string) =>
    fetchApi(`/risk/contractors/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),

  // Inspections (Issue #3)
  createInspection: (data: any, token?: string) =>
    fetchApi("/inspections", {
      method: "POST",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getInspections: (params?: { inspectorId?: string; contractorId?: string }, token?: string) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/inspections${query ? `?${query}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // Notifications
  getNotifications: (token?: string) =>
    fetchApi("/notifications", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getUnreadNotificationCount: (token?: string) =>
    fetchApi("/notifications/unread-count", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  markNotificationRead: (id: string, token?: string) =>
    fetchApi(`/notifications/${id}/read`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  markAllNotificationsRead: (token?: string) =>
    fetchApi("/notifications/mark-all-read", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),

  // Resources
  getLicenses: (token?: string) =>
    fetchApi("/licenses", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getMachinery: (token?: string) =>
    fetchApi("/machinery", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getWorkers: (token?: string) =>
    fetchApi("/workers", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getExplosives: (token?: string) =>
    fetchApi("/explosives", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
    
  // Daily Logs
  getDailyLogs: (token?: string) =>
    fetchApi("/daily-logs", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  createDailyLog: (data: any, token?: string) =>
    fetchApi("/daily-logs", {
      method: "POST",
      body: JSON.stringify(data),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  
  // Environmental Document Intelligence
  analyzeDocument: (formData: FormData, token?: string) =>
    fetchApi("/environmental-documents/analyze", {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  confirmDocument: (data: { extractedData: string }, formData: FormData, token?: string) => {
    formData.append("extractedData", data.extractedData);
    return fetchApi("/environmental-documents/confirm", {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // AI Governance Analysis
  analyzeGovernance: (contractorId: string, token?: string) =>
    fetchApi("/governance/analyze", {
      method: "POST",
      body: JSON.stringify({ contractorId }),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
};

