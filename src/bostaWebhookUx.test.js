import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function read(rel) {
  return readFileSync(join(here, rel), "utf8");
}

describe("Super Admin Bosta webhook URL visibility", () => {
  it("shows existing per-connection webhookUrl without rotating on view", () => {
    const page = read("pages/CompanyDetailsPage.jsx");

    assert.match(page, /revealedWebhooks\[connection\.id\] \|\| connection\.webhookUrl/);
    assert.match(page, /copyWebhook\(revealedWebhooks\[connection\.id\] \|\| connection\.webhookUrl\)/);
    assert.match(page, /onClick=\{\(\) => handleRotate\(connection\)\}/);
    assert.match(page, /async function handleRotate/);
    assert.match(page, /rotateWebhook\(companyId, connection\.id\)/);
    const loadFn = page.slice(
      page.indexOf("async function load("),
      page.indexOf("async function handleRotate"),
    );
    assert.equal(loadFn.includes("rotateWebhook"), false);
    assert.equal(loadFn.includes("handleRotate"), false);
    assert.match(
      page,
      /connection\.provider === "shopify" && !isSpreadsheetSource\(connection\)/,
    );

    const pick = (connection, revealed = {}) =>
      revealed[connection.id] || connection.webhookUrl || "";
    const a = {
      id: "bosta-1",
      provider: "bosta",
      webhookUrl: "https://api.example/webhooks/bosta/aaa/order-status",
    };
    const b = {
      id: "bosta-2",
      provider: "bosta",
      webhookUrl: "https://api.example/webhooks/bosta/bbb/order-status",
    };
    assert.equal(pick(a), a.webhookUrl);
    assert.equal(pick(b), b.webhookUrl);
    assert.notEqual(pick(a), pick(b));
    assert.equal(pick(a, { "bosta-2": b.webhookUrl }), a.webhookUrl);
  });

  it("does not expose Bosta credentials or a standalone webhook token field", () => {
    const page = read("pages/CompanyDetailsPage.jsx");
    const form = read("components/integrationForms/BostaForm.jsx");
    assert.equal(page.includes("connection.apiKey"), false);
    assert.equal(page.includes("connection.fulfillmentApiKey"), false);
    assert.equal(page.includes("row.apiKey"), false);
    assert.equal(/\bwebhookToken\b/.test(page.replace(/webhookToken(?:Created|Rotated)At/g, "")), false);
    assert.equal(page.includes("webhook_token_hash"), false);
    assert.equal(page.includes("webhook_token_encrypted"), false);
    assert.equal(form.includes("webhookToken"), false);
    assert.match(form, /type="password"/);
  });
});
