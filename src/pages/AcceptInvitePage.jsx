import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { acceptPlatformAdminInvite } from "../api/platformAdmins";
import { Banner } from "../components/ui/Feedback.jsx";

export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await acceptPlatformAdminInvite({ token, password });
      setPassword("");
      setConfirm("");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="login-shell">
      <form className="login-card stack" onSubmit={onSubmit}>
        <div>
          <p className="eyebrow">SaaS platform</p>
          <h1>Set your password</h1>
          <p className="muted">Choose a password for your Super Admin account. It is stored only as a secure hash.</p>
        </div>
        {error ? <Banner>{error}</Banner> : null}
        {done ? <Banner tone="ok">Password saved. You can sign in.</Banner> : null}
        {!token ? <Banner>This invitation link is missing its token.</Banner> : null}
        <div className="field">
          <label htmlFor="new-password">Password</label>
          <input
            id="new-password"
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving || !token || done}>
          {saving ? "Saving…" : "Save password"}
        </button>
        <Link to="/login">Back to sign in</Link>
      </form>
    </div>
  );
}
