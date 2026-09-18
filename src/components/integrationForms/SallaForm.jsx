import { SecretField } from "../ui/SecretField.jsx";

export function SallaForm({ values, onChange, existing }) {
  return (
    <div className="stack">
      <SecretField
        label="Access Token"
        name="accessToken"
        configured={Boolean(existing?.configured)}
        masked={existing?.apiKeyMasked}
        value={values.accessToken}
        replacing={values.replaceAccessToken}
        onReplace={() => onChange({ replaceAccessToken: true, accessToken: "" })}
        onCancelReplace={() => onChange({ replaceAccessToken: false, accessToken: "" })}
        onChange={(accessToken) => onChange({ accessToken })}
      />
      <div className="field">
        <label htmlFor="sallaApiBaseUrl">API base URL (optional)</label>
        <input
          id="sallaApiBaseUrl"
          className="input"
          value={values.apiBaseUrl}
          onChange={(event) => onChange({ apiBaseUrl: event.target.value })}
        />
      </div>
    </div>
  );
}
