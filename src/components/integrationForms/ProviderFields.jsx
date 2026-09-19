import { isMaskedSecretPlaceholder } from "../../lib/shopifyDomain.js";
import { EasyOrdersForm } from "./EasyOrdersForm.jsx";
import { ShopifyForm } from "./ShopifyForm.jsx";
import { SallaForm } from "./SallaForm.jsx";
import { BostaForm } from "./BostaForm.jsx";
import { MylerzForm } from "./MylerzForm.jsx";

export function ProviderFields({ provider, values, onChange, existing }) {
  if (provider === "easyorders") {
    return <EasyOrdersForm values={values} onChange={onChange} existing={existing} />;
  }
  if (provider === "shopify") {
    return <ShopifyForm values={values} onChange={onChange} existing={existing} />;
  }
  if (provider === "salla") {
    return <SallaForm existing={existing} />;
  }
  if (provider === "bosta") {
    return <BostaForm values={values} onChange={onChange} existing={existing} />;
  }
  if (provider === "mylerz") {
    return <MylerzForm values={values} onChange={onChange} existing={existing} />;
  }
  if (provider === "spreadsheet") {
    return <SpreadsheetSourceFields />;
  }
  return <p className="muted">Choose a provider to see its configuration fields.</p>;
}

function SpreadsheetSourceFields() {
  return (
    <p className="muted">
      Historical Data / Spreadsheet sources have no API credentials, OAuth, Access Token,
      or webhooks. They exist so imported historical rows can keep a durable source label.
    </p>
  );
}

export function emptyCredentialState() {
  return {
    apiKey: "",
    accessToken: "",
    fulfillmentApiKey: "",
    shopDomain: "",
    webhookSecret: "",
    replaceApiKey: false,
    replaceAccessToken: false,
    replaceWebhookSecret: false,
  };
}

export function credentialsPayload(values) {
  const credentials = {};
  if (values.apiKey && !isMaskedSecretPlaceholder(values.apiKey)) {
    credentials.apiKey = values.apiKey;
  }
  if (values.accessToken && !isMaskedSecretPlaceholder(values.accessToken)) {
    credentials.accessToken = values.accessToken;
  }
  if (values.fulfillmentApiKey && !isMaskedSecretPlaceholder(values.fulfillmentApiKey)) {
    credentials.fulfillmentApiKey = values.fulfillmentApiKey;
  }
  if (values.shopDomain) credentials.shopDomain = values.shopDomain;
  if (values.webhookSecret && !isMaskedSecretPlaceholder(values.webhookSecret)) {
    credentials.webhookSecret = values.webhookSecret;
  }
  return credentials;
}
