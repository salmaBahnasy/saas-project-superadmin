import { apiRequest } from "./client";

export function getCompanyDeletionReadiness(companyId) {
  return apiRequest(`/api/platform/companies/${encodeURIComponent(companyId)}/deletion-readiness`);
}

export function getCompanyDeletionJobStatus(jobId) {
  return apiRequest(`/api/platform/company-deletion-jobs/${encodeURIComponent(jobId)}`);
}

export function listCompanies({ signal } = {}) {
  return apiRequest("/api/platform/companies", { signal });
}

export function getCompany(companyId, { signal } = {}) {
  return apiRequest(`/api/platform/companies/${companyId}`, { signal });
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
