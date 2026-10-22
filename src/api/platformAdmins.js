import { apiRequest } from "./client";

export function listPlatformAdmins() {
  return apiRequest("/api/platform/admins");
}

export function invitePlatformAdmin(payload) {
  return apiRequest("/api/platform/admins", {
    method: "POST",
    body: payload,
  });
}

export function deactivatePlatformAdmin(adminId) {
  return apiRequest(`/api/platform/admins/${adminId}/active`, {
    method: "PATCH",
    body: { is_active: false },
  });
}

export function acceptPlatformAdminInvite(payload) {
  return apiRequest("/api/platform/auth/invites/accept", {
    method: "POST",
    body: payload,
    token: "",
  });
}
