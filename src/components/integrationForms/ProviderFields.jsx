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
    return <SallaForm values={values} onChange={onChange} existing={existing} />;
  }
  if (provider === "bosta") {
    return <BostaForm values={values} onChange={onChange} existing={existing} />;
  }
  if (provider === "mylerz") {
    return <MylerzForm values={values} onChange={onChange} existing={existing} />;
  }
  return <p className="muted">Choose a provider to see its configuration fields.</p>;
}

export function emptyCredentialState() {
  return {
    apiKey: "",
    accessToken: "",
    fulfillmentApiKey: "",
    apiBaseUrl: "",
    shopDomain: "",
    replaceApiKey: false,
    replaceAccessToken: false,
  };
}

export function credentialsPayload(values) {
  const credentials = {};
  if (values.apiKey) credentials.apiKey = values.apiKey;
  if (values.accessToken) credentials.accessToken = values.accessToken;
  if (values.fulfillmentApiKey) credentials.fulfillmentApiKey = values.fulfillmentApiKey;
  if (values.apiBaseUrl) credentials.apiBaseUrl = values.apiBaseUrl;
  if (values.shopDomain) credentials.shopDomain = values.shopDomain;
  return credentials;
}
