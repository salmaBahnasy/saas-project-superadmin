import { apiRequest } from "./client";

export function listCompanies() {
  return apiRequest("/api/platform/companies");
}

export function getCompany(companyId) {
  return apiRequest(`/api/platform/companies/${companyId}`);
}

export function createCompany(payload) {
  return apiRequest("/api/platform/companies", {
    method: "POST",
    body: payload,
  });
}

export function updateCompany(companyId, payload) {
  return apiRequest(`/api/platform/companies/${companyId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function updateCompanyAdmin(companyId, employeeId, payload) {
  return apiRequest(`/api/platform/companies/${companyId}/admins/${employeeId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function setCompanyActive(companyId, isActive) {
  return apiRequest(`/api/platform/companies/${companyId}/active`, {
    method: "PATCH",
    body: { is_active: isActive },
  });
}

export function assignCompanyResponsible(companyId, { name, email, password }) {
  return apiRequest(`/api/platform/companies/${encodeURIComponent(companyId)}/responsible`, {
    method: "POST", body: { name, email, password },
  });
}

export function updateCompanyResponsible(companyId, payload) {
  return apiRequest(`/api/platform/companies/${encodeURIComponent(companyId)}/responsible`, { method: "PATCH", body: payload });
}
