const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function fetchApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
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
  getMe: (token?: string) =>
    fetchApi("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  getAuthRecords: () => fetchApi("/auth/records"),

  // Health & Metrics
  getHealth: () => fetchApi("/health"),
  getMetricsOverview: () => fetchApi("/metrics/overview"),
  logEnvironmental: (data: any) =>
    fetchApi("/metrics/environmental", { method: "POST", body: JSON.stringify(data) }),

  // Contractors
  getContractors: (params?: { taskType?: string; riskLevel?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi(`/contractors${query ? `?${query}` : ""}`);
  },
  getContractor: (idOrCode: string) => fetchApi(`/contractors/${idOrCode}`),
  createContractor: (data: any) =>
    fetchApi("/contractors", { method: "POST", body: JSON.stringify(data) }),
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
  submitEvidence: (id: string, data: { evidenceUrl?: string; evidenceNotes: string; submittedBy?: string }) =>
    fetchApi(`/observations/${id}/evidence`, { method: "PATCH", body: JSON.stringify(data) }),
  verifyObservation: (id: string, data: { verifiedBy: string; resolutionNotes?: string }) =>
    fetchApi(`/observations/${id}/verify`, { method: "PATCH", body: JSON.stringify(data) }),
};

