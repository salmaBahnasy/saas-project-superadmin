import { useMemo, useState } from "react";
import { COMMERCE_PROVIDERS, SHIPPING_PROVIDERS } from "../../lib/providers";
import { looksLikeShopifyShopDomain } from "../../lib/shopifyDomain.js";
import { Banner } from "../ui/Feedback.jsx";
import { Modal } from "../ui/Modal.jsx";
import { ProviderFields, credentialsPayload, emptyCredentialState } from "./ProviderFields.jsx";

export function IntegrationEditor({
  company,
  existing,
  onClose,
  onSubmit,
  error,
  saving,
}) {
  const [category, setCategory] = useState(existing?.category || "commerce");
  const [provider, setProvider] = useState(existing?.provider || "easyorders");
  const [name, setName] = useState(existing?.name || "");
  const [enabled, setEnabled] = useState(existing ? Boolean(existing.enabled) : true);
  const [providerAccountId, setProviderAccountId] = useState(
    existing?.providerAccountId || "",
  );
  const [values, setValues] = useState(() => ({
    ...emptyCredentialState(),
    shopDomain: existing?.shopDomain || "",
  }));
  const [formError, setFormError] = useState("");

  const providers = category === "shipping" ? SHIPPING_PROVIDERS : COMMERCE_PROVIDERS;

  const title = existing ? "Edit integration" : "Add integration";

  const patchValues = (patch) => setValues((current) => ({ ...current, ...patch }));

  const selectedProvider = useMemo(
    () => providers.find((item) => item.id === provider)?.id || providers[0]?.id,
    [providers, provider],
  );

  function handleCategory(next) {
    setCategory(next);
    const list = next === "shipping" ? SHIPPING_PROVIDERS : COMMERCE_PROVIDERS;
    setProvider(list[0].id);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    const nextProvider = existing ? existing.provider : selectedProvider;
    if (nextProvider === "spreadsheet") {
      onSubmit({
        name,
        enabled,
      });
      return;
    }
    if (nextProvider === "shopify") {
      const shopDomain = String(values.shopDomain || existing?.shopDomain || "").trim();
      if (!shopDomain) {
        setFormError("Shopify shop domain is required.");
        return;
      }
      if (!looksLikeShopifyShopDomain(shopDomain)) {
        setFormError("Use a myshopify.com shop domain, for example store.myshopify.com.");
        return;
      }
      if (!existing && !String(values.accessToken || "").trim()) {
        setFormError("Shopify Admin API access token is required.");
        return;
      }
      if (!existing && !String(values.webhookSecret || "").trim()) {
        setFormError("Shopify webhook HMAC secret is required.");
        return;
      }
    }
    const credentials = credentialsPayload(values);
    const payload = {
      category,
      provider: existing ? existing.provider : selectedProvider,
      name,
      enabled,
    };
    if (nextProvider !== "salla") {
      payload.providerAccountId = providerAccountId || null;
    }
    if (nextProvider !== "salla" && Object.keys(credentials).length) {
      payload.credentials = credentials;
    }
    onSubmit(payload);
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="stack" onSubmit={handleSubmit}>
        {error ? <Banner>{error}</Banner> : null}
        {formError ? <Banner>{formError}</Banner> : null}
        {!existing ? (
          <>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="input"
                value={category}
                onChange={(event) => handleCategory(event.target.value)}
              >
                <option value="commerce">Commerce / Store</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                className="input"
                value={selectedProvider}
                onChange={(event) => setProvider(event.target.value)}
              >
                {providers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <p className="muted">
            {existing.provider} connection for {company?.name}. Provider and category stay
            attached to this connection.
          </p>
        )}

        <div className="field">
          <label htmlFor="connectionName">Connection name</label>
          <input
            id="connectionName"
            className="input"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={`${company?.name || "Company"} Shopify Egypt`}
          />
        </div>

        <label className="row">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Enabled
        </label>

        <ProviderFields
          provider={existing?.provider || selectedProvider}
          values={values}
          onChange={patchValues}
          existing={existing}
        />

        {(existing?.provider || selectedProvider) !== "salla" &&
        (existing?.provider || selectedProvider) !== "spreadsheet" ? (
        <div className="field">
          <label htmlFor="providerAccountId">Provider account / store id (optional)</label>
          <input
            id="providerAccountId"
            className="input"
            value={providerAccountId}
            onChange={(event) => setProviderAccountId(event.target.value)}
          />
        </div>
        ) : null}

        <div className="row">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : existing ? "Save connection" : "Create connection"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
