import { useEffect, useState } from "react";
import { getCompanyDeletionReadiness } from "../../api/companies";
import { canReviewDeletion, deletionBlockerMessages } from "../../lib/companyDeletion";

export function PermanentDeleteCompanyModal({ company, onClose }) {
  const [typedSlug, setTypedSlug] = useState("");
  const [readiness, setReadiness] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    getCompanyDeletionReadiness(company.id)
      .then(result => { if (mounted) setReadiness(result.data); })
      .catch(err => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [company.id]);
  async function review(event) {
    event.preventDefault();
    if (!canReviewDeletion(company, typedSlug, loading)) return;
    setLoading(true);
    setError("");
    try {
      const result = await getCompanyDeletionReadiness(company.id);
      setReadiness(result.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return (
    <div className="modal-backdrop" onClick={onClose} onKeyDown={event => { if (event.key === "Escape") onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="company-deletion-title" onClick={event => event.stopPropagation()}>
        <div className="spread">
          <h2 id="company-deletion-title">Permanently delete {company.name}</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        <p>Permanent deletion would remove this company and its tenant data. It cannot be undone through the app.</p>
        <p role="status">Foundation preview only. Permanent deletion remains disabled; no job or company lock will be started.</p>
        {error ? <p role="alert">{error}</p> : null}
        <div aria-live="polite">
          {loading ? <p>Checking readiness…</p> : null}
          {readiness?.blockers?.length ? <ul>{readiness.blockers.map(code =>
            <li key={code}>{deletionBlockerMessages[code] || "Deletion readiness requires further verification."}</li>
          )}</ul> : null}
        </div>
        <form onSubmit={review}>
          <label htmlFor="company-deletion-slug">Type the exact company slug: <strong>{company.slug}</strong></label>
          <input id="company-deletion-slug" className="input" autoFocus autoComplete="off" spellCheck={false}
            value={typedSlug} onChange={event => setTypedSlug(event.target.value)} />
          <div className="wrap" style={{ marginTop: 16 }}>
            <button className="btn btn-secondary" type="submit" disabled={!canReviewDeletion(company, typedSlug, loading)}>Confirm readiness review</button>
            <button className="btn btn-danger" type="button" disabled>Permanent deletion disabled</button>
          </div>
        </form>
      </div>
    </div>
  );
}
