import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("Salla Super Admin OAuth UX", () => {
  it("does not paste access tokens and exposes connect/reconnect/test only", () => {
    const form = readFileSync(
      join(here, "components/integrationForms/SallaForm.jsx"),
      "utf8",
    );
    const editor = readFileSync(
      join(here, "components/integrationForms/IntegrationEditor.jsx"),
      "utf8",
    );
    const page = readFileSync(join(here, "pages/CompanyDetailsPage.jsx"), "utf8");
    const api = readFileSync(join(here, "api/companyIntegrations.js"), "utf8");
    const client = readFileSync(join(here, "api/client.js"), "utf8");

    assert.match(form, /Partner App OAuth/);
    assert.match(form, /Authorization status/);
    assert.equal(form.includes("Access Token"), false);
    assert.equal(form.includes("accessToken"), false);
    assert.equal(form.includes("refreshToken"), false);
    assert.equal(form.includes("client_secret"), false);
    assert.equal(form.includes("SALLA_OAUTH_CLIENT"), false);
    assert.match(editor, /nextProvider !== "salla"/);
    assert.match(page, /Connect Salla/);
    assert.match(page, /Reconnect \/ Re-authorize/);
    assert.match(page, /handleSallaConnect/);
    assert.match(page, /authorizationUrl/);
    assert.match(page, /data\.merchantName/);
    assert.match(page, /SALLA_MERCHANT_MISMATCH/);
    assert.match(page, /INTEGRATION_IN_USE/);
    assert.match(page, /Disable it instead/);
    assert.match(page, /authorizationStatus === "revoked"/);
    assert.match(api, /salla\/connect/);
    assert.match(client, /SALLA_AUTHORIZATION_REVOKED/);
    assert.equal(page.includes("SALLA_OAUTH_CLIENT_SECRET"), false);
  });
});
