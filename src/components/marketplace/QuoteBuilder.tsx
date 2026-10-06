"use client";

import { useMemo, useState } from "react";
import { buildQuote, type Basket } from "@/lib/marketplace/pricing";
import { gbp, gbpShort } from "@/lib/marketplace/money";
import type { PriceBundle, PriceItem } from "@/lib/marketplace/types";
import SubmitButton from "@/components/marketplace/SubmitButton";

/**
 * The office's own calculator, for quoting while somebody is on the phone.
 *
 * Prices as you type using the same function the booking form uses, so the
 * figure read out on the call is the figure the customer will be texted and
 * then charged. The agreed-price box is for the part of a phone call a price
 * list cannot do — "call it £120" — and it is kept as an explicit override
 * rather than quietly editing line prices, so the discount stays visible.
 */
export default function QuoteBuilder({
  action,
  items,
  bundles,
  minimumChargePence,
  commissionPct,
  protectionPct,
  protectionEnabled,
  initialBasket = {},
  initialProtection = false,
  initialOverridePence = 0,
  submitLabel,
  children,
}: {
  action: (data: FormData) => void | Promise<void>;
  items: PriceItem[];
  bundles: PriceBundle[];
  minimumChargePence: number;
  commissionPct: number;
  protectionPct: number;
  protectionEnabled: boolean;
  initialBasket?: Basket;
  initialProtection?: boolean;
  initialOverridePence?: number;
  submitLabel: string;
  /** The customer fields, which differ between creating and amending. */
  children: React.ReactNode;
}) {
  const [basket, setBasket] = useState<Basket>(initialBasket);
  const [protection, setProtection] = useState(initialProtection);
  const [agreed, setAgreed] = useState(
    initialOverridePence > 0 ? (initialOverridePence / 100).toFixed(2) : ""
  );

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

  const agreedPence = Math.round(Number(agreed) * 100);
  const override = Number.isFinite(agreedPence) && agreedPence > 0 ? agreedPence : 0;
  const charged = override > 0 ? override : quote.total_pence;
  const difference = override > 0 ? override - quote.total_pence : 0;

  const grouped = new Map<string, PriceItem[]>();
  for (const item of items) {
    grouped.set(item.kind || "Other", [...(grouped.get(item.kind || "Other") ?? []), item]);
  }

  function setQty(code: string, qty: number) {
    setBasket((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[code];
      else next[code] = qty;
      return next;
    });
  }

  return (
    <form action={action} className="mt-4 space-y-5">
      {children}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {[...grouped.entries()].map(([kind, list]) => (
            <div key={kind}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {kind}
              </h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {list.map((item) => {
                  const qty = Number(basket[item.code] ?? 0);
                  return (
                    <div
                      key={item.code}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${
                        qty > 0 ? "border-accent-300 bg-accent-50/50" : "border-slate-200"
                      }`}
                    >
                      <span className="text-slate-700">
                        {item.label}{" "}
                        <span className="text-slate-400">
                          {gbpShort(item.unit_price_pence)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQty(item.code, qty - 1)}
                          aria-label={`One fewer ${item.label}`}
                          className="h-7 w-7 rounded-lg border border-slate-300 font-bold text-slate-600 disabled:opacity-30"
                          disabled={qty <= 0}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          name={`qty_${item.code}`}
                          value={qty}
                          min={0}
                          max={item.max_qty || 20}
                          onChange={(e) => setQty(item.code, Math.floor(Number(e.target.value) || 0))}
                          aria-label={`How many ${item.label}`}
                          className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-right tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(item.code, qty + 1)}
                          aria-label={`One more ${item.label}`}
                          className="h-7 w-7 rounded-lg border border-slate-300 font-bold text-slate-600"
                        >
                          +
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* The running total, as the customer will hear it */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-4">
          <h3 className="text-sm font-bold text-slate-900">Their price</h3>

          {quote.lines.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Nothing picked yet.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {quote.lines.map((line) => (
                <li key={line.code} className="flex justify-between gap-3">
                  <span className="text-slate-600">
                    {line.qty > 1 ? `${line.qty} × ` : ""}
                    {line.label}
                    {line.note && (
                      <span className="block text-xs text-accent-700">{line.note}</span>
                    )}
                  </span>
                  <span className="tabular-nums text-slate-800">
                    {gbp(line.amount_pence)}
                  </span>
                </li>
              ))}
              {quote.minimum_applied && (
                <li className="flex justify-between gap-3 text-slate-500">
                  <span>Minimum charge applied</span>
                  <span className="tabular-nums">{gbp(minimumChargePence)}</span>
                </li>
              )}
            </ul>
          )}

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="protection"
              checked={protection}
              onChange={(e) => setProtection(e.target.checked)}
              disabled={!protectionEnabled}
              className="h-4 w-4 rounded border-slate-300 accent-accent-600"
            />
            Stain protection ({protectionPct}%)
          </label>

          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-600">List price</span>
              <span className="tabular-nums text-slate-800">
                {gbp(quote.total_pence)}
              </span>
            </div>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Agreed price (optional)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-slate-500">£</span>
              <input
                name="agreedPrice"
                value={agreed}
                onChange={(e) => setAgreed(e.target.value)}
                inputMode="decimal"
                placeholder="leave blank for list"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
              />
            </div>
            {difference !== 0 && (
              <p
                className={`mt-1 text-xs ${
                  difference < 0 ? "text-amber-700" : "text-accent-700"
                }`}
              >
                {difference < 0
                  ? `${gbp(-difference)} off the list price`
                  : `${gbp(difference)} above the list price`}
              </p>
            )}

            <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-900">They pay</span>
              <span className="text-2xl font-bold tabular-nums text-accent-700">
                {gbp(charged)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Your commission {gbp(Math.round((charged * commissionPct) / 100))} ·
              cleaner keeps{" "}
              {gbp(charged - Math.round((charged * commissionPct) / 100))}
            </p>
          </div>

          <SubmitButton
            pendingLabel="Working…"
            className="mt-4 w-full rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white transition hover:bg-accent-700 disabled:opacity-40"
          >
            {submitLabel}
          </SubmitButton>
        </aside>
      </div>
    </form>
  );
}
