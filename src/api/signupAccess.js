import { apiRequest } from "./client";

export function getSignupAccessSetting({ signal } = {}) {
  return apiRequest("/api/platform/settings/signup-access", { signal });
}

export function updateSignupAccessSetting(newCompanyAccountStatus) {
  return apiRequest("/api/platform/settings/signup-access", {
    method: "PATCH",
    body: { newCompanyAccountStatus },
  });
}
