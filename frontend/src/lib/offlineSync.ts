export const DB_NAME = "MineSight_OfflineDB";
export const DB_VERSION = 1;
export const STORE_NAME = "inspectionsQueue";

export interface QueuedInspection {
  clientRefId: string;
  payload: any;
  createdAt: number;
  status: "PENDING" | "FAILED";
  errorReason?: string;
  retryCount: number;
}

export function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "clientRefId" });
      }
    };
  });
}

export async function queueInspection(clientRefId: string, payload: any): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const item: QueuedInspection = {
      clientRefId,
      payload,
      createdAt: Date.now(),
      status: "PENDING",
      retryCount: 0,
    };
    
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getQueuedInspections(): Promise<QueuedInspection[]> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueuedInspection(clientRefId: string): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(clientRefId);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateQueuedInspectionStatus(clientRefId: string, status: "PENDING" | "FAILED", errorReason?: string): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(clientRefId);
    
    getRequest.onsuccess = () => {
      const item = getRequest.result as QueuedInspection;
      if (item) {
        item.status = status;
        item.errorReason = errorReason;
        item.retryCount = (item.retryCount || 0) + 1;
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function syncPendingInspections(): Promise<void> {
  if (!navigator.onLine) return;

  const queued = await getQueuedInspections();
  if (queued.length === 0) return;

  const { api } = await import("./api");
  const token = localStorage.getItem("minesight_auth_token") || undefined;

  for (const item of queued) {
    if (item.status === "FAILED" && item.errorReason) {
      // Don't auto-retry 4xx errors or specific validation failures.
      // We skip items marked FAILED because they need manual intervention.
      continue;
    }

    try {
      await api.createInspection(item.payload, token);
      await removeQueuedInspection(item.clientRefId);
    } catch (err: any) {
      console.warn("Background sync failed for", item.clientRefId, err);
      // Mark as FAILED so we don't spam the server on every page load
      await updateQueuedInspectionStatus(item.clientRefId, "FAILED", err.message);
    }
  }
}
