import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getCompany, setCompanyActive, updateCompany } from "../api/companies";
import {
  createCompanyIntegration,
  deleteCompanyIntegration,
  listCompanyIntegrations,
  rotateWebhook,
  testIntegration,
  updateCompanyIntegration,
} from "../api/companyIntegrations";
import { IntegrationEditor } from "../components/integrationForms/IntegrationEditor.jsx";
import { Banner, EmptyState, StatusBadge } from "../components/ui/Feedback.jsx";
import { providerLabel } from "../lib/providers";

export function CompanyDetailsPage() {
  const { companyId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = params.get("tab") === "integrations" ? "integrations" : "overview";
  const [company, setCompany] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [companyRes, integrationsRes] = await Promise.all([
        getCompany(companyId),
        listCompanyIntegrations(companyId),
      ]);
      setCompany(companyRes.data);
      setIntegrations(integrationsRes.data || []);
      setEditForm({
        name: companyRes.data.name,
        slug: companyRes.data.slug,
        logo_url: companyRes.data.logo_url || "",
        primary_color: companyRes.data.primary_color || "",
        secondary_color: companyRes.data.secondary_color || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [companyId]);

  const commerce = useMemo(
    () => integrations.filter((row) => row.category === "commerce"),
    [integrations],
  );
  const shipping = useMemo(
    () => integrations.filter((row) => row.category === "shipping"),
    [integrations],
  );

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
      "The existing webhook URL will stop working immediately. Continue?",
    );
    if (!confirmed) return;
    try {
      const result = await rotateWebhook(companyId, connection.id);
      setNotice("Webhook rotated. Copy the new URL into the provider dashboard.");
      await load();
      if (result?.data?.webhookUrl) {
        await navigator.clipboard.writeText(result.data.webhookUrl);
        setNotice("Webhook rotated and new URL copied.");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(connection) {
    try {
      await updateCompanyIntegration(companyId, connection.id, {
        enabled: !connection.enabled,
      });
      await load();
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    }
  }

  async function handleTest(connection) {
    try {
      const result = await testIntegration(companyId, connection.id);
      setNotice(
        result?.data?.ok
          ? `${connection.name} is configured and enabled.`
          : `${connection.name} is not fully configured.`,
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveConnection(payload) {
    setSaving(true);
    setError("");
    try {
      if (editor?.id) {
        await updateCompanyIntegration(companyId, editor.id, payload);
      } else {
        await createCompanyIntegration(companyId, payload);
      }
      setEditor(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveOverview(event) {
    event.preventDefault();
    try {
      await updateCompany(companyId, editForm);
      setNotice("Company details saved.");
      await load();
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
                  {providerLabel(connection.provider)} · {connection.configured ? "configured" : "not configured"}
                </div>
                {connection.webhookUrl ? (
                  <div className="webhook" style={{ marginTop: 10 }}>
                    <input className="input" readOnly value={connection.webhookUrl} />
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => copyWebhook(connection.webhookUrl)}>
                      Copy
                    </button>
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => handleRotate(connection)}>
                      Rotate Webhook
                    </button>
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
                <button className="btn btn-secondary btn-small" type="button" onClick={() => handleTest(connection)}>
                  Test connection
                </button>
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

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <p className="eyebrow">Company</p>
          <h1>{company.name}</h1>
          <div className="muted">{company.slug}</div>
        </div>
        <div className="wrap">
          <StatusBadge active={company.is_active !== false} offLabel="Inactive" />
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => {
              await setCompanyActive(company.id, company.is_active === false);
              await load();
            }}
          >
            {company.is_active === false ? "Activate" : "Deactivate"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/platform/companies")}>
            Back
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === "overview" ? "active" : ""}`}
          type="button"
          onClick={() => setParams({ tab: "overview" })}
        >
          Overview
        </button>
        <button
          className={`tab ${tab === "integrations" ? "active" : ""}`}
          type="button"
          onClick={() => setParams({ tab: "integrations" })}
        >
          Integrations
        </button>
      </div>

      {error ? <Banner>{error}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}

      {tab === "overview" ? (
        <form className="panel stack" onSubmit={saveOverview}>
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
      ) : (
        <div className="stack">
          <div className="spread">
            <p className="muted">A company can have many stores and shipping accounts, including duplicates of the same provider.</p>
            <button className="btn btn-primary" type="button" onClick={() => setEditor({})}>
              + Add Integration
            </button>
          </div>
          {commerce.length === 0 && shipping.length === 0 ? (
            <EmptyState
              title="No integrations configured yet."
              action={
                <button className="btn btn-primary" type="button" onClick={() => setEditor({})}>
                  Add Integration
                </button>
              }
            >
              Add a store or shipping account for this company.
            </EmptyState>
          ) : (
            <>
              <ConnectionList title="Commerce / Stores" rows={commerce} />
              <ConnectionList title="Shipping" rows={shipping} />
            </>
          )}
        </div>
      )}

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
