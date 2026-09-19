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
        <p className="muted">
          EasyOrders requests use the server-controlled API origin. Company credentials
          cannot set a custom API host.
        </p>
      </div>
    </div>
  );
}
