import { NavLink, useNavigate } from "react-router-dom";
import { clearPlatformSession, getPlatformUser } from "../../auth/session";

const links = [
  { to: "/platform", label: "Dashboard", end: true },
  { to: "/platform/companies", label: "Companies" },
  { to: "/platform/integrations", label: "Integrations" },
  { to: "/platform/settings", label: "Settings" },
];

export function PlatformLayout({ children }) {
  const navigate = useNavigate();
  const user = getPlatformUser();

  function logout() {
    clearPlatformSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="eyebrow" style={{ color: "#9ad7c3" }}>SaaS operator</div>
          <h2 style={{ color: "white" }}>Super Admin</h2>
          <small>Platform console</small>
        </div>
        <nav className="nav stack">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <div className="mobile-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <header className="topbar">
          <div>
            <div className="eyebrow">Signed in</div>
            <strong>{user?.name || user?.email || "Platform Super Admin"}</strong>
          </div>
          <button className="btn btn-secondary" type="button" onClick={logout}>
            Logout
          </button>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
