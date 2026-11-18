import { useEffect, useState } from "react";
import { getSignupAccessSetting, updateSignupAccessSetting } from "../api/signupAccess";
import { Banner } from "../components/ui/Feedback.jsx";

export function NewCompanyAccessSection() {
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getSignupAccessSetting({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        const next = result?.data?.newCompanyAccountStatus;
        setStatus(next === "active" ? "active" : "pending");
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    return () => controller.abort();
  }, []);

  async function onToggle() {
    if (!status || saving) return;
    const next = status === "active" ? "pending" : "active";
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError("");
    try {
      const result = await updateSignupAccessSetting(next);
      const saved = result?.data?.newCompanyAccountStatus;
      setStatus(saved === "active" ? "active" : "pending");
    } catch (err) {
      setStatus(previous);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const immediate = status === "active";

  return (
    <section className="panel stack">
      <div>
        <p className="eyebrow">Signup</p>
        <h2>New company access</h2>
        <p className="muted">
          Choose the status a company gets after its first registration.
        </p>
      </div>
      {error ? <Banner>{error}</Banner> : null}
      <div className="spread">
        <div>
          <strong>
            {status == null
              ? "Loading signup access…"
              : immediate
                ? "Active immediately"
                : "Pending review"}
          </strong>
          <div className="muted">
            {status == null
              ? "The current setting is loading."
              : immediate
                ? "A new company can open the dashboard right after signup."
                : "A new company sees the review screen until you activate it."}
          </div>
        </div>
        <button
          className="switch"
          type="button"
          role="switch"
          aria-checked={immediate}
          aria-label="Open the dashboard immediately after signup"
          disabled={status == null || saving}
          onClick={onToggle}
        >
          <span />
        </button>
      </div>
    </section>
  );
}
