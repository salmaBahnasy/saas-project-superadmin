const TOKEN_KEY = "saas_platform_token";
const USER_KEY = "saas_platform_user";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

export function getPlatformToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getPlatformUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function isPlatformAdminSession() {
  const token = getPlatformToken();
  if (!token) return false;
  const decoded = decodeJwt(token);
  if (!decoded) return false;
  if (decoded.scope !== "platform_admin" || !decoded.platformAdminId) return false;
  if (decoded.companyId) return false;
  if (decoded.exp && decoded.exp * 1000 < Date.now()) return false;
  return true;
}

export function savePlatformSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || { email: decodeJwt(token)?.email }));
}

export function clearPlatformSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
