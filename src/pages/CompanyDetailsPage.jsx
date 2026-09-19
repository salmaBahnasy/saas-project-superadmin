import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getCompany, setCompanyActive, updateCompany } from "../api/companies";
import {
  listCompanyEmployees,
  listCompanyFeatures,
  updateCompanyFeature,
} from "../api/companyOps";
import {
  connectSallaIntegration,
  createCompanyIntegration,
  deleteCompanyIntegration,
  listCompanyIntegrations,
  rotateWebhook,
  testIntegration,
  updateCompanyIntegration,
} from "../api/companyIntegrations";
import { IntegrationEditor } from "../components/integrationForms/IntegrationEditor.jsx";
import { Banner, EmptyState, StatusBadge } from "../components/ui/Feedback.jsx";
import { FEATURE_GROUP_HINTS, FEATURE_GROUP_LABELS, summaryLabel } from "../lib/companyOps";
import { formatDate, providerLabel } from "../lib/providers";

const TABS = ["overview", "employees", "features", "integrations", "branding"];

function isSpreadsheetSource(connection) {
  return String(connection?.provider || "").toLowerCase() === "spreadsheet";
}

function connectionErrorMessage(err) {
  if (err?.code === "INTEGRATION_IN_USE") {
    return "This connection still has attributed orders, products, or shipping data and cannot be deleted. Disable it instead.";
  }
  if (err?.code === "SHOPIFY_CREDENTIALS_INVALID") {
    return "Shopify credentials are invalid or revoked.";
  }
  if (err?.code === "SHOPIFY_PROVIDER_UNAVAILABLE" || err?.code === "SHOPIFY_GRAPHQL_ERROR") {
    return "Shopify is temporarily unavailable. Try again shortly.";
  }
  if (
    err?.code === "SHOPIFY_SHOP_DOMAIN_INVALID" ||
    err?.code === "SHOPIFY_SHOP_DOMAIN_REQUIRED"
  ) {
    return "Shopify shop domain is invalid. Use store-name.myshopify.com.";
  }
  if (err?.code === "SHOPIFY_SHOP_DOMAIN_MISMATCH") {
    return "The shop domain does not match this Shopify store.";
  }
  if (err?.code === "SALLA_AUTHORIZATION_PENDING") {
    return "Salla authorization is pending. Click Connect Salla.";
  }
  if (err?.code === "SALLA_AUTHORIZATION_REVOKED" || err?.code === "SALLA_CREDENTIALS_INVALID") {
    return "Salla authorization is revoked. Reconnect this store.";
  }
  if (err?.code === "SALLA_AUTHORIZATION_LEGACY") {
    return "This Salla connection uses a legacy token and must be reconnected with OAuth.";
  }
  if (err?.code === "SALLA_MERCHANT_MISMATCH") {
    return "That Salla merchant does not match this connection. Create a new Salla integration for a different store.";
  }
  if (err?.code === "SALLA_OAUTH_NOT_CONFIGURED") {
    return "Salla Partner App OAuth is not configured on the server.";
  }
  return err?.message || "Request failed.";
}

function sallaStatusLabel(connection) {
  const status = connection?.authorizationStatus || (connection?.configured ? "connected" : "pending");
  if (status === "connected") return "connected";
  if (status === "revoked") return "revoked";
  if (status === "legacy_unmanaged") return "legacy token";
  return "pending";
}

