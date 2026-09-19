import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

describe("Phase 15A Super Admin deployment prep", () => {
  it("requires VITE_API_BASE_URL and optional company app URL", () => {
    const client = read("src/api/client.js");
    assert.match(client, /VITE_API_BASE_URL/);
    const companyUrl = read("src/lib/companyAppUrl.js");
    assert.match(companyUrl, /VITE_COMPANY_APP_BASE_URL/);
    const example = read(".env.example");
    assert.match(example, /VITE_API_BASE_URL/);
    assert.match(example, /VITE_COMPANY_APP_BASE_URL/);
    assert.equal(example.includes("service_role"), false);
  });

  it("has SPA rewrite config", () => {
    assert.equal(existsSync(join(root, "vercel.json")), true);
    assert.equal(existsSync(join(root, "public/_redirects")), true);
  });
});
