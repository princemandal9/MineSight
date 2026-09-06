export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "CONTRACTOR" | "SUPERVISOR";
  companyName?: string | null;
  taskType?: string | null;
  contractorId?: string | null;
}

const TOKEN_KEY = "minesight_auth_token";
const USER_KEY = "minesight_auth_user";

export const auth = {
  setSession(user: UserSession, token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user.taskType) {
      localStorage.setItem("contractorTask", user.taskType);
    }
  },

  getUser(): UserSession | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

