import { SecretField } from "../ui/SecretField.jsx";

export function ShopifyForm({ values, onChange, existing }) {
  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="shopDomain">Shop domain</label>
        <input
          id="shopDomain"
          className="input"
          value={values.shopDomain}
          onChange={(event) => onChange({ shopDomain: event.target.value })}
          placeholder="store.myshopify.com"
        />
      </div>
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
        <label htmlFor="shopifyApiKey">API key (optional)</label>
        <input
          id="shopifyApiKey"
          className="input"
          type="password"
          autoComplete="off"
          value={values.apiKey}
          onChange={(event) => onChange({ apiKey: event.target.value })}
        />
      </div>
    </div>
  );
}
