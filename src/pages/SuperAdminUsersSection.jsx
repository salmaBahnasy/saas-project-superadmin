import { useEffect, useState } from "react";
import { deactivatePlatformAdmin, invitePlatformAdmin, listPlatformAdmins } from "../api/platformAdmins";
import { getPlatformUser } from "../auth/session";
import { Banner } from "../components/ui/Feedback.jsx";

export function SuperAdminUsersSection() {
  const current = getPlatformUser();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await listPlatformAdmins();
      setAdmins(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onInvite(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    setInviteLink("");
    try {
      const result = await invitePlatformAdmin({
        name: name.trim(),
        email: email.trim(),
      });
      const path = result?.data?.invitePath || "";
      setInviteLink(path ? `${window.location.origin}${path}` : "");
      setName("");
      setEmail("");
      setNotice("Invitation created. Share the one-time link so they can set a password.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDeactivate(admin) {
    const confirmed = window.confirm(
      `Deactivate ${admin.name || admin.email}? They will lose Super Admin access.`,
    );
    if (!confirmed) return;
    setError("");
    setNotice("");
    try {
      await deactivatePlatformAdmin(admin.id);
      setAdmins((currentAdmins) =>
        currentAdmins.map((row) =>
          row.id === admin.id ? { ...row, isActive: false } : row,
        ),
      );
      setNotice("Super Admin access revoked.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel stack">
      <div>
        <p className="eyebrow">Access</p>
        <h2>Super Admin Users</h2>
        <p className="muted">
          Invite a platform operator by name and email. They set their own password from a one-time link. Passwords are never shown or stored in plain text.
        </p>
      </div>
      {error ? <Banner>{error}</Banner> : null}
      {notice ? <Banner tone="ok">{notice}</Banner> : null}
      {inviteLink ? (
        <div className="field">
          <label htmlFor="invite-link">One-time invitation link</label>
          <input id="invite-link" className="input" readOnly dir="ltr" value={inviteLink} />
        </div>
      ) : null}
      <form className="stack" onSubmit={onInvite}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="admin-name">Full name</label>
            <input
              id="admin-name"
              className="input"
              value={name}
              maxLength={120}
              required
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              className="input"
              type="email"
              value={email}
              required
              dir="ltr"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Add Super Admin"}
        </button>
      </form>
      {loading ? <p className="muted">Loading Super Admins…</p> : null}
      {!loading && admins.length === 0 ? <p className="muted">No Super Admin accounts found.</p> : null}
      {admins.map((admin) => {
        const isSelf = current?.id && admin.id === current.id;
        return (
          <div className="spread" key={admin.id}>
            <div>
              <strong>{admin.name}</strong>
              {isSelf ? <span className="muted"> · You</span> : null}
              <div className="muted" dir="ltr">{admin.email}</div>
              <div className="muted">
                {admin.isActive ? (admin.hasPassword ? "Active" : "Invitation pending") : "Inactive"}
              </div>
            </div>
            {admin.isActive && !isSelf ? (
              <button className="btn btn-danger btn-small" type="button" onClick={() => onDeactivate(admin)}>
                Deactivate
              </button>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
