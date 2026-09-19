import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isMaskedSecretPlaceholder,
  looksLikeShopifyShopDomain,
} from "./lib/shopifyDomain.js";

const here = dirname(fileURLToPath(import.meta.url));

describe("Shopify Super Admin connection UX", () => {
  it("requires Shopify fields without exposing apiKey or API version", () => {
    const form = readFileSync(
      join(here, "components/integrationForms/ShopifyForm.jsx"),
      "utf8",
    );
    const editor = readFileSync(
      join(here, "components/integrationForms/IntegrationEditor.jsx"),
      "utf8",
    );
    assert.match(form, /Shop domain/);
    assert.match(form, /Access Token/);
    assert.match(form, /Webhook HMAC secret/);
    assert.equal(form.includes('name="apiKey"'), false);
    assert.equal(form.includes("API Key"), false);
    assert.equal(form.includes("API version"), false);
    assert.equal(form.includes("SHOPIFY_ADMIN_API_VERSION"), false);
    assert.match(editor, /Shopify shop domain is required/);
    assert.match(editor, /Shopify Admin API access token is required/);
    assert.match(form, /read_products/);
    assert.match(form, /read_orders/);
    assert.match(form, /read_all_orders/);
    assert.equal(editor.includes('name="apiKey"'), false);
    assert.equal(editor.includes("API Key"), false);
  });

  it("accepts pasted shop domains and rejects masked secret placeholders", () => {
    assert.equal(looksLikeShopifyShopDomain("store.myshopify.com"), true);
    assert.equal(
      looksLikeShopifyShopDomain("https://store.myshopify.com/admin"),
      true,
    );
    assert.equal(looksLikeShopifyShopDomain("not-a-shop.example.com"), false);
    assert.equal(isMaskedSecretPlaceholder(""), true);
    assert.equal(isMaskedSecretPlaceholder("**************"), true);
    assert.equal(isMaskedSecretPlaceholder("****oken"), true);
    assert.equal(isMaskedSecretPlaceholder("shpat-real-token"), false);
  });

  it("shows configured webhook status, required topics, copy, rotate warning, and safe test copy", () => {
    const page = readFileSync(join(here, "pages/CompanyDetailsPage.jsx"), "utf8");
    const client = readFileSync(join(here, "api/client.js"), "utf8");
    assert.match(page, /webhookConfigured/);
    assert.match(page, /Configured — rotate to generate a new URL/);
    assert.match(page, /revealedWebhooks/);
    assert.match(page, /Copy/);
    assert.match(page, /orders\/create/);
    assert.match(page, /orders\/updated/);
    assert.match(page, /orders\/cancelled/);
    assert.match(page, /HMAC secret is unchanged/);
    assert.match(page, /connected to \$\{data\.shopName\} \(\$\{data\.shopDomain\}\)/);
    assert.match(page, /INTEGRATION_IN_USE/);
    assert.match(page, /connection\.id/);
    assert.equal(page.includes("selectedSystem"), false);
    assert.match(client, /SHOPIFY_CREDENTIALS_INVALID/);
    assert.match(client, /PROVIDER_AUTH_CODES/);
  });
});
