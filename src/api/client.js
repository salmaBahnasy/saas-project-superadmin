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

const PROVIDER_AUTH_CODES = new Set([
  "SHOPIFY_CREDENTIALS_INVALID",
  "SHOPIFY_SHOP_DOMAIN_MISMATCH",
  "SHOPIFY_WEBHOOK_SECRET_MISSING",
  "SHOPIFY_WEBHOOK_HMAC_INVALID",
  "SALLA_AUTHORIZATION_REVOKED",
  "SALLA_CREDENTIALS_INVALID",
  "SALLA_OAUTH_TOKEN_INVALID",
  "WEBHOOK_UNAUTHORIZED",
]);

function friendlyMessage(status, fallback, path = "", code = "") {
  if (status === 401) {
    if (path.includes("/auth/login")) return fallback || "Invalid credentials";
    if (PROVIDER_AUTH_CODES.has(code)) {
      return fallback || "Shopify credentials are invalid or revoked.";
    }
    return "Your Super Admin session expired. Please sign in again.";
  }
  if (status === 403) return "Access denied. A platform admin token is required.";
  if (status === 404) return "The requested company or integration was not found.";
  if (status === 409) return fallback || "This integration could not be configured.";
  if (status === 502 || status === 503) {
    if (String(code || "").startsWith("SALLA_")) {
      return fallback || "Salla is temporarily unavailable. Try again shortly.";
    }
    return fallback || "Shopify is temporarily unavailable. Try again shortly.";
  }
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
  const errorCode = json?.code;
  if (response.status === 401 && !isLogin && !PROVIDER_AUTH_CODES.has(errorCode)) {
    clearPlatformSession();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
  }

  if (!response.ok) {
    throw new ApiError(
      friendlyMessage(response.status, json?.message, path, errorCode),
      {
        status: response.status,
        code: errorCode,
        details: json,
      },
    );
  }

  return json;
}

export function getApiBaseUrl() {
  return API_BASE;
}
