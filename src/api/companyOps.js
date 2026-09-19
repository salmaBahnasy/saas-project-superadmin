import { apiRequest } from "./client";

export function listCompanyEmployees(companyId) {
  return apiRequest(`/api/platform/companies/${companyId}/employees`);
}

export function listCompanyFeatures(companyId) {
  return apiRequest(`/api/platform/companies/${companyId}/features`);
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
