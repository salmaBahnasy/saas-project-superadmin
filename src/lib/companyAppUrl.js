export function getCompanyAppBaseUrl() {
  return String(import.meta.env.VITE_COMPANY_APP_BASE_URL || "").replace(/\/$/, "");
}

export function getCustomerSignupUrl() {
  const base = getCompanyAppBaseUrl();
  if (!base) return "";
  try {
    const url = new URL(base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${base}/signup`;
  } catch {
    return "";
  }
}
