import type { Listing } from "./api/types";

/**
 * Per-unit price for a bulk listing at a given quantity — the highest tier
 * whose minQty is covered wins; falls back to the base price. Mirrors the
 * backend's `unitPriceFor` (src/utils/pricing.js) and the app's
 * `Listing.unitPriceFor`.
 */
export function unitPriceFor(listing: Listing, quantity: number): number {
  const base = Number(listing.price || 0);
  const tiers = listing.priceTiers;
  if (!tiers || !tiers.length) return base;

  let best = base;
  let bestMin = 0;
  for (const tier of tiers) {
    if (quantity >= tier.minQty && tier.minQty >= bestMin) {
      best = tier.unitPrice;
      bestMin = tier.minQty;
    }
  }
  return best;
}

export function lineTotalFor(listing: Listing, quantity: number): number {
  return Math.round(unitPriceFor(listing, quantity) * quantity * 100) / 100;
}

/** Cheapest advertised per-unit price (base or any tier), for "from ₹x/unit". */
export function lowestUnitPrice(listing: Listing): number {
  const base = Number(listing.price || 0);
  if (!listing.priceTiers?.length) return base;
  return listing.priceTiers.reduce(
    (low, tier) => (tier.unitPrice < low ? tier.unitPrice : low),
    base,
  );
}

/** Clamp a requested quantity to a bulk listing's MOQ/stock rules. */
export function clampQuantity(listing: Listing, requested: number): number {
  if (!listing.isBulk) return 1;
  let qty = Math.max(Number(requested) || listing.moq || 1, listing.moq || 1);
  if (listing.stock != null) qty = Math.min(qty, listing.stock);
  return qty;
}
