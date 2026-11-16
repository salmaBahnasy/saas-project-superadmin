import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createReadRequests } from "./lib/readRequests.js";
const settle = () => new Promise(resolve => setImmediate(resolve));

test("platform reads share pending transport, isolate tokens, and refresh after a mutation", async () => {
  const requests = [];let token = "admin-a";
  let source = readFileSync(new URL("./api/client.js", import.meta.url), "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace(/^const API_BASE = .*;$/m, 'const API_BASE = "https://example.test";')
    .replace(/\bexport /g, "");
  const context = vm.createContext({
    AbortController, setTimeout, clearTimeout,
    createReadRequests, getPlatformToken: () => token, clearPlatformSession() {},
    fetch: (url, config) => new Promise((resolve, reject) => {
      requests.push({ url, config, resolve: data => resolve({ ok: true, status: 200, text: async () => JSON.stringify(data) }) });
      config.signal?.addEventListener("abort", () => reject(Object.assign(Error("canceled"), { name: "AbortError" })), {once: true});
    }),
  });
  vm.runInContext(`${source}\nglobalThis.api = apiRequest;`, context);
  const a = context.api("/companies"), b = context.api("/companies");
  await settle();assert.equal(requests.length, 1);requests[0].resolve({data: [1]});
  await Promise.all([a, b]);
  const older = context.api("/companies");await settle();assert.equal(requests.length, 2);
  token = "admin-b";const other = context.api("/companies");await settle();assert.equal(requests.length, 3);
  assert.equal(requests[2].config.headers.Authorization, "Bearer admin-b");
  const write = context.api("/companies/1", {method: "PATCH", body: {active: true}});
  await settle();requests[3].resolve({ok: true});await write;
  const fresh = context.api("/companies");await settle();assert.equal(requests.length, 5);
  requests.forEach(request => request.resolve({data: []}));await Promise.all([older, other, fresh]);
});

test("platform tab loaders ignore an old company response even if its transport finishes after cancellation", async () => {
  const source = readFileSync(new URL("./pages/CompanyDetailsPage.jsx", import.meta.url), "utf8");
  for (const [name, api, setter] of [
    ["loadEmployeesTab", "listCompanyEmployees", "setEmployees"],
    ["loadFeaturesTab", "listCompanyFeatures", "setFeatures"],
    ["loadIntegrationsTab", "listCompanyIntegrations", "setIntegrations"],
  ]) {
    const start = source.indexOf(`  async function ${name}(`);
    const fn = source.slice(start, source.indexOf("\n  }", start) + 4);
    const pending = [], updates = [];
    const context = vm.createContext({companyId: "old", [setter]: value => updates.push(value),
      [api]: id => new Promise(resolve => pending.push({id, resolve})),
    });
    vm.runInContext(fn, context);
    const controller = new AbortController();
    const old = context[name](controller.signal);controller.abort();context.companyId = "new";
    const latest = context[name](new AbortController().signal);
    pending[0].resolve({data: ["old"]});await old;assert.deepEqual(updates, []);
    pending[1].resolve({data: ["new"]});await latest;assert.deepEqual(updates, [["new"]]);
  }
});

test("platform read cancellation remains subscriber-specific", async () => {
  const pool = createReadRequests();const controller = new AbortController();
  let release, signal;
  const fetcher = next => { signal = next;return new Promise(resolve => { release = resolve; }); };
  const first = pool.load("admin", "companies", fetcher, {signal: controller.signal});
  const second = pool.load("admin", "companies", fetcher);
  await settle();controller.abort();await assert.rejects(first, e => e.code === "ERR_CANCELED");
  assert.equal(signal.aborted, false);release({data: []});await second;
});

test("a stalled platform read exits loading with a timeout and clears its timer", async () => {
  const source = readFileSync(new URL("./api/client.js", import.meta.url), "utf8");
  const start = source.indexOf("async function fetchResponse(");
  const fn = source.slice(start, source.indexOf("\n}\n", start) + 2);
  let expire, cleared = false, delay;
  class ApiError extends Error { constructor(message, {code}) { super(message);this.code = code; } }
  const context = vm.createContext({
    AbortController, ApiError,
    setTimeout: (callback, ms) => { expire = callback;delay = ms;return 1; }, clearTimeout: () => { cleared = true; },
    fetch: (_, {signal}) => new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(Error("aborted")), {once: true})),
  });
  vm.runInContext(fn, context);
  const pending = context.fetchResponse("https://example.test", {method: "GET"});
  assert.equal(delay, 30_000);expire();
  await assert.rejects(pending, error => error.code === "REQUEST_TIMEOUT");assert.equal(cleared, true);
});
