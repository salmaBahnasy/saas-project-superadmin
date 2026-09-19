export function SallaForm({ existing }) {
  const status = existing?.authorizationStatus || "pending";
  const merchantName = existing?.merchantName || null;
  const merchantId = existing?.providerAccountId || null;

  return (
    <div className="stack">
      <p className="muted">
        Salla uses Partner App OAuth. Save the connection, then click Connect Salla.
        Do not paste merchant access tokens.
      </p>
      {existing ? (
        <>
          <div className="field">
            <label>Authorization status</label>
            <input className="input" readOnly value={status} />
          </div>
          {merchantName ? (
            <div className="field">
              <label>Merchant / store name</label>
              <input className="input" readOnly value={merchantName} />
            </div>
          ) : null}
          {merchantId ? (
            <div className="field">
              <label>Merchant id</label>
              <input className="input" readOnly value={merchantId} />
            </div>
          ) : null}
        </>
      ) : (
        <p className="muted">
          Creating this connection stores only the name and enabled flag. Authorization
          happens in the browser after you click Connect Salla.
        </p>
      )}
    </div>
  );
}
