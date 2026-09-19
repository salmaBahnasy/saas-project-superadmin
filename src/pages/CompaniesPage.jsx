import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listCompanies, setCompanyActive } from "../api/companies";
import { Banner, StatusBadge } from "../components/ui/Feedback.jsx";
import { formatDate } from "../lib/providers";

export function CompaniesPage() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const companiesRes = await listCompanies();
      setRows(companiesRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.name, row.slug].some((value) => String(value || "").toLowerCase().includes(needle)),
    );
  }, [rows, query]);

  async function toggle(company) {
    try {
      const activating = company.is_active === false;
      if (!activating) {
        const confirmed = window.confirm(
          "Deactivate this company? Employees will not be able to sign in until it is activated again.",
        );
        if (!confirmed) return;
      }
      await setCompanyActive(company.id, activating);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <p className="eyebrow">Tenants</p>
          <h1>Companies</h1>
          <p className="muted">Newest workspaces appear first, including public signups.</p>
        </div>
        <Link className="btn btn-secondary" to="/platform/companies/new">
          Create company manually
        </Link>
      </div>
      <input
        className="input"
        placeholder="Search companies"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {error ? <Banner>{error}</Banner> : null}
      {loading ? (
        <p className="muted">Loading companies…</p>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Integrations</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                  </td>
                  <td>{company.slug}</td>
                  <td>
                    <StatusBadge active={company.is_active !== false} offLabel="Inactive" />
                  </td>
                  <td>{company.integrationsCount ?? 0}</td>
                  <td>{formatDate(company.created_at)}</td>
                  <td>
                    <div className="wrap">
                      <Link className="btn btn-secondary btn-small" to={`/platform/companies/${company.id}`}>
                        View
                      </Link>
                      <Link
                        className="btn btn-secondary btn-small"
                        to={`/platform/companies/${company.id}?tab=branding`}
                      >
                        Edit
                      </Link>
                      <button
                        className={company.is_active === false ? "btn btn-secondary btn-small" : "btn btn-danger btn-small"}
                        type="button"
                        onClick={() => toggle(company)}
                      >
                        {company.is_active === false ? "Activate" : "Deactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? <p className="empty">No companies match this search.</p> : null}
        </div>
      )}
    </div>
  );
}
