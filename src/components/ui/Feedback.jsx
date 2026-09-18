export function Banner({ tone = "error", children }) {
  if (!children) return null;
  return <div className={`banner banner-${tone}`}>{children}</div>;
}

export function StatusBadge({ active, onLabel = "Active", offLabel = "Disabled" }) {
  return (
    <span className={`badge ${active ? "badge-ok" : "badge-off"}`}>
      {active ? onLabel : offLabel}
    </span>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p className="muted">{children}</p>
      {action}
    </div>
  );
}
