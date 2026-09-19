import { SecretField } from "../ui/SecretField.jsx";

export function ShopifyForm({ values, onChange, existing }) {
  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="shopDomain">Shop domain</label>
        <input
          id="shopDomain"
          className="input"
          required={!existing}
          value={values.shopDomain}
          onChange={(event) => onChange({ shopDomain: event.target.value })}
          placeholder="store.myshopify.com"
        />
        <p className="help-text">
          Paste <code>store.myshopify.com</code> or{" "}
          <code>https://store.myshopify.com/admin</code>. It is saved as the
          canonical hostname only.
        </p>
        {existing?.shopDomain ? (
          <p className="help-text">Saved as {existing.shopDomain}.</p>
        ) : null}
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
      <SecretField
        label="Webhook HMAC secret"
        name="webhookSecret"
        configured={Boolean(existing?.webhookSecretConfigured)}
        masked={existing?.webhookSecretMasked}
        value={values.webhookSecret}
        replacing={values.replaceWebhookSecret}
        onReplace={() => onChange({ replaceWebhookSecret: true, webhookSecret: "" })}
        onCancelReplace={() =>
          onChange({ replaceWebhookSecret: false, webhookSecret: "" })
        }
        onChange={(webhookSecret) => onChange({ webhookSecret })}
      />
      <p className="help-text">
        Custom app Admin API token needs read scopes only:{" "}
        <code>read_products</code> for catalog sync, <code>read_orders</code> for
        recent orders, and <code>read_all_orders</code> for orders older than 60
        days. Do not grant write scopes.
      </p>
    </div>
  );
}
