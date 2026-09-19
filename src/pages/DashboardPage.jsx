import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCompanies } from "../api/companies";
import { Banner } from "../components/ui/Feedback.jsx";
import { formatDate } from "../lib/providers";

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const companiesRes = await listCompanies();
        const companies = companiesRes.data || [];
        if (cancelled) return;
        setRecent(companies.slice(0, 5));
        setStats({
          totalCompanies: companies.length,
          activeCompanies: companies.filter((row) => row.is_active !== false).length,
          inactiveCompanies: companies.filter((row) => row.is_active === false).length,
          totalIntegrations: companies.reduce(
            (sum, row) => sum + Number(row.integrationsCount || 0),
            0,
          ),
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
        <Link className="btn btn-secondary" to="/platform/companies/new">
          Create company manually
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
      <section className="panel stack">
        <div className="spread">
          <h2>Recent companies</h2>
          <Link to="/platform/companies">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="muted">No companies yet.</p>
        ) : (
          recent.map((company) => (
            <div className="spread" key={company.id}>
              <div>
                <Link to={`/platform/companies/${company.id}`}>
                  <strong>{company.name}</strong>
                </Link>
                <div className="muted">{company.slug}</div>
              </div>
              <span className="muted">{formatDate(company.created_at)}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
