import { apiRequest } from "./client";

export function listIntegrationsOverview() {
  return apiRequest("/api/platform/integrations");
}

export function listCompanyIntegrations(companyId) {
  return apiRequest(`/api/platform/companies/${companyId}/integrations`);
}

export function getCompanyIntegration(companyId, integrationId) {
  return apiRequest(
    `/api/platform/companies/${companyId}/integrations/${integrationId}`,
  );
}

export function createCompanyIntegration(companyId, payload) {
  return apiRequest(`/api/platform/companies/${companyId}/integrations`, {
    method: "POST",
    body: payload,
  });
}

export function updateCompanyIntegration(companyId, integrationId, payload) {
  return apiRequest(
    `/api/platform/companies/${companyId}/integrations/${integrationId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function deleteCompanyIntegration(companyId, integrationId) {
  return apiRequest(
    `/api/platform/companies/${companyId}/integrations/${integrationId}`,
    { method: "DELETE" },
  );
}

export function rotateWebhook(companyId, integrationId) {
  return apiRequest(
    `/api/platform/companies/${companyId}/integrations/${integrationId}/rotate-webhook`,
    { method: "POST" },
  );
}

export function connectSallaIntegration(companyId, integrationId) {
  return apiRequest(
    `/api/platform/companies/${companyId}/integrations/${integrationId}/salla/connect`,
    { method: "POST" },
  );
}

export function testIntegration(companyId, integrationId) {
  return apiRequest(
    `/api/platform/companies/${companyId}/integrations/${integrationId}/test`,
    { method: "POST" },
  );
}
