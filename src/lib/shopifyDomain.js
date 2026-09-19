const CANONICAL_SHOP_DOMAIN_RE =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.myshopify\.com$/;

export function looksLikeShopifyShopDomain(input) {
  const raw = String(input || "").trim();
  if (!raw) return false;
  try {
    const withProtocol = /:\/\//.test(raw) ? raw : `https://${raw}`;
    const hostname = String(new URL(withProtocol).hostname || "")
      .trim()
      .toLowerCase();
    return CANONICAL_SHOP_DOMAIN_RE.test(hostname);
  } catch {
    return false;
  }
}

export function isMaskedSecretPlaceholder(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  if (/^\*+$/.test(text)) return true;
  if (/^\*{4}.{1,8}$/.test(text)) return true;
  return false;
}
