"use client";

import { useMemo, useState } from "react";

/**
 * Quote-request mode's front door: the customer says what needs cleaning —
 * no price anywhere — and up to three covering cleaners text their own
 * figure. Deliberately one scrolling form rather than BookingFlow's steps:
 * with no price to reveal there is nothing to stage.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

type Item = {
  code: string;
  label: string;
  hint: string;
  kind: string;
  max_qty: number;
};

const KIND_LABELS: Record<string, string> = {
  carpet: "Carpets & stairs",
  hardfloor: "Hard floors",
  upholstery: "Upholstery",
  extra: "Anything else",
};

export default function QuoteRequestFlow({
  items,
  maxQuotes,
  initialPostcode = "",
  source = "",
}: {
  items: Item[];
  maxQuotes: number;
  initialPostcode?: string;
  source?: string;
}) {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [covered, setCovered] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sentToken, setSentToken] = useState("");

  const picked = useMemo(
    () => Object.values(basket).reduce((sum, qty) => sum + qty, 0),
    [basket]
  );

  const groups = useMemo(() => {
    const byKind = new Map<string, Item[]>();
    for (const item of items) {
      const list = byKind.get(item.kind) ?? [];
      list.push(item);
      byKind.set(item.kind, list);
    }
    return [...byKind.entries()];
  }, [items]);

  function bump(code: string, delta: number, max: number) {
    setBasket((prev) => {
      const next = { ...prev };
      const qty = Math.max(0, Math.min(max, (next[code] ?? 0) + delta));
      if (qty === 0) delete next[code];
      else next[code] = qty;
      return next;
    });
  }

  async function checkPostcode() {
    setChecking(true);
    setError("");
    try {
      const res = await fetch(
        `/api/marketplace/slots?postcode=${encodeURIComponent(postcode)}`
      );
      const data = await res.json();
      if (!data.ok) {
        setCovered(null);
        setError(data.error ?? "Enter a full UK postcode, e.g. CH41 5AB.");
      } else {
        setCovered(Boolean(data.covered));
      }
    } catch {
      setError("Couldn't check that postcode — please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    setError("");
    if (covered === null) {
      setError("Check your postcode first.");
      return;
    }
    if (picked === 0) {
      setError("Pick at least one thing to clean.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Add your name so the cleaners know who they're quoting.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Add the mobile number your quotes should be texted to.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/marketplace/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode,
          basket,
          notes,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          source,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong — please try again.");
      } else {
        setSentToken(String(data.token ?? ""));
        /**
         * The money event (Schedule) only fires days later, when the customer
         * picks a quote and books. Without this, a campaign optimising on
         * conversions sees almost nothing and buys the cheapest clicks it can
         * find, so the request itself is reported as the Lead.
         */
        if (typeof window.fbq === "function") {
          window.fbq("track", "Lead", {
            content_name: "Quote request",
            content_category: picked > 0 ? `${picked} items` : "quote",
            currency: "GBP",
          });
        }
        if (typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            event_category: "quote_request",
            value: 0,
            currency: "GBP",
          });
        }
      }
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sentToken) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <p className="text-4xl">✅</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            Done — your quotes are on the way
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Up to {maxQuotes} vetted local cleaners will text you their price,
            usually within a few hours. Compare them and book the one you like —
            nothing to pay until the work is done.
          </p>
          <a
            href={`/quotes/${sentToken}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            See my quotes page →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="space-y-6">
        {/* Postcode */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Where's the job?</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value.toUpperCase());
                setCovered(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && checkPostcode()}
              placeholder="Postcode, e.g. CH41 5AB"
              aria-label="Postcode"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 uppercase outline-none focus:border-primary-500"
            />
            <button
              type="button"
              onClick={checkPostcode}
              disabled={checking}
              className="shrink-0 rounded-xl bg-primary-600 px-5 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {checking ? "Checking…" : "Check"}
            </button>
          </div>
          {covered === true && (
            <p className="mt-2 text-sm font-semibold text-green-700">
              ✓ Covered — cleaners near you will price this.
            </p>
          )}
          {covered === false && (
            <p className="mt-2 text-sm text-amber-700">
              We don&apos;t have a vetted cleaner right there yet — send your
              request anyway and we&apos;ll match you with one.
            </p>
          )}
        </section>

        {/* Items — no prices anywhere, that's the point */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">What needs cleaning?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tick what you need — the cleaners price the whole job for you.
          </p>
          {groups.map(([kind, kindItems]) => (
            <div key={kind} className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {KIND_LABELS[kind] ?? kind}
              </h3>
              <ul className="mt-2 divide-y divide-slate-100">
                {kindItems.map((item) => {
                  const qty = basket[item.code] ?? 0;
                  return (
                    <li
                      key={item.code}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{item.label}</p>
                        {item.hint && (
                          <p className="text-xs text-slate-500">{item.hint}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => bump(item.code, -1, item.max_qty)}
                          aria-label={`Fewer ${item.label}`}
                          className={`h-9 w-9 rounded-full border text-lg font-bold transition ${
                            qty > 0
                              ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                              : "border-slate-200 text-slate-300"
                          }`}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold tabular-nums text-slate-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => bump(item.code, 1, item.max_qty)}
                          aria-label={`More ${item.label}`}
                          className="h-9 w-9 rounded-full border border-primary-300 text-lg font-bold text-primary-700 transition hover:bg-primary-50"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={600}
            placeholder="Anything the cleaners should know? (stains, pets, parking…)"
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500"
          />
        </section>

        {/* Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Where should the quotes go?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Mobile number"
              aria-label="Mobile number"
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email (optional)"
              aria-label="Email"
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500 sm:col-span-2"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Your number is only shared with the one cleaner you choose — never
            with all of them.
          </p>
        </section>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={sending}
          className="w-full rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {sending
            ? "Sending…"
            : `Get my ${maxQuotes} free quotes${picked > 0 ? ` — ${picked} item${picked === 1 ? "" : "s"}` : ""}`}
        </button>
        <p className="text-center text-xs text-slate-500">
          Free, no obligation. Vetted local cleaners · you pay on the day, only
          if you book.
        </p>
      </div>
    </div>
  );
}
