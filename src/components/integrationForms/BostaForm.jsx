import { SecretField } from "../ui/SecretField.jsx";

export function BostaForm({ values, onChange, existing }) {
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
        <label htmlFor="fulfillmentApiKey">Fulfillment API key (optional)</label>
        <input
          id="fulfillmentApiKey"
          className="input"
          type="password"
          autoComplete="off"
          value={values.fulfillmentApiKey}
          onChange={(event) => onChange({ fulfillmentApiKey: event.target.value })}
        />
      </div>
    </div>
  );
}
