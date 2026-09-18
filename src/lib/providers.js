export const COMMERCE_PROVIDERS = [
  { id: "easyorders", label: "EasyOrders" },
  { id: "shopify", label: "Shopify" },
  { id: "salla", label: "Salla" },
];

export const SHIPPING_PROVIDERS = [
  { id: "bosta", label: "Bosta" },
  { id: "mylerz", label: "Mylerz" },
];

export function providerLabel(provider) {
  return (
    [...COMMERCE_PROVIDERS, ...SHIPPING_PROVIDERS].find((item) => item.id === provider)
      ?.label || provider
  );
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
