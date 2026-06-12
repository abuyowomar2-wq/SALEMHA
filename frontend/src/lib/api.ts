const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

async function request<T>(endpoint: string, options: {
  method?: string;
  body?: any;
  token?: string;
} = {}): Promise<T> {
  const { token, method = "GET", body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const err: any = new Error(data.message || "حدث خطأ");
    err.status = res.status;
    err.errors = data.errors;
    throw err;
  }

  return data;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sallemha_token");
}

export function setToken(token: string) {
  localStorage.setItem("sallemha_token", token);
  document.cookie = `sallemha_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
}

export function removeToken() {
  localStorage.removeItem("sallemha_token");
  document.cookie = "sallemha_token=; path=/; max-age=0";
}

export function getUser(): any | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("sallemha_user");
  return user ? JSON.parse(user) : null;
}

export function setUser(user: any) {
  localStorage.setItem("sallemha_user", JSON.stringify(user));
  document.cookie = `sallemha_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
}

export function removeUser() {
  localStorage.removeItem("sallemha_user");
  document.cookie = "sallemha_user=; path=/; max-age=0";
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, { method: "POST", body, token }),

  put: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, { method: "PUT", body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE", token }),
};
