import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCompanies } from "../api/companies";
import { listCompanyIntegrations } from "../api/companyIntegrations";
import { Banner } from "../components/ui/Feedback.jsx";

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const companiesRes = await listCompanies();
        const companies = companiesRes.data || [];
        const integrationLists = await Promise.all(
          companies.map(async (company) => {
            const result = await listCompanyIntegrations(company.id);
            return result.data || [];
          }),
        );
        if (cancelled) return;
        setStats({
          totalCompanies: companies.length,
          activeCompanies: companies.filter((row) => row.is_active !== false).length,
          inactiveCompanies: companies.filter((row) => row.is_active === false).length,
          totalIntegrations: integrationLists.reduce((sum, rows) => sum + rows.length, 0),
        });
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

  if (loading) return <p className="muted">Loading dashboard…</p>;
  if (error) return <Banner>{error}</Banner>;

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Platform dashboard</h1>
        </div>
        <Link className="btn btn-primary" to="/platform/companies/new">
          + Add company
        </Link>
      </div>
      <div className="cards">
        <div className="card">
          <div className="muted">Total companies</div>
          <div className="stat">{stats.totalCompanies}</div>
        </div>
        <div className="card">
          <div className="muted">Active companies</div>
          <div className="stat">{stats.activeCompanies}</div>
        </div>
        <div className="card">
          <div className="muted">Inactive companies</div>
          <div className="stat">{stats.inactiveCompanies}</div>
        </div>
        <div className="card">
          <div className="muted">Integration connections</div>
          <div className="stat">{stats.totalIntegrations}</div>
        </div>
      </div>
    </div>
  );
}
