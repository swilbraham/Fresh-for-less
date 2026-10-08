"use client";

import { useMemo, useState, type ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildQuote, type Basket } from "@/lib/marketplace/pricing";
import { gbp, gbpShort } from "@/lib/marketplace/money";
import type { PriceBundle, PriceItem } from "@/lib/marketplace/types";
import CustomerReview from "@/components/marketplace/CustomerReview";
import ExitOffer from "@/components/marketplace/ExitOffer";

type Slot = { day: string; am: boolean; pm: boolean };
type Step = "postcode" | "items" | "slot" | "details";

const KIND_LABELS: Record<string, string> = {
  carpet: "Carpets & stairs",
  hardfloor: "Hard floors",
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
  minNoticeDays,
  commissionPct,
  protectionPct,
  protectionEnabled,
  landing,
  hero,
  initialPostcode = "",
  initialBasket,
  initialDetails,
  quoteToken = "",
  source = "",
}: {
  items: PriceItem[];
  bundles: PriceBundle[];
  minimumChargePence: number;
  minNoticeDays: number;
  commissionPct: number;
  protectionPct: number;
  protectionEnabled: boolean;
  /** Marketing content, shown only before the customer starts the quote. */
  landing?: ReactNode;
  /**
   * The full-height hero. Shown only on the first step: once someone has given
   * a postcode they've read it and acted on it, and leaving it in place makes
   * them scroll a screen and a half past their own decision on every step.
   */
  hero?: ReactNode;
  /** A postcode handed over from another site, checked on arrival. */
  initialPostcode?: string;
  /** A basket priced by the office and accepted from a quote link. */
  initialBasket?: Basket;
  /** What the office already took down on the phone. */
  initialDetails?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
  /** The quote this booking came from, marked as converted on success. */
  quoteToken?: string;
  /** Where this visitor came from, recorded with the booking. */
  source?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("postcode");
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [postcode, setPostcode] = useState(initialPostcode.toUpperCase());
  const [checking, setChecking] = useState(false);
  const [coverage, setCoverage] = useState<
    {
      covered: boolean;
      provisional?: boolean;
      outward: string;
      slots: Slot[];
    } | null
  >(null);
  const [basket, setBasket] = useState<Basket>(initialBasket ?? {});
  const [slotDate, setSlotDate] = useState("");
  const [slotWindow, setSlotWindow] = useState<"am" | "pm">("am");
  const [details, setDetails] = useState({
    customerName: initialDetails?.customerName ?? "",
    customerEmail: initialDetails?.customerEmail ?? "",
    customerPhone: initialDetails?.customerPhone ?? "",
    addressLine: "",
    town: "",
    notes: "",
    parking: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [codeEntry, setCodeEntry] = useState("");
  const [codeError, setCodeError] = useState("");
  const [discount, setDiscount] = useState<{
    code: string;
    pct: number;
    expiresAt: string;
  } | null>(null);

  /**
   * Identifies this visitor's quote so changes update one row rather than
   * writing a new one on every tick. Generated in the browser and never
   * persisted anywhere else: it is a basket id, not a tracking cookie.
   */
  const quoteKey = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
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

  const discountPence = discount
    ? Math.round((quote.total_pence * discount.pct) / 100)
    : 0;
  const payable = quote.total_pence - discountPence;


  const grouped = useMemo(() => {
    const map = new Map<string, PriceItem[]>();
    for (const item of items) {
      const list = map.get(item.kind) ?? [];
      list.push(item);
      map.set(item.kind, list);
    }
    return [...map.entries()];
  }, [items]);

  /**
   * Offers already apply automatically in the pricing engine, but a customer
   * choosing rooms can't see one coming. Telling them they're one room away
   * from a fixed price is the cheapest upsell available.
   */
  const offers = useMemo(
    () =>
      bundles
        .filter((bundle) => bundle.active !== false)
        .map((bundle) => {
          // An offer can span several items, so count them all — otherwise
          // someone with 2 rooms and a staircase is told to add a third room
          // when the offer has already applied.
          const codes = [
            bundle.item_code,
            ...(bundle.applies_to ?? "")
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
          ].filter((c, i, all) => all.indexOf(c) === i);

          const have = codes.reduce(
            (sum, code) => sum + Math.floor(Number(basket[code] ?? 0)),
            0
          );

          // "3 rooms" reads better than "3 areas" when only one item counts.
          const unit =
            codes.length > 1
              ? "area"
              : (
                  items.find((i) => i.code === bundle.item_code)?.label ??
                  bundle.item_code
                ).toLowerCase();

          return {
            id: bundle.id,
            label: bundle.label,
            unit,
            counts: codes
              .map((code) => items.find((i) => i.code === code)?.label ?? code)
              .join(" or ")
              .toLowerCase(),
            multi: codes.length > 1,
            needed: Math.max(0, bundle.qty - have),
            applied: have >= bundle.qty,
            qty: bundle.qty,
            pricePence: bundle.price_pence,
          };
        })
        .sort((a, b) => a.needed - b.needed),
    [bundles, items, basket]
  );

  const selectedSlot = coverage?.slots.find((s) => s.day === slotDate);

  async function checkPostcode(event: React.FormEvent) {
    event.preventDefault();
    await runPostcodeCheck(postcode);
  }

  async function runPostcodeCheck(code: string) {
    setError("");
    setChecking(true);
    try {
      const response = await fetch(
        `/api/marketplace/slots?postcode=${encodeURIComponent(code)}`
      );
      const data = await response.json();
      if (!data.ok) {
        setError(data.error ?? "We couldn't check that postcode.");
        return;
      }
      setCoverage(data);
      if (data.slots.length > 0) setStep("items");
    } catch {
      setError("We couldn't check that postcode. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  // A postcode handed over from another Fresh For Less site is checked straight
  // away, so the customer lands on the price list rather than on a box already
  // holding what they typed a moment ago. A ref rather than a dependency list:
  // this has to happen exactly once, whatever re-renders follow.
  const autoChecked = useRef(false);
  useEffect(() => {
    if (autoChecked.current) return;
    if (initialPostcode.trim().length < 5) return;
    autoChecked.current = true;
    void runPostcodeCheck(initialPostcode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Log the priced basket, including the ones that never become bookings —
   * which is the whole point, since a quote nobody follows through on is the
   * only visible trace of what the form loses.
   *
   * Debounced: somebody adding three rooms fires this once at the end, not four
   * times on the way. Failures are swallowed on purpose; nothing the customer
   * is doing depends on it.
   */
  useEffect(() => {
    if (!coverage) return;
    if (quote.total_pence <= 0) return;

    const timer = setTimeout(() => {
      void fetch("/api/marketplace/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey: quoteKey.current,
          postcode,
          covered: Boolean(coverage.covered),
          items: quote.lines,
          subtotalPence: quote.subtotal_pence,
          totalPence: quote.total_pence,
          source,
          customerName: leadName.trim(),
          customerPhone: leadPhone.trim(),
        }),
      }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
    // leadName/leadPhone ride along but shouldn't re-fire the log on keypress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverage, postcode, quote, source]);

  /** "Text me this price" — saves the lead and sends one SMS with the figure. */
  async function textMyPrice() {
    const phone = leadPhone.trim();
    if (phone.replace(/[^0-9]/g, "").length < 10) {
      setLeadStatus("failed");
      return;
    }
    setLeadStatus("sending");
    try {
      const response = await fetch("/api/marketplace/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey: quoteKey.current,
          postcode,
          covered: Boolean(coverage?.covered),
          items: quote.lines,
          subtotalPence: quote.subtotal_pence,
          totalPence: quote.total_pence,
          source,
          customerName: leadName.trim(),
          customerPhone: phone,
          textMe: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      setLeadStatus(data.texted ? "sent" : "failed");
    } catch {
      setLeadStatus("failed");
    }
  }

  /** Apply a code they were given earlier — or yesterday, in another tab. */
  async function applyCode() {
    const code = codeEntry.trim().toUpperCase();
    if (!code) return;
    setCodeError("");
    try {
      const response = await fetch("/api/marketplace/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!data.ok) {
        setCodeError(data.error ?? "We couldn't apply that code.");
        return;
      }
      setDiscount({ code: data.code, pct: data.pct, expiresAt: data.expiresAt });
      setCodeEntry("");
    } catch {
      setCodeError("We couldn't check that code just now.");
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
          termsAccepted,
          source,
          quoteKey: quoteToken || quoteKey.current,
          discountCode: discount?.code ?? "",
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
    <div className="w-full pb-40">
      <ExitOffer
        sessionKey={quoteKey.current}
        armed={quote.total_pence > 0 && step !== "details"}
        onAccept={setDiscount}
      />
      {step === "postcode" ? (
        hero
      ) : (
        <div className="mb-8 border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <p className="min-w-0 text-sm text-slate-600">
              Cleaning at{" "}
              <strong className="text-slate-900">{postcode.toUpperCase()}</strong>
            </p>
            <button
              type="button"
              onClick={() => setStep("postcode")}
              className="shrink-0 text-sm font-semibold text-primary-600 underline"
            >
              Change
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-4">
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

          {offers.length > 0 && (
            <ul className="space-y-2">
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    offer.applied
                      ? "border-accent-300 bg-accent-50 text-accent-900"
                      : "border-amber-300 bg-amber-50 text-amber-900"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                      offer.applied
                        ? "bg-accent-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {offer.applied ? "✓" : "%"}
                  </span>
                  <span>
                    {offer.applied ? (
                      <>
                        <strong>{offer.label}</strong> applied — that&apos;s the
                        best price for {offer.qty} {offer.unit}s.
                      </>
                    ) : offer.needed === offer.qty ? (
                      <>
                        <strong>{offer.label}</strong> — add any {offer.qty}{" "}
                        {offer.multi ? `(${offer.counts})` : `${offer.unit}s`}{" "}
                        and it applies automatically.
                      </>
                    ) : (
                      <>
                        Add{" "}
                        <strong>
                          {offer.needed} more {offer.unit}
                          {offer.needed === 1 ? "" : "s"}
                        </strong>{" "}
                        for <strong>{offer.label}</strong>.
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

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

          {quote.minimum_applied && quote.subtotal_pence > 0 && (
            <div className="rounded-2xl border border-accent-300 bg-accent-50 px-4 py-3 text-sm text-accent-900">
              <strong>
                Your picks come to {gbp(quote.subtotal_pence)} — our minimum
                visit is {gbp(minimumChargePence)}.
              </strong>{" "}
              That means you have {gbp(minimumChargePence - quote.subtotal_pence)}{" "}
              of cleaning included at no extra cost: add a hallway, staircase,
              landing or another room and the price stays{" "}
              {gbp(minimumChargePence)} until you pass it.
            </div>
          )}

          {quote.total_pence > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {leadStatus === "sent" ? (
                <p className="font-semibold text-accent-800">
                  Sent — check your messages. Your price is saved, and there&apos;s
                  nothing to pay until the job is done.
                </p>
              ) : (
                <>
                  <p>
                    <strong className="text-slate-900">
                      Want to think it over?
                    </strong>{" "}
                    We&apos;ll text you this price so you don&apos;t lose it — no
                    spam, no calls out of the blue.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="First name (optional)"
                      autoComplete="given-name"
                      className="w-40 flex-none rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="Mobile number"
                      autoComplete="tel"
                      className="w-44 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={textMyPrice}
                      disabled={leadStatus === "sending"}
                      className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-40"
                    >
                      {leadStatus === "sending" ? "Sending…" : "Text me this price"}
                    </button>
                  </div>
                  {leadStatus === "failed" && (
                    <p className="mt-2 text-xs text-red-600">
                      That didn&apos;t send — check it&apos;s a UK mobile number, or
                      just call us on 0330 043 4811.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <strong className="text-slate-900">
              Hard floors, curtains or something unusual?
            </strong>{" "}
            We don&apos;t price those online because the work varies too much to
            quote sight-unseen. Call{" "}
            <a href="tel:03300434811" className="font-semibold text-primary-600 underline">
              0330 043 4811
            </a>{" "}
            and we&apos;ll give you a price — you can still book everything else
            here.
          </p>

          {/* The fixed price assumes a normally soiled carpet. Saying so here,
              at the moment the price is being built, is far cheaper than a
              cleaner arguing about it on the doorstep. */}
          <div className="rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <strong className="text-slate-900">
              Heavily soiled carpets, pet urine or strong odours?
            </strong>{" "}
            These take longer and need specialist treatment, so the price above
            may not hold. Please call us on{" "}
            <a
              href="tel:03300434811"
              className="font-semibold underline decoration-amber-400 underline-offset-2"
            >
              0330 043 4811
            </a>{" "}
            before booking and we&apos;ll quote it properly &mdash; it saves a
            wasted visit for you and your cleaner.
          </div>

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
              Pick the date and half-day that suits you — we&apos;ll confirm
              your cleaner by text.
            </p>

            {/* Sooner than the notice period is still bookable — by phone,
                where the diary can actually be checked. */}
            <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Booking online needs at least{" "}
              <strong className="text-slate-900">
                {minNoticeDays} days&apos; notice
              </strong>
              . Need us sooner than that?{" "}
              <a
                href="tel:03300434811"
                className="font-semibold text-primary-600 underline"
              >
                Call 0330 043 4811
              </a>{" "}
              and we&apos;ll do our best to fit you in.
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
                  Where can your cleaner park?
                </label>
                <input
                  value={details.parking}
                  onChange={(e) =>
                    setDetails({ ...details, parking: e.target.value })
                  }
                  maxLength={200}
                  placeholder="Driveway, on the street, permit needed…"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Your cleaner arrives in a van and runs a hose from it, so it
                  needs to be within about 30 metres of your door.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Anything else your cleaner should know?
                </label>
                <textarea
                  value={details.notes}
                  onChange={(e) =>
                    setDetails({ ...details, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Pets, stubborn stains, access instructions…"
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
              {discountPence > 0
                ? `Pay your cleaner ${gbp(payable)} when the job is finished — ${gbp(quote.total_pence)} less your ${discount?.pct}% code. Cash or card, nothing to pay now.`
                : `Pay your cleaner ${gbp(quote.total_pence)} when the job is finished — cash or card. Nothing to pay now.`}
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

          {/* The code from the leaving-the-page offer, for anyone who closed
              the modal or came back the next day. Applied here rather than
              earlier so it is the last thing they see before the total. */}
          {discount ? (
            <p className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-900">
              {discount.code} applied — {discount.pct}% off, you pay{" "}
              {gbp(payable)} instead of {gbp(quote.total_pence)}.
            </p>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <label
                htmlFor="discount-code"
                className="text-sm font-semibold text-slate-700"
              >
                Got a discount code?
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="discount-code"
                  value={codeEntry}
                  onChange={(e) => setCodeEntry(e.target.value.toUpperCase())}
                  placeholder="e.g. FFL7K2M9"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 tracking-widest uppercase outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={applyCode}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Apply
                </button>
              </div>
              {codeError && (
                <p className="mt-2 text-sm text-red-600">{codeError}</p>
              )}
            </div>
          )}

          <CustomerReview variant="compact" />

          {/*
            Required, unticked by default, and its own deliberate action. A
            pre-ticked box is not agreement under the Consumer Rights Act, and
            the same tick is what asks us to start inside the 14-day
            cancellation period — so it has to be the customer who makes it.
          */}
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-primary-600"
            />
            <span>
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-600 underline"
              >
                terms and conditions
              </a>
              , and I&apos;d like my clean to go ahead on the date I&apos;ve
              chosen even though that&apos;s inside the 14-day cancellation
              period.
            </span>
          </label>

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
              disabled={submitting || !termsAccepted}
              className="flex-1 rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700 disabled:opacity-40"
            >
              {submitting
                ? "Sending…"
                : `Confirm booking — ${gbp(payable)}`}
            </button>
          </div>
        </form>
      )}

      {step === "postcode" && (
        <CustomerReview variant="compact" className="mt-6" />
      )}
      {step === "postcode" && landing}
      </div>

      {/* Sticky running price */}
      {step !== "postcode" && quote.total_pence > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your fixed price
              </p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {discountPence > 0 && (
                  <span className="mr-2 text-base font-normal text-slate-400 line-through">
                    {gbp(quote.total_pence)}
                  </span>
                )}
                {gbp(payable)}
              </p>
              {discountPence > 0 && (
                <p className="text-xs font-semibold text-accent-700">
                  {discount?.code} applied — {discount?.pct}% off
                </p>
              )}
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
