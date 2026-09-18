import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loginPlatformAdmin } from "../api/platformAuth";
import { isPlatformAdminSession } from "../auth/session";
import { Banner } from "../components/ui/Feedback.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (isPlatformAdminSession()) {
    return <Navigate to="/platform" replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await loginPlatformAdmin(email, password);
      navigate("/platform", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="login-shell">
      <form className="login-card stack" onSubmit={onSubmit}>
        <div>
          <p className="eyebrow">SaaS platform</p>
          <h1>Super Admin</h1>
          <p className="muted">Sign in with your platform operator account.</p>
        </div>
        {error ? <Banner>{error}</Banner> : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
