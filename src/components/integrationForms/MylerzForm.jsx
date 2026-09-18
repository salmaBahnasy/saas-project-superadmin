import { SecretField } from "../ui/SecretField.jsx";

export function MylerzForm({ values, onChange, existing }) {
  return (
    <div className="stack">
      <SecretField
        label="API Key"
        name="apiKey"
        configured={Boolean(existing?.configured)}
        masked={existing?.apiKeyMasked}
        value={values.apiKey}
        replacing={values.replaceApiKey}
        onReplace={() => onChange({ replaceApiKey: true, apiKey: "" })}
        onCancelReplace={() => onChange({ replaceApiKey: false, apiKey: "" })}
        onChange={(apiKey) => onChange({ apiKey })}
      />
      <div className="field">
        <label htmlFor="mylerzAccessToken">Access token (optional)</label>
        <input
          id="mylerzAccessToken"
          className="input"
          type="password"
          autoComplete="off"
          value={values.accessToken}
          onChange={(event) => onChange({ accessToken: event.target.value })}
        />
      </div>
    </div>
  );
}
