import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCompanies } from "../api/companies";
import { listCompanyIntegrations } from "../api/companyIntegrations";
import { Banner, StatusBadge } from "../components/ui/Feedback.jsx";
import { providerLabel } from "../lib/providers";

export function IntegrationsOverviewPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const companiesRes = await listCompanies();
        const companies = companiesRes.data || [];
        const all = [];
        for (const company of companies) {
          const integrations = await listCompanyIntegrations(company.id);
          for (const connection of integrations.data || []) {
            all.push({ ...connection, companyName: company.name, companyId: company.id });
          }
        }
        if (!cancelled) setRows(all);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Connections</p>
        <h1>Integrations</h1>
        <p className="muted">Every store and shipping account across companies.</p>
      </div>
      {error ? <Banner>{error}</Banner> : null}
      {loading ? (
        <p className="muted">Loading integrations…</p>
      ) : (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Connection</th>
                <th>Category</th>
                <th>Provider</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.companyName}</td>
                  <td>{row.name}</td>
                  <td>{row.category}</td>
                  <td>{providerLabel(row.provider)}</td>
                  <td>
                    <StatusBadge active={row.enabled} />
                  </td>
                  <td>
                    <Link className="btn btn-secondary btn-small" to={`/platform/companies/${row.companyId}?tab=integrations`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="empty">No integrations configured yet.</p> : null}
        </div>
      )}
    </div>
  );
}
