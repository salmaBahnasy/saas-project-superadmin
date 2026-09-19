import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { summaryLabel } from "./lib/companyOps.js";

const here = dirname(fileURLToPath(import.meta.url));

function read(rel) {
  return readFileSync(join(here, rel), "utf8");
}

describe("Super Admin company operations UX", () => {
  it("shows newest companies first and keeps client search", () => {
    const page = read("pages/CompaniesPage.jsx");
    assert.match(page, /Newest workspaces appear first/);
    assert.match(page, /Search companies/);
    assert.equal(page.includes("listCompanyIntegrations"), false);
    assert.match(page, /integrationsCount/);
    assert.match(page, /Employees will not be able to sign in/);
  });

  it("renders an operational company overview with usage counts", () => {
    const page = read("pages/CompanyDetailsPage.jsx");
    assert.match(page, /tab === "overview"/);
    assert.match(page, /usage\.employees/);
    assert.match(page, /usage\.products/);
    assert.match(page, /usage\.orders/);
    assert.match(page, /Connected integrations/);
    assert.match(page, /Joined \{formatDate\(company\.created_at\)\}/);
    assert.match(page, /subscription_status/);
  });

  it("keeps employees read-only and identifies company_admin", () => {
    const page = read("pages/CompanyDetailsPage.jsx");
    const api = read("api/companyOps.js");
    assert.match(page, /Read-only support view/);
    assert.match(page, /company_admin/);
    assert.match(page, /row\.isCompanyAdmin/);
    assert.equal(page.includes("reset password"), false);
    assert.equal(page.includes("passwordHash"), false);
    assert.match(api, /\/employees/);
    assert.equal(api.includes("password"), false);
  });

  it("renders feature toggles and updates local state", () => {
    const page = read("pages/CompanyDetailsPage.jsx");
    const ops = read("lib/companyOps.js");
    assert.match(page, /handleFeatureToggle/);
    assert.match(page, /FEATURE_GROUP_LABELS/);
    assert.match(ops, /Legacy \/ provider flags/);
    assert.match(page, /updateCompanyFeature/);
    assert.match(page, /setFeatures/);
    assert.match(ops, /not required to connect Shopify, Salla, or EasyOrders/);
  });

  it("summarizes multiple connections of the same provider", () => {
    const page = read("pages/CompanyDetailsPage.jsx");
    assert.match(page, /integrationsSummary/);
    assert.match(page, /summaryLabel/);
    assert.equal(summaryLabel({ connected: true, connections: 2 }), "2 connections");
    assert.equal(summaryLabel({ connected: true, connections: 1 }), "Connected");
    assert.equal(summaryLabel({ connected: false, connections: 0 }), "Not connected");
  });

  it("warns that manual Add Company does not create a login admin", () => {
    const page = read("pages/CompanyNewPage.jsx");
    const dash = read("pages/DashboardPage.jsx");
    assert.match(page, /does not create the first login admin/);
    assert.match(page, /public signup flow/);
    assert.match(page, /Open customer signup|Company Dashboard public signup/);
    assert.match(dash, /Create company manually/);
    assert.match(dash, /Recent companies/);
  });

  it("keeps branding, integrations support copy, and activate/deactivate", () => {
    const page = read("pages/CompanyDetailsPage.jsx");
    const integrations = read("pages/IntegrationsOverviewPage.jsx");
    assert.match(page, /tab === "employees"\) await loadEmployeesTab/);
    assert.match(page, /tab === "features"\) await loadFeaturesTab/);
    assert.match(page, /tab === "integrations"\) await loadIntegrationsTab/);
    assert.equal(page.includes("Promise.all(["), false);
    assert.match(page, /Save company/);
    assert.match(page, /Deactivate this company/);
    assert.match(page, /administrative\/support tool/);
    assert.match(integrations, /listIntegrationsOverview/);
    assert.equal(integrations.includes("listCompanyIntegrations"), false);
    assert.equal(integrations.includes("for (const company of companies)"), false);
  });
});
