import { useNavigate } from "react-router-dom";
import { clearPlatformSession, getPlatformUser } from "../auth/session";
import { getApiBaseUrl } from "../api/client";
import { SuperAdminUsersSection } from "./SuperAdminUsersSection.jsx";

export function SettingsPage() {
  const navigate = useNavigate();
  const user = getPlatformUser();

  function logout() {
    clearPlatformSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="stack" style={{ maxWidth: 760 }}>
      <div className="panel stack">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Settings</h1>
        </div>
        <div>
          <div className="muted">Super Admin</div>
          <strong>{user?.name || "Platform operator"}</strong>
          <div>{user?.email}</div>
        </div>
        <div>
          <div className="muted">API base URL</div>
          <code>{getApiBaseUrl() || "not configured"}</code>
        </div>
        <button className="btn btn-danger" type="button" onClick={logout}>
          Logout
        </button>
      </div>
      <SuperAdminUsersSection />
    </div>
  );
}
