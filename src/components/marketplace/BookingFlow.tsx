"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { buildQuote, type Basket } from "@/lib/marketplace/pricing";
import { gbp, gbpShort } from "@/lib/marketplace/money";
import type { PriceBundle, PriceItem } from "@/lib/marketplace/types";

type Slot = { day: string; am: boolean; pm: boolean };
type Step = "postcode" | "items" | "slot" | "details";

const KIND_LABELS: Record<string, string> = {
  carpet: "Carpets & stairs",
  upholstery: "Upholstery",
  extra: "Optional extras",
};

function longDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function BookingFlow({
  items,
  bundles,
  minimumChargePence,
  commissionPct,
  protectionPct,
  protectionEnabled,
  landing,
}: {
  items: PriceItem[];
  bundles: PriceBundle[];
  minimumChargePence: number;
  commissionPct: number;
  protectionPct: number;
  protectionEnabled: boolean;
  /** Marketing content, shown only before the customer starts the quote. */
  landing?: ReactNode;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("postcode");
  const [postcode, setPostcode] = useState("");
  const [checking, setChecking] = useState(false);
  const [coverage, setCoverage] = useState<
    {
      covered: boolean;
      provisional?: boolean;
      outward: string;
      slots: Slot[];
    } | null
  >(null);
  const [basket, setBasket] = useState<Basket>({});
  const [slotDate, setSlotDate] = useState("");
  const [slotWindow, setSlotWindow] = useState<"am" | "pm">("am");
  const [details, setDetails] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine: "",
    town: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [waitlist, setWaitlist] = useState({ name: "", email: "", phone: "" });
  const [joining, setJoining] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [protection, setProtection] = useState(false);

  // The same pricing engine the server uses, so the figure on screen is the
  // figure that gets booked.
  const quote = useMemo(
    () =>
      buildQuote(basket, items, bundles, {
        minimumChargePence,
        commissionPct,
        protectionPct,
        protection: protection && protectionEnabled,
      }),
    [
      basket,
      items,
      bundles,
      minimumChargePence,
      commissionPct,
      protectionPct,
      protectionEnabled,
      protection,
    ]
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

  const selectedSlot = coverage?.slots.find((s) => s.day === slotDate);

  async function checkPostcode(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setChecking(true);
    try {
      const response = await fetch(
        `/api/marketplace/slots?postcode=${encodeURIComponent(postcode)}`
      );
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? "We couldn't check that postcode.");
        return;
      }
      setCoverage(data);
      setWaitlisted(false);
      if (data.slots.length > 0) setStep("items");
    } catch {
      setError("We couldn't check that postcode. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  /** No cleaner here yet — keep the lead rather than losing the customer. */
  async function joinWaitlist() {
    setError("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(waitlist.email)) {
      setError("Please enter a valid email so we can get back to you.");
      return;
    }
    setJoining(true);
    try {
      const response = await fetch("/api/marketplace/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...waitlist, postcode }),
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? "We couldn't save your details.");
        return;
      }
      setWaitlisted(true);
    } catch {
      setError("We couldn't save your details. Please call 0330 043 4811.");
    } finally {
      setJoining(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/marketplace/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          postcode,
          slotDate,
          slotWindow,
          basket,
          protection: protection && protectionEnabled,
        }),
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? "We couldn't take that booking.");
        return;
      }
      router.push(`/book/confirmed/${data.ref}`);
    } catch {
      setError("We couldn't take that booking. Please try again.");
      setSubmitting(false);
    }
  }

  function setQty(code: string, qty: number) {
    setBasket((current) => {
      const next = { ...current };
      if (qty <= 0) delete next[code];
      else next[code] = qty;
      return next;
    });
  }

  const steps: { key: Step; label: string }[] = [
    { key: "postcode", label: "Postcode" },
    { key: "items", label: "What needs cleaning" },
    { key: "slot", label: "Date" },
    { key: "details", label: "Your details" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-40">
      {/* Progress */}
      <ol
        className={`mb-8 flex-wrap gap-x-2 gap-y-1 text-sm ${
          step === "postcode" ? "hidden" : "flex"
        }`}
      >
        {steps.map((s, index) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                index < stepIndex
                  ? "bg-accent-600 text-white"
                  : index === stepIndex
                    ? "bg-primary-600 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {index < stepIndex ? "✓" : index + 1}
            </span>
            <span
              className={
                index === stepIndex
                  ? "font-semibold text-slate-900"
                  : "text-slate-500"
              }
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 text-slate-300">→</span>
            )}
          </li>
        ))}
      </ol>

      {step !== "postcode" && coverage?.provisional && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>We don&apos;t have a cleaner in {coverage.outward} yet.</strong>{" "}
          Carry on and we&apos;ll treat this as a request — we&apos;ll confirm
          within 24 hours or call you to sort something out. Nothing to pay
          either way.
        </div>
      )}

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Step 1 — postcode */}
      {step === "postcode" && (
        <form onSubmit={checkPostcode} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Where are we cleaning?
          </h2>
          <p className="mt-2 text-slate-600">
            Enter your postcode and we&apos;ll show you the vetted cleaners
            covering your area, with a fixed price — no home visit, no haggling.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              placeholder="e.g. CH41 5AB"
              autoComplete="postal-code"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg tracking-wide uppercase placeholder:normal-case outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="submit"
              disabled={checking || postcode.trim().length < 5}
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-40"
            >
              {checking ? "Checking…" : "Check my area"}
            </button>
          </div>

          {coverage && !coverage.covered && coverage.slots.length === 0 && !waitlisted && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">
                No cleaner is covering {coverage.outward} online just yet.
              </p>
              <p className="mt-1">
                We&apos;re signing cleaners up across the UK every week. Leave
                your details and we&apos;ll get you booked in — or call{" "}
                <a href="tel:03300434811" className="font-semibold underline">
                  0330 043 4811
                </a>{" "}
                right now.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <input
                  value={waitlist.name}
                  onChange={(e) => setWaitlist({ ...waitlist, name: e.target.value })}
                  placeholder="Your name"
                  aria-label="Your name"
                  autoComplete="name"
                  className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-primary-500"
                />
                <input
                  value={waitlist.email}
                  onChange={(e) => setWaitlist({ ...waitlist, email: e.target.value })}
                  placeholder="Email"
                  aria-label="Email"
                  type="email"
                  autoComplete="email"
                  className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-primary-500"
                />
                <input
                  value={waitlist.phone}
                  onChange={(e) => setWaitlist({ ...waitlist, phone: e.target.value })}
                  placeholder="Phone"
                  aria-label="Phone"
                  type="tel"
                  autoComplete="tel"
                  className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-primary-500"
                />
              </div>
              <button
                type="button"
                onClick={joinWaitlist}
                disabled={joining}
                className="mt-3 w-full rounded-xl bg-amber-600 px-6 py-2.5 font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 sm:w-auto"
              >
                {joining ? "Sending…" : "Get me booked in"}
              </button>
            </div>
          )}

          {waitlisted && (
            <div className="mt-5 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
              <p className="font-semibold">Thanks — we&apos;ve got your details.</p>
              <p className="mt-1">
                We&apos;ll be in touch to arrange your clean in {coverage?.outward}.
                If it&apos;s urgent, call 0330 043 4811.
              </p>
            </div>
          )}

          {coverage?.covered && coverage.slots.length === 0 && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Cleaners cover {coverage.outward} but they&apos;re fully booked for
              the next few weeks. Please call 0330 043 4811.
            </div>
          )}
        </form>
      )}

      {/* Step 2 — items */}
      {step === "items" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
            Cleaners available in <strong>{coverage?.outward}</strong> — pick what
            needs cleaning and your price updates instantly.
          </div>

          {grouped.map(([kind, kindItems]) => (
            <section
              key={kind}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">
                {KIND_LABELS[kind] ?? kind}
              </h3>
              <ul className="mt-4 divide-y divide-slate-100">
                {kindItems.map((item) => {
                  const qty = basket[item.code] ?? 0;
                  return (
                    <li
                      key={item.code}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-sm text-slate-500">
                          {gbpShort(item.unit_price_pence)} each
                          {item.hint ? ` · ${item.hint}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Remove one ${item.label}`}
                          onClick={() => setQty(item.code, qty - 1)}
                          disabled={qty === 0}
                          className="h-10 w-10 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-lg font-semibold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Add one ${item.label}`}
                          onClick={() =>
                            setQty(item.code, Math.min(qty + 1, item.max_qty))
                          }
                          disabled={qty >= item.max_qty}
                          className="h-10 w-10 rounded-lg border border-slate-300 text-lg font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {protectionEnabled && quote.cleaning_pence > 0 && (
            <section className="rounded-2xl border-2 border-accent-200 bg-accent-50/50 p-6">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={protection}
                  onChange={(e) => setProtection(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 accent-accent-600"
                />
                <span>
                  <span className="block font-bold text-slate-900">
                    Add stain guard —{" "}
                    {gbp(Math.round((quote.cleaning_pence * protectionPct) / 100))}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    A protective barrier applied to your carpets and upholstery
                    once they&apos;re clean. Spills sit on the surface instead of
                    soaking in, so they blot up before they stain — and the
                    clean lasts noticeably longer.
                  </span>
                </span>
              </label>
            </section>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("postcode")}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("slot")}
              disabled={quote.total_pence === 0}
              className="flex-1 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-40"
            >
              Choose a date
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — slot */}
      {step === "slot" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              When suits you?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {coverage?.provisional
                ? `Tell us when suits and we'll try to cover ${coverage.outward}.`
                : `Only dates with a cleaner free in ${coverage?.outward} are shown.`}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {coverage?.slots.map((slot) => (
                <button
                  key={slot.day}
                  type="button"
                  onClick={() => {
                    setSlotDate(slot.day);
                    setSlotWindow(slot.am ? "am" : "pm");
                  }}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    slotDate === slot.day
                      ? "border-primary-600 bg-primary-50 text-primary-800"
                      : "border-slate-200 text-slate-700 hover:border-primary-300"
                  }`}
                >
                  {longDate(slot.day)}
                </button>
              ))}
            </div>

            {selectedSlot && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-700">
                  Arrival window
                </p>
                <div className="mt-2 flex gap-2">
                  {(["am", "pm"] as const).map((window) => (
                    <button
                      key={window}
                      type="button"
                      disabled={!selectedSlot[window]}
                      onClick={() => setSlotWindow(window)}
                      className={`flex-1 rounded-xl border px-4 py-3 font-semibold transition disabled:opacity-30 ${
                        slotWindow === window
                          ? "border-primary-600 bg-primary-50 text-primary-800"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {window === "am" ? "Morning 8am–12pm" : "Afternoon 12pm–5pm"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("items")}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("details")}
              disabled={!slotDate}
              className="flex-1 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — details */}
      {step === "details" && (
        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Your details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={details.customerName}
                onChange={(v) => setDetails({ ...details, customerName: v })}
                autoComplete="name"
                required
              />
              <Field
                label="Phone"
                value={details.customerPhone}
                onChange={(v) => setDetails({ ...details, customerPhone: v })}
                autoComplete="tel"
                type="tel"
                required
              />
              <Field
                label="Email"
                value={details.customerEmail}
                onChange={(v) => setDetails({ ...details, customerEmail: v })}
                autoComplete="email"
                type="email"
                required
                className="sm:col-span-2"
              />
              <Field
                label="Address"
                value={details.addressLine}
                onChange={(v) => setDetails({ ...details, addressLine: v })}
                autoComplete="street-address"
                required
                className="sm:col-span-2"
              />
              <Field
                label="Town"
                value={details.town}
                onChange={(v) => setDetails({ ...details, town: v })}
                autoComplete="address-level2"
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Postcode
                </label>
                <input
                  value={postcode}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 uppercase text-slate-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Anything your cleaner should know?
                </label>
                <textarea
                  value={details.notes}
                  onChange={(e) =>
                    setDetails({ ...details, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Parking, pets, stubborn stains, access instructions…"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-bold text-slate-900">Your booking</h3>
            <dl className="mt-3 space-y-1 text-sm text-slate-700">
              <div className="flex justify-between">
                <dt>Date</dt>
                <dd className="font-semibold">
                  {slotDate ? longDate(slotDate) : "—"} ·{" "}
                  {slotWindow === "am" ? "Morning" : "Afternoon"}
                </dd>
              </div>
              {quote.lines.map((line) => (
                <div key={line.code} className="flex justify-between">
                  <dt>
                    {line.qty} × {line.label}
                    {line.note && (
                      <span className="ml-1 text-accent-700">({line.note})</span>
                    )}
                  </dt>
                  <dd className="font-semibold tabular-nums">
                    {gbp(line.amount_pence)}
                  </dd>
                </div>
              ))}
              {quote.minimum_applied && (
                <div className="flex justify-between text-slate-500">
                  <dt>Minimum charge applied</dt>
                  <dd className="tabular-nums">{gbp(minimumChargePence)}</dd>
                </div>
              )}
            </dl>
            <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-600">
              {coverage?.provisional
                ? `If we can cover ${coverage.outward}, you'll pay your cleaner ${gbp(quote.total_pence)} on the day. Nothing to pay unless we confirm.`
                : `Pay your cleaner ${gbp(quote.total_pence)} on the day — cash or card. Nothing to pay now.`}
            </p>
          </section>

          <p className="text-xs text-slate-500">
            When a cleaner accepts your job we share your name, address and
            phone number with them so they can reach you and get to your home.
            Nothing else is shared, and we never sell your details. See our{" "}
            <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">
              privacy policy
            </a>
            .
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("slot")}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700 disabled:opacity-40"
            >
              {submitting
                ? "Sending…"
                : coverage?.provisional
                  ? `Request this booking — ${gbp(quote.total_pence)}`
                  : `Confirm booking — ${gbp(quote.total_pence)}`}
            </button>
          </div>
        </form>
      )}

      {step === "postcode" && landing}

      {/* Sticky running price */}
      {step !== "postcode" && quote.total_pence > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your fixed price
              </p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {gbp(quote.total_pence)}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              {quote.savings_pence > 0 && (
                <p className="font-semibold text-accent-700">
                  Offer saves you {gbp(quote.savings_pence)}
                </p>
              )}
              <p>No deposit · pay the cleaner on the day</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
    </div>
  );
}
