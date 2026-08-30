import type { PriceBundle, PriceItem, Quote, QuoteLine } from "./types";

export type Basket = Record<string, number>;

/** Extra item codes a bundle also covers, stored as a comma-separated list. */
function codesIn(list: string | undefined): string[] {
  return (list ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}


/** One unit of one item, so a bundle can span more than one item code. */
type Unit = { code: string; price: number };

/**
 * Cheapest way to buy a pool of units that share a bundle.
 *
 * "3 areas for £99" covers rooms and staircases alike, so the DP runs over the
 * pooled units rather than one item at a time. Units are sorted dearest first
 * so a bundle always absorbs the most expensive ones — anything else would
 * quote a customer more than they need to pay.
 *
 * The bundle price is split back across the units that formed it, so each item
 * still gets one line at a sensible figure and the lines sum to the total.
 * Pennies that won't divide evenly go to the earliest (dearest) unit.
 */
function cheapestForGroup(
  units: Unit[],
  bundles: PriceBundle[]
): { pence: number; usedBundles: PriceBundle[]; perCode: Record<string, number>; singles: number } {
  const n = units.length;
  const best: number[] = new Array(n + 1).fill(Infinity);
  const choice: (PriceBundle | null)[] = new Array(n + 1).fill(null);
  best[0] = 0;

  for (let i = 1; i <= n; i++) {
    best[i] = best[i - 1] + units[i - 1].price;
    choice[i] = null;
    for (const bundle of bundles) {
      if (bundle.qty > i) continue;
      const candidate = best[i - bundle.qty] + bundle.price_pence;
      if (candidate < best[i]) {
        best[i] = candidate;
        choice[i] = bundle;
      }
    }
  }

  const perCode: Record<string, number> = {};
  const usedBundles: PriceBundle[] = [];
  let singles = 0;
  let i = n;
  while (i > 0) {
    const picked = choice[i];
    if (picked) {
      usedBundles.push(picked);
      const covered = units.slice(i - picked.qty, i);
      const share = Math.floor(picked.price_pence / picked.qty);
      let left = picked.price_pence - share * covered.length;
      for (const unit of covered) {
        const extra = left > 0 ? 1 : 0;
        left -= extra;
        perCode[unit.code] = (perCode[unit.code] ?? 0) + share + extra;
      }
      i -= picked.qty;
    } else {
      const unit = units[i - 1];
      perCode[unit.code] = (perCode[unit.code] ?? 0) + unit.price;
      singles += 1;
      i -= 1;
    }
  }

  return { pence: best[n], usedBundles, perCode, singles };
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

  const wanted = new Map<string, { item: PriceItem; qty: number }>();
  for (const item of ordered) {
    if (!item.active) continue;
    const requested = Math.floor(Number(basket[item.code] ?? 0));
    if (!Number.isFinite(requested) || requested <= 0) continue;
    wanted.set(item.code, { item, qty: Math.min(requested, item.max_qty) });
  }

  // Which codes each bundle can draw on. An item belongs to at most one group:
  // the first bundle that names it claims it, so nothing is counted twice.
  const activeBundles = bundles.filter((b) => b.active);
  const claimed = new Set<string>();
  const groups: { codes: string[]; bundles: PriceBundle[] }[] = [];
  for (const bundle of activeBundles) {
    const codes = [bundle.item_code, ...codesIn(bundle.applies_to)].filter(
      (code, i, all) => all.indexOf(code) === i && !claimed.has(code)
    );
    if (codes.length === 0) continue;
    const existing = groups.find((g) => g.codes.some((c) => codes.includes(c)));
    if (existing) {
      existing.bundles.push(bundle);
      continue;
    }
    codes.forEach((c) => claimed.add(c));
    groups.push({ codes, bundles: [bundle] });
  }

  const amounts = new Map<string, number>();
  const notes = new Map<string, string>();

  for (const group of groups) {
    const members = group.codes
      .map((code) => wanted.get(code))
      .filter((m): m is { item: PriceItem; qty: number } => Boolean(m));
    if (members.length === 0) continue;

    const units: Unit[] = members.flatMap(({ item, qty }) =>
      Array.from({ length: qty }, () => ({
        code: item.code,
        price: item.unit_price_pence,
      }))
    );
    units.sort((a, b) => b.price - a.price);

    const usable = group.bundles.filter((b) => b.qty <= units.length);
    const { pence, usedBundles, perCode } = cheapestForGroup(units, usable);

    subtotal += pence;
    for (const { item, qty } of members) {
      listPrice += qty * item.unit_price_pence;
      amounts.set(item.code, perCode[item.code] ?? 0);
    }
    // The note goes on the first line of the group, not every line.
    if (usedBundles.length) {
      const first = members[0].item.code;
      notes.set(first, usedBundles.map((b) => b.label).join(" + "));
    }
  }

  // Anything no bundle covers is priced on its own, exactly as before.
  for (const [code, { item, qty }] of wanted) {
    if (amounts.has(code)) continue;
    const pence = qty * item.unit_price_pence;
    listPrice += pence;
    subtotal += pence;
    amounts.set(code, pence);
  }

  for (const item of ordered) {
    const entry = wanted.get(item.code);
    if (!entry) continue;
    lines.push({
      code: item.code,
      label: item.label,
      qty: entry.qty,
      amount_pence: amounts.get(item.code) ?? 0,
      note: notes.get(item.code) ?? "",
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
