import { test } from "node:test";
import assert from "node:assert/strict";
import { canReviewDeletion } from "./lib/companyDeletion.js";
test("readiness confirmation requires exact slug, suspension, and idle request", () => {
  const company = { slug: "fixture-company", account_status: "suspended" };
  assert.equal(canReviewDeletion(company, "fixture-company", false), true);
  for (const typed of ["Fixture-company", " fixture-company", "fixture-company ", "", "fixture"]) {
    assert.equal(canReviewDeletion(company, typed, false), false);
  }
  assert.equal(canReviewDeletion(company, company.slug, true), false);
  for (const status of ["pending", "active", undefined, null, "Suspended", " suspended", "suspended "]) {
    assert.equal(canReviewDeletion({ ...company, account_status: status }, company.slug, false), false);
  }
  assert.equal(canReviewDeletion({ account_status: "suspended", slug: "" }, "", false), false);
});
