import { apiRequest } from "./client";

export function listCompanyEmployees(companyId, { signal } = {}) {
  return apiRequest(`/api/platform/companies/${companyId}/employees`, { signal });
}

export function listCompanyFeatures(companyId, { signal } = {}) {
  return apiRequest(`/api/platform/companies/${companyId}/features`, { signal });
}

export function updateCompanyFeature(companyId, featureKey, isEnabled) {
  return apiRequest(
    `/api/platform/companies/${companyId}/features/${encodeURIComponent(featureKey)}`,
    {
      method: "PATCH",
      body: { is_enabled: isEnabled },
    },
  );
}
