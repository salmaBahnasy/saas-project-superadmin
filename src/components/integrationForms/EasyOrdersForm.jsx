import { SecretField } from "../ui/SecretField.jsx";

export function EasyOrdersForm({ values, onChange, existing }) {
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
        <label htmlFor="apiBaseUrl">API base URL (optional)</label>
        <input
          id="apiBaseUrl"
          className="input"
          value={values.apiBaseUrl}
          onChange={(event) => onChange({ apiBaseUrl: event.target.value })}
          placeholder="https://api.easy-orders.net/api/v1/external-apps"
        />
      </div>
    </div>
  );
}
