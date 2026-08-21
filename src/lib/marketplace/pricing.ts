import type { PriceBundle, PriceItem, Quote, QuoteLine } from "./types";

export type Basket = Record<string, number>;

/**
 * Work out the cheapest way to buy `qty` of one item given its unit price and
 * any fixed-price bundles ("4 rooms for £99").
 *
 * Quantities are small (max_qty caps at ~12) so an exact dynamic-programming
 * pass is both trivially cheap and avoids the surprises a greedy rule produces
 * when two overlapping bundles exist.
 */
function cheapestFor(
  qty: number,
  unitPence: number,
  bundles: PriceBundle[]
): { pence: number; usedBundles: PriceBundle[]; singles: number } {
  const best: number[] = new Array(qty + 1).fill(Infinity);
  const choice: (PriceBundle | null)[] = new Array(qty + 1).fill(null);
  best[0] = 0;

  for (let n = 1; n <= qty; n++) {
    best[n] = best[n - 1] + unitPence;
    choice[n] = null;
    for (const bundle of bundles) {
      if (bundle.qty > n) continue;
      const candidate = best[n - bundle.qty] + bundle.price_pence;
      if (candidate < best[n]) {
        best[n] = candidate;
        choice[n] = bundle;
      }
    }
  }

  const usedBundles: PriceBundle[] = [];
  let singles = 0;
  let n = qty;
  while (n > 0) {
    const picked = choice[n];
    if (picked) {
      usedBundles.push(picked);
      n -= picked.qty;
    } else {
      singles += 1;
      n -= 1;
    }
  }

  return { pence: best[qty], usedBundles, singles };
}

/**
 * Turn a basket of quantities into the instant fixed price the customer sees.
 * Every figure comes from the admin-controlled national price list.
 */
export function buildQuote(
  basket: Basket,
  items: PriceItem[],
  bundles: PriceBundle[],
  opts: {
    minimumChargePence: number;
    commissionPct: number;
    /** Stain guard as a percentage of the cleaning total. */
    protectionPct?: number;
    /** Whether the customer has opted into stain guard. */
    protection?: boolean;
  }
): Quote {
  const lines: QuoteLine[] = [];
  let subtotal = 0;
  let listPrice = 0;

  const ordered = [...items].sort((a, b) => a.sort - b.sort);

  for (const item of ordered) {
    if (!item.active) continue;
    const requested = Math.floor(Number(basket[item.code] ?? 0));
    if (!Number.isFinite(requested) || requested <= 0) continue;
    const qty = Math.min(requested, item.max_qty);

    const itemBundles = bundles.filter(
      (b) => b.active && b.item_code === item.code && b.qty <= qty
    );
    const { pence, usedBundles, singles } = cheapestFor(
      qty,
      item.unit_price_pence,
      itemBundles
    );

    listPrice += qty * item.unit_price_pence;
    subtotal += pence;

    const bundleNote = usedBundles.length
      ? usedBundles.map((b) => b.label).join(" + ") +
        (singles > 0 ? ` + ${singles} at ${item.unit_price_pence / 100} each` : "")
      : "";

    lines.push({
      code: item.code,
      label: item.label,
      qty,
      amount_pence: pence,
      note: bundleNote,
    });
  }

  const minimumApplied = subtotal > 0 && subtotal < opts.minimumChargePence;

  // The minimum applies to the cleaning itself; stain guard is charged on top
  // of whatever the clean actually comes to.
  const cleaning = subtotal === 0
    ? 0
    : Math.max(subtotal, opts.minimumChargePence);

  const protectionPct = opts.protectionPct ?? 0;
  const protection =
    opts.protection && cleaning > 0
      ? Math.round((cleaning * protectionPct) / 100)
      : 0;

  if (protection > 0) {
    lines.push({
      code: "protection",
      label: "Stain guard",
      qty: 1,
      amount_pence: protection,
      note: `${protectionPct}% of the clean — carpets and upholstery`,
    });
  }

  const total = cleaning + protection;
  const commissionPence = Math.round((total * opts.commissionPct) / 100);

  return {
    lines,
    subtotal_pence: subtotal,
    minimum_applied: minimumApplied,
    cleaning_pence: cleaning,
    protection_pence: protection,
    total_pence: total,
    commission_pct: opts.commissionPct,
    commission_pence: commissionPence,
    savings_pence: Math.max(0, listPrice - subtotal),
  };
}