export function CompanyDetailsPage() {
  const { companyId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedTab = params.get("tab");
  const tab = TABS.includes(requestedTab) ? requestedTab : "overview";
  const [company, setCompany] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [revealedWebhooks, setRevealedWebhooks] = useState({});

  async function loadCompany() {
    const companyRes = await getCompany(companyId);
    setCompany(companyRes.data);
    setEditForm({
      name: companyRes.data.name,
      slug: companyRes.data.slug,
      logo_url: companyRes.data.logo_url || "",
      primary_color: companyRes.data.primary_color || "",
      secondary_color: companyRes.data.secondary_color || "",
    });
    return companyRes.data;
  }

  async function loadEmployeesTab() {
    const employeesRes = await listCompanyEmployees(companyId);
    setEmployees(employeesRes.data || []);
  }

  async function loadFeaturesTab() {
    const featuresRes = await listCompanyFeatures(companyId);
    setFeatures(featuresRes.data || []);
  }

  async function loadIntegrationsTab() {
    const integrationsRes = await listCompanyIntegrations(companyId);
    setIntegrations(integrationsRes.data || []);
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      await loadCompany();
      if (tab === "employees") await loadEmployeesTab();
      if (tab === "features") await loadFeaturesTab();
      if (tab === "integrations") await loadIntegrationsTab();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        await loadCompany();
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (cancelled) return;
      const search = new URLSearchParams(window.location.search);
      const salla = search.get("salla");
      const code = search.get("code");
      if (salla === "connected") {
        setNotice("Salla connected.");
        setParams((current) => {
          const next = new URLSearchParams(current);
          next.delete("salla");
          next.delete("code");
          next.set("tab", "integrations");
          return next;
        }, { replace: true });
      } else if (salla === "error") {
        setError(connectionErrorMessage({ code, message: "Salla authorization failed." }));
        setParams((current) => {
          const next = new URLSearchParams(current);
          next.delete("salla");
          next.delete("code");
          next.set("tab", "integrations");
          return next;
        }, { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    let cancelled = false;
    async function loadTab() {
      try {
        if (tab === "employees") await loadEmployeesTab();
        if (tab === "features") await loadFeaturesTab();
        if (tab === "integrations") await loadIntegrationsTab();
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    loadTab();
    return () => {
      cancelled = true;
    };
  }, [tab, companyId]);

  const commerce = useMemo(
    () => integrations.filter((row) => row.category === "commerce" && !isSpreadsheetSource(row)),
    [integrations],
  );
  const historical = useMemo(
    () => integrations.filter((row) => isSpreadsheetSource(row)),
    [integrations],
  );
  const shipping = useMemo(
    () => integrations.filter((row) => row.category === "shipping"),
    [integrations],
  );
  const admins = useMemo(
    () => employees.filter((row) => row.isCompanyAdmin || row.role === "company_admin"),
    [employees],
  );
  const featureGroups = useMemo(() => {
    const groups = { core: [], operational: [], legacy: [], other: [] };
    for (const feature of features) {
      const group = groups[feature.group] ? feature.group : "other";
      groups[group].push(feature);
    }
    return groups;
  }, [features]);

  async function copyWebhook(url) {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Webhook URL copied.");
    } catch {
      setNotice("Copy the webhook URL from the field.");
    }
  }

  async function handleRotate(connection) {
    const confirmed = window.confirm(
      connection.provider === "shopify"
        ? "The existing webhook URL will stop working immediately. Update the webhook destination in Shopify to the new URL. The HMAC secret is not rotated. Continue?"
        : "The existing webhook URL will stop working immediately. Continue?",
    );
    if (!confirmed) return;
    try {
      const result = await rotateWebhook(companyId, connection.id);
      setNotice(
        connection.provider === "shopify"
          ? "Webhook URL rotated. HMAC secret is unchanged. Update the callback URL in Shopify."
          : "Webhook rotated. Copy the new URL into the provider dashboard.",
      );
      await load();
      if (result?.data?.webhookUrl) {
        setRevealedWebhooks((prev) => ({
          ...prev,
          [connection.id]: result.data.webhookUrl,
        }));
        await navigator.clipboard.writeText(result.data.webhookUrl);
        setNotice(
          connection.provider === "shopify"
            ? "New Shopify webhook URL copied. HMAC secret is unchanged — update only the destination URL in Shopify."
            : "Webhook rotated and new URL copied.",
        );
      }
    } catch (err) {
      setError(connectionErrorMessage(err));
    }
  }

  async function handleToggle(connection) {
    try {
      await updateCompanyIntegration(companyId, connection.id, {
        enabled: !connection.enabled,
      });
      await load();
    } catch (err) {
      setError(connectionErrorMessage(err));
    }
  }

  async function handleDelete(connection) {
    const confirmed = window.confirm(
      `Disconnect “${connection.name}”? Incoming webhooks for this connection will stop working.`,
    );
    if (!confirmed) return;
    try {
      await deleteCompanyIntegration(companyId, connection.id);
      await load();
    } catch (err) {
      setError(connectionErrorMessage(err));
    }
  }

  async function handleSallaConnect(connection) {
    try {
      const result = await connectSallaIntegration(companyId, connection.id);
      const authorizationUrl = result?.data?.authorizationUrl;
      if (!authorizationUrl) {
        setError("Salla authorization URL was not returned.");
        return;
      }
      window.location.assign(authorizationUrl);
    } catch (err) {
      setError(connectionErrorMessage(err));
    }
  }

  async function handleTest(connection) {
    try {
      const result = await testIntegration(companyId, connection.id);
      const data = result?.data || {};
      if (data.connected && data.shopName) {
        setNotice(
          data.shopDomain
            ? `${connection.name} connected to ${data.shopName} (${data.shopDomain}).`
            : `${connection.name} connected to ${data.shopName}.`,
        );
      } else if (data.connected && data.merchantName) {
        setNotice(
          data.merchantId
            ? `${connection.name} connected to ${data.merchantName} (${data.merchantId}).`
            : `${connection.name} connected to ${data.merchantName}.`,
        );
      } else {
        setNotice(
          data.ok
            ? `${connection.name} is configured and enabled.`
            : `${connection.name} is not fully configured.`,
        );
      }
    } catch (err) {
      setError(connectionErrorMessage(err));
    }
  }

  async function handleSaveConnection(payload) {
    setSaving(true);
    setError("");
    try {
      if (editor?.id) {
        await updateCompanyIntegration(companyId, editor.id, payload);
      } else {
        const created = await createCompanyIntegration(companyId, payload);
        const createdId = created?.data?.id;
        const webhookUrl = created?.data?.webhookUrl;
        if (createdId && webhookUrl) {
          setRevealedWebhooks((prev) => ({ ...prev, [createdId]: webhookUrl }));
        }
      }
      setEditor(null);
      await load();
    } catch (err) {
      setError(connectionErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveBranding(event) {
    event.preventDefault();
    try {
      await updateCompany(companyId, editForm);
      setNotice("Company branding saved.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleActiveToggle() {
    const activating = company.is_active === false;
    if (!activating) {
      const confirmed = window.confirm(
        "Deactivate this company? Employees will not be able to sign in until it is activated again.",
      );
      if (!confirmed) return;
    }
    try {
      await setCompanyActive(company.id, activating);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFeatureToggle(feature) {
    try {
      const result = await updateCompanyFeature(companyId, feature.key, !feature.is_enabled);
      setFeatures((current) =>
        current.map((row) =>
          row.key === feature.key
            ? { ...row, is_enabled: result.data?.is_enabled ?? !feature.is_enabled }
            : row,
        ),
      );
      setNotice(`${feature.name} ${result.data?.is_enabled ? "enabled" : "disabled"}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  function ConnectionList({ title, rows }) {
    return (
      <section className="panel">
        <div className="spread">
          <h2>{title}</h2>
        </div>
        {rows.length === 0 ? (
          <p className="muted">No {title.toLowerCase()} configured yet.</p>
        ) : (
          rows.map((connection) => (
            <div className="connection" key={connection.id}>
              <div>
                <strong>{connection.name}</strong>
                <div className="muted">
                  {providerLabel(connection.provider)} · {isSpreadsheetSource(connection) ? "historical source" : connection.configured ? "configured" : "not configured"}
                  {connection.shopDomain ? ` · ${connection.shopDomain}` : ""}
                  {connection.provider === "salla"
                    ? ` · ${sallaStatusLabel(connection)}${connection.merchantName ? ` · ${connection.merchantName}` : ""}${connection.providerAccountId ? ` · ${connection.providerAccountId}` : ""}`
                    : ""}
                </div>
                {!isSpreadsheetSource(connection) && revealedWebhooks[connection.id] ? (
                  <div className="webhook" style={{ marginTop: 10 }}>
                    <input className="input" readOnly value={revealedWebhooks[connection.id]} />
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => copyWebhook(revealedWebhooks[connection.id])}>
                      Copy
                    </button>
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => handleRotate(connection)}>
                      Rotate Webhook
                    </button>
                  </div>
                ) : !isSpreadsheetSource(connection) && connection.webhookConfigured ? (
                  <div className="webhook" style={{ marginTop: 10 }}>
                    <p className="muted">Configured — rotate to generate a new URL.</p>
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => handleRotate(connection)}>
                      Rotate Webhook
                    </button>
                  </div>
                ) : !isSpreadsheetSource(connection) ? (
                  <div className="webhook" style={{ marginTop: 10 }}>
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => handleRotate(connection)}>
                      Rotate Webhook
                    </button>
                  </div>
                ) : null}
                {connection.provider === "shopify" && !isSpreadsheetSource(connection) ? (
                  <div className="help-box">
                    <p>
                      Point these Shopify webhook topics at the URL above:
                    </p>
                    <ul className="topic-list">
                      <li>orders/create</li>
                      <li>orders/updated</li>
                      <li>orders/cancelled</li>
                    </ul>
                    <p>
                      The webhook HMAC secret on this connection must match the
                      secret Shopify uses to sign these webhooks. The secret is
                      never shown after save.
                    </p>
                    <p className="muted">
                      {connection.webhookSecretConfigured
                        ? "HMAC secret is configured."
                        : "HMAC secret is not configured yet — Shopify webhooks will be rejected."}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="connection-actions">
                <StatusBadge active={connection.enabled} />
                <button className="btn btn-secondary btn-small" type="button" onClick={() => setEditor(connection)}>
                  Edit
                </button>
                <button className="btn btn-secondary btn-small" type="button" onClick={() => handleToggle(connection)}>
                  {connection.enabled ? "Disable" : "Enable"}
                </button>
                {connection.provider === "salla" && !isSpreadsheetSource(connection) ? (
                  <button className="btn btn-primary btn-small" type="button" onClick={() => handleSallaConnect(connection)}>
                    {connection.authorizationStatus === "connected" || connection.authorizationStatus === "revoked" || connection.authorizationStatus === "legacy_unmanaged"
                      ? "Reconnect / Re-authorize"
                      : "Connect Salla"}
                  </button>
                ) : null}
                {!isSpreadsheetSource(connection) ? (
                  <button className="btn btn-secondary btn-small" type="button" onClick={() => handleTest(connection)}>
                    Test connection
                  </button>
                ) : null}
                <button className="btn btn-danger btn-small" type="button" onClick={() => handleDelete(connection)}>
                  Disconnect
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    );
  }

  if (loading) return <p className="muted">Loading company…</p>;
  if (!company) return <Banner>{error || "Company not found."}</Banner>;

  const usage = company.usage || {};

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <p className="eyebrow">Company</p>
          <h1>{company.name}</h1>
          <div className="muted">{company.slug} · Joined {formatDate(company.created_at)}</div>
        </div>
        <div className="wrap">
          <StatusBadge active={company.is_active !== false} offLabel="Inactive" />
          <button
            className={company.is_active === false ? "btn btn-primary" : "btn btn-danger"}
            type="button"
            onClick={handleActiveToggle}
          >
            {company.is_active === false ? "Activate" : "Deactivate"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/platform/companies")}>
            Back
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((item) => (
          <button
            key={item}
            className={`tab ${tab === item ? "active" : ""}`}
            type="button"
            onClick={() => setParams({ tab: item })}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {error ? <Banner>{error}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}

      {tab === "overview" ? (
        <div className="stack">
          <div className="cards">
            <div className="card">
              <div className="muted">Employees</div>
              <div className="stat">{usage.employees ?? 0}</div>
            </div>
            <div className="card">
              <div className="muted">Products</div>
              <div className="stat">{usage.products ?? 0}</div>
            </div>
            <div className="card">
              <div className="muted">Orders</div>
              <div className="stat">{usage.orders ?? 0}</div>
            </div>
            <div className="card">
              <div className="muted">Connected integrations</div>
              <div className="stat">{usage.integrations ?? 0}</div>
            </div>
          </div>
          <section className="panel stack">
            <h2>Workspace</h2>
            <p className="muted">Subscription status is read-only. Billing is not managed here.</p>
            <div className="muted">Status: {company.subscription_status || "none"}</div>
            <div>
              <strong>Company admin</strong>
              <div className="muted">
                Open the Employees tab to view company_admin accounts.
              </div>
            </div>
          </section>
          <section className="panel stack">
            <h2>Integrations summary</h2>
            <p className="muted">
              Company Admin normally manages their own integrations from the Company Dashboard.
              Super Admin connection tools are for support and emergency configuration only.
            </p>
            {(company.integrationsSummary || []).map((row) => (
              <div className="spread" key={row.provider}>
                <strong>{row.label || providerLabel(row.provider)}</strong>
                <span className="muted">{summaryLabel(row)}</span>
              </div>
            ))}
          </section>
        </div>
      ) : null}

      {tab === "employees" ? (
        <section className="panel table-wrap">
          <h2>Employees</h2>
          <p className="muted">Read-only support view. Passwords are never shown.</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    {row.isCompanyAdmin ? <span className="pill">company_admin</span> : null}
                  </td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td>
                    <StatusBadge active={row.is_active !== false} offLabel="Inactive" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 ? <p className="empty">No employees found.</p> : null}
        </section>
      ) : null}

      {tab === "features" ? (
        <div className="stack">
          {Object.entries(featureGroups).map(([group, rows]) =>
            rows.length ? (
              <section className="panel stack" key={group}>
                <div>
                  <h2>{FEATURE_GROUP_LABELS[group] || group}</h2>
                  <p className="muted">{FEATURE_GROUP_HINTS[group]}</p>
                </div>
                {rows.map((feature) => (
                  <div className="feature-row" key={feature.key}>
                    <div>
                      <strong>{feature.name}</strong>
                      <div className="muted">{feature.key}</div>
                    </div>
                    <button
                      className="btn btn-secondary btn-small"
                      type="button"
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      {feature.is_enabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                ))}
              </section>
            ) : null,
          )}
        </div>
      ) : null}

      {tab === "integrations" ? (
        <div className="stack">
          <div className="spread">
            <p className="muted">
              Company Admin normally manages their own integrations from the Company Dashboard.
              Super Admin integration management is an administrative/support tool and is not required for onboarding.
              A company can have many stores and shipping accounts, including duplicates of the same provider.
            </p>
            <button className="btn btn-primary" type="button" onClick={() => setEditor({})}>
              + Add Integration
            </button>
          </div>
          {commerce.length === 0 && shipping.length === 0 && historical.length === 0 ? (
            <EmptyState
              title="No integrations configured yet."
              action={
                <button className="btn btn-primary" type="button" onClick={() => setEditor({})}>
                  Add Integration
                </button>
              }
            >
              Use this only for support. Customers can connect stores themselves.
            </EmptyState>
          ) : (
            <>
              <ConnectionList title="Commerce / Stores" rows={commerce} />
              {historical.length ? (
                <ConnectionList title="Historical Data" rows={historical} />
              ) : null}
              <ConnectionList title="Shipping" rows={shipping} />
            </>
          )}
        </div>
      ) : null}

      {tab === "branding" ? (
        <form className="panel stack" onSubmit={saveBranding}>
          <h2>Branding and details</h2>
          <div className="grid-2">
            <div className="field">
              <label>Name</label>
              <input className="input" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
            </div>
            <div className="field">
              <label>Slug</label>
              <input className="input" value={editForm.slug} onChange={(event) => setEditForm({ ...editForm, slug: event.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Logo URL</label>
            <input className="input" value={editForm.logo_url} onChange={(event) => setEditForm({ ...editForm, logo_url: event.target.value })} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Primary color</label>
              <div className="row">
                <span className="color-dot" style={{ background: editForm.primary_color || "#0f6b57" }} />
                <input className="input" value={editForm.primary_color} onChange={(event) => setEditForm({ ...editForm, primary_color: event.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Secondary color</label>
              <div className="row">
                <span className="color-dot" style={{ background: editForm.secondary_color || "#14201b" }} />
                <input className="input" value={editForm.secondary_color} onChange={(event) => setEditForm({ ...editForm, secondary_color: event.target.value })} />
              </div>
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Save company</button>
        </form>
      ) : null}

      {editor ? (
        <IntegrationEditor
          company={company}
          existing={editor.id ? editor : null}
          saving={saving}
          error={error}
          onClose={() => setEditor(null)}
          onSubmit={handleSaveConnection}
        />
      ) : null}
    </div>
  );
}
