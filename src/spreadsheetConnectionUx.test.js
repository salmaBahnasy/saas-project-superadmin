import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("Spreadsheet Super Admin historical-data UX", () => {
  it("shows spreadsheet sources without credentials, OAuth, test, or webhook actions", () => {
    const page = readFileSync(join(here, "pages/CompanyDetailsPage.jsx"), "utf8");
    const editor = readFileSync(
      join(here, "components/integrationForms/IntegrationEditor.jsx"),
      "utf8",
    );
    const fields = readFileSync(
      join(here, "components/integrationForms/ProviderFields.jsx"),
      "utf8",
    );
    const providers = readFileSync(join(here, "lib/providers.js"), "utf8");

    assert.match(providers, /Historical Data/);
    assert.equal(providers.includes('id: "spreadsheet"'), false);
    assert.match(page, /isSpreadsheetSource/);
    assert.match(page, /Historical Data/);
    assert.match(page, /historical source/);
    assert.match(page, /!isSpreadsheetSource\(connection\)/);
    assert.match(page, /Test connection/);
    assert.match(page, /INTEGRATION_IN_USE/);
    assert.match(fields, /Spreadsheet sources have no API credentials/);
    assert.match(fields, /no API credentials, OAuth, Access Token/);
    assert.match(editor, /nextProvider === "spreadsheet"/);
    assert.match(editor, /!== "spreadsheet"/);
  });
});
