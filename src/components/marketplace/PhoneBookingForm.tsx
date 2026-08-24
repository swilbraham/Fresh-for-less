"use client";

import { useMemo, useState } from "react";
import { buildQuote, type Basket } from "@/lib/marketplace/pricing";
import { gbp, gbpShort } from "@/lib/marketplace/money";
import type { PriceBundle, PriceItem } from "@/lib/marketplace/types";

const KIND_LABELS: Record<string, string> = {
  carpet: "Carpets & stairs",
  upholstery: "Upholstery",
  extra: "Optional extras",
};

/**
 * Taking a booking while on the phone.
 *
 * The running total updates as items are ticked so the price can be read out
 * mid-call, using the same engine the customer-facing page uses — a phone
 * quote that disagreed with the website would be worse than no quote.
 */
export default function PhoneBookingForm({
  items,
  bundles,
  minimumChargePence,
  commissionPct,
  protectionPct,
  protectionEnabled,
}: {
  items: PriceItem[];
  bundles: PriceBundle[];
  minimumChargePence: number;
  commissionPct: number;
  protectionPct: number;
  protectionEnabled: boolean;
}) {
  const [basket, setBasket] = useState<Basket>({});
  const [protection, setProtection] = useState(false);

  const quote = useMemo(
    () =>
      buildQuote(basket, items, bundles, {
        minimumChargePence,
        commissionPct,
        protectionPct,
        protection: protection && protectionEnabled,
      }),
    [basket, items, bundles, minimumChargePence, commissionPct, protectionPct, protection, protectionEnabled]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PriceItem[]>();
    for (const item of items) {
      const list = map.get(item.kind) ?? [];
      list.push(item);
      map.set(item.kind, list);
    }
    return [...map.entries()];
  }, [items]);

  const setQty = (code: string, qty: number) =>
    setBasket((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[code];
      else next[code] = qty;
      return next;
    });

  return (
    <>
      {grouped.map(([kind, kindItems]) => (
        <section key={kind} className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {KIND_LABELS[kind] ?? kind}
          </h3>
          <ul className="mt-2 divide-y divide-slate-100">
            {kindItems.map((item) => {
              const qty = basket[item.code] ?? 0;
              return (
                <li key={item.code} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sm text-slate-700">
                    {item.label}{" "}
                    <span className="text-slate-400">
                      {gbpShort(item.unit_price_pence)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Remove one ${item.label}`}
                      onClick={() => setQty(item.code, qty - 1)}
                      disabled={qty === 0}
                      className="h-8 w-8 rounded-lg border border-slate-300 font-bold text-slate-600 disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-semibold tabular-nums">{qty}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${item.label}`}
                      onClick={() => setQty(item.code, Math.min(qty + 1, item.max_qty))}
                      className="h-8 w-8 rounded-lg border border-slate-300 font-bold text-slate-600"
                    >
                      +
                    </button>
                    <input type="hidden" name={`qty-${item.code}`} value={qty} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {protectionEnabled && (
        <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-accent-200 bg-accent-50/50 p-3 text-sm">
          <input
            type="checkbox"
            name="protection"
            checked={protection}
            onChange={(e) => setProtection(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-accent-600"
          />
          Add stain guard ({protectionPct}% —{" "}
          {gbp(Math.round((quote.cleaning_pence * protectionPct) / 100))})
        </label>
      )}

      <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Price to quote
        </p>
        <p className="text-3xl font-bold tabular-nums">{gbp(quote.total_pence)}</p>
        {quote.minimum_applied && (
          <p className="mt-1 text-xs text-slate-400">
            Minimum charge of {gbpShort(minimumChargePence)} applied.
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          Commission {gbp(quote.commission_pence)} · cleaner keeps{" "}
          {gbp(quote.total_pence - quote.commission_pence)}
        </p>
      </div>
    </>
  );
}
