import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCompany } from "../api/companies";
import { Banner } from "../components/ui/Feedback.jsx";
import { slugify } from "../lib/providers";

export function CompanyNewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    is_active: true,
    logo_url: "",
    primary_color: "",
    secondary_color: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function patch(next) {
    setForm((current) => ({ ...current, ...next }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        is_active: form.is_active,
      };
      if (form.logo_url) payload.logo_url = form.logo_url;
      if (form.primary_color) payload.primary_color = form.primary_color;
      if (form.secondary_color) payload.secondary_color = form.secondary_color;
      const created = await createCompany(payload);
      navigate(`/platform/companies/${created.data.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel stack" onSubmit={onSubmit} style={{ maxWidth: 680 }}>
      <div>
        <p className="eyebrow">New tenant</p>
        <h1>Add company</h1>
        <p className="muted">Integrations are added after the company exists.</p>
      </div>
      {error ? <Banner>{error}</Banner> : null}
      <div className="field">
        <label htmlFor="name">Company name</label>
        <input
          id="name"
          className="input"
          required
          value={form.name}
          onChange={(event) =>
            patch({
              name: event.target.value,
              slug: form.slug || slugify(event.target.value),
            })
          }
        />
      </div>
      <div className="field">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          className="input"
          required
          value={form.slug}
          onChange={(event) => patch({ slug: slugify(event.target.value) })}
        />
      </div>
      <label className="row">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => patch({ is_active: event.target.checked })}
        />
        Active
      </label>
      <div className="field">
        <label htmlFor="logo_url">Logo URL</label>
        <input
          id="logo_url"
          className="input"
          value={form.logo_url}
          onChange={(event) => patch({ logo_url: event.target.value })}
        />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="primary_color">Primary color</label>
          <input
            id="primary_color"
            className="input"
            value={form.primary_color}
            onChange={(event) => patch({ primary_color: event.target.value })}
            placeholder="#0f6b57"
          />
        </div>
        <div className="field">
          <label htmlFor="secondary_color">Secondary color</label>
          <input
            id="secondary_color"
            className="input"
            value={form.secondary_color}
            onChange={(event) => patch({ secondary_color: event.target.value })}
            placeholder="#14201b"
          />
        </div>
      </div>
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Creating..." : "Create company"}
      </button>
    </form>
  );
}
