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

export function setCompanyActive(companyId, isActive) {
  return apiRequest(`/api/platform/companies/${companyId}/active`, {
    method: "PATCH",
    body: { is_active: isActive },
  });
}
