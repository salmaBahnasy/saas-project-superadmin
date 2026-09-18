import { clearPlatformSession, getPlatformToken } from "../auth/session";

const API_BASE = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function friendlyMessage(status, fallback, path = "") {
  if (status === 401) {
    if (path.includes("/auth/login")) return fallback || "Invalid credentials";
    return "Your Super Admin session expired. Please sign in again.";
  }
  if (status === 403) return "Access denied. A platform admin token is required.";
  if (status === 404) return "The requested company or integration was not found.";
  if (status === 409) return fallback || "This integration could not be configured.";
  if (status >= 500) return "The server ran into a problem. Try again in a moment.";
  return fallback || "Request failed.";
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  if (!API_BASE) {
    throw new ApiError("VITE_API_BASE_URL is not configured.");
  }

  const headers = { Accept: "application/json" };
  const auth = token || getPlatformToken();
  if (auth) headers.Authorization = `Bearer ${auth}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const isLogin = path.includes("/auth/login");
  if (response.status === 401 && !isLogin) {
    clearPlatformSession();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
  }

  if (!response.ok) {
    throw new ApiError(
      friendlyMessage(response.status, json?.message, path),
      {
        status: response.status,
        code: json?.code,
        details: json,
      },
    );
  }

  return json;
}

export function getApiBaseUrl() {
  return API_BASE;
}
