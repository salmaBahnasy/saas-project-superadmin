export function summaryLabel(row) {
  if (!row) return "Not connected";
  if (!row.connected || !row.connections) return "Not connected";
  if (row.connections > 1) return `${row.connections} connections`;
  return "Connected";
}

export const FEATURE_GROUP_LABELS = {
  core: "Core features",
  operational: "Operational features",
  legacy: "Legacy / provider flags",
  other: "Other",
};

export const FEATURE_GROUP_HINTS = {
  core: "These control the Company Dashboard modules this tenant can use.",
  operational: "Enable Bosta shipping tools and WhatsApp actions independently of store connections.",
  legacy:
    "These flags are not required to connect Shopify, Salla, or EasyOrders. Company admins manage store connections in the Company Dashboard.",
  other: "Reserved catalog flags.",
};
