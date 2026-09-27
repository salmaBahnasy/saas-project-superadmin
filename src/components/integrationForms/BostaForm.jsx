import { SecretField } from "../ui/SecretField.jsx";

export function BostaForm({ values, onChange, existing }) {
  const mode = String(values.bostaMode || existing?.bostaMode || "").trim() || (existing ? "fulfillment" : "");
  const isShipping = mode === "shipping";
  const isFulfillment = mode === "fulfillment";

  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="bostaMode">Bosta mode</label>
        <select
          id="bostaMode"
          className="input"
          value={mode}
          onChange={(event) => onChange({ bostaMode: event.target.value })}
          required={!existing}
        >
          {!existing ? <option value="">Select mode</option> : null}
          <option value="shipping">Shipping only</option>
          <option value="fulfillment">Fulfillment</option>
        </select>
      </div>
      {isShipping ? (
        <SecretField
          label="Bosta Business API Key"
          name="apiKey"
          configured={Boolean(existing?.configured)}
          masked={existing?.apiKeyMasked}
          value={values.apiKey}
          replacing={values.replaceApiKey}
          onReplace={() => onChange({ replaceApiKey: true, apiKey: "" })}
          onCancelReplace={() => onChange({ replaceApiKey: false, apiKey: "" })}
          onChange={(apiKey) => onChange({ apiKey })}
        />
      ) : null}
      {isFulfillment ? (
        <>
          <div className="field">
            <label htmlFor="fulfillmentApiKey">Fulfillment API key</label>
            <input
              id="fulfillmentApiKey"
              className="input"
              type="password"
              autoComplete="off"
              value={values.fulfillmentApiKey}
              onChange={(event) => onChange({ fulfillmentApiKey: event.target.value })}
            />
          </div>
          <details>
            <summary>Legacy shipping API key (optional)</summary>
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
          </details>
        </>
      ) : null}
    </div>
  );
}
