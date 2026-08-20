import Link from "next/link";
import { gbpShort } from "@/lib/marketplace/money";
import type { PriceBundle, PriceItem } from "@/lib/marketplace/types";

/**
 * Marketing content beneath the postcode check on /book.
 *
 * Shown only before the customer starts their quote — once they're picking
 * rooms, this would just be in the way. Prices come from the live list so the
 * page can never advertise a figure the booking engine won't honour.
 */
export default function BookingLanding({
  items,
  bundles,
  minimumChargePence,
}: {
  items: PriceItem[];
  bundles: PriceBundle[];
  minimumChargePence: number;
}) {
  const steps = [
    {
      title: "Tell us your postcode",
      body: "We check which vetted cleaners cover your street and when they're free.",
    },
    {
      title: "Pick what needs cleaning",
      body: "Rooms, stairs, sofas — your fixed price updates as you go. No survey, no home visit.",
    },
    {
      title: "Choose a slot and book",
      body: "Nothing to pay now. Your cleaner is confirmed and you pay them on the day.",
    },
  ];

  const reasons = [
    {
      title: "The price is the price",
      body: "What you see is what you pay. No add-ons on the doorstep, no pressure selling.",
    },
    {
      title: "Vetted, insured cleaners",
      body: "Every cleaner is checked for public liability insurance and experience before they take a single job.",
    },
    {
      title: "Nothing upfront",
      body: "No deposit and no card details. You pay your cleaner directly once the work is done.",
    },
    {
      title: "Change it any time",
      body: "Move or cancel your booking yourself from the link we text you.",
    },
  ];

  const faqs = [
    {
      q: "Do you cover my area?",
      a: "We're building coverage across the UK. Pop your postcode in above — if nobody covers you yet, leave your details and we'll arrange your clean directly.",
    },
    {
      q: "Why don't you need to visit first?",
      a: "Carpet cleaning is priced per room, staircase or sofa, so counting what you need is enough. That's how we can fix the price before you book.",
    },
    {
      q: "How do I pay?",
      a: `Directly to your cleaner on the day, by cash or card. Nothing is taken when you book, and every job has a ${gbpShort(minimumChargePence)} minimum.`,
    },
    {
      q: "What if I need to rearrange?",
      a: "Use the link in your confirmation text to move or cancel. If your cleaner can't make the new time, we find you another one.",
    },
  ];

  const carpet = items.filter((i) => i.kind === "carpet");
  const upholstery = items.filter((i) => i.kind === "upholstery");

  return (
    <div className="mt-16 space-y-16">
      {/* How it works */}
      <section>
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Booked in about a minute
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Prices */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          What it costs
        </h2>
        <p className="mt-2 text-slate-600">
          The same prices everywhere in the country — no postcode premiums.
        </p>

        {bundles.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-3">
            {bundles.map((bundle) => (
              <li
                key={bundle.id}
                className="rounded-xl border border-accent-300 bg-accent-50 px-4 py-2 text-sm font-bold text-accent-800"
              >
                {bundle.label}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {[
            { heading: "Carpets & stairs", list: carpet },
            { heading: "Upholstery", list: upholstery },
          ].map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {group.heading}
              </h3>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {group.list.map((item) => (
                  <li key={item.code} className="flex justify-between py-2">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {gbpShort(item.unit_price_pence)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Offers apply automatically whenever they beat the itemised price.
          Every job has a {gbpShort(minimumChargePence)} minimum.
        </p>
      </section>

      {/* Why */}
      <section>
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Why book online
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">
                ✓
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{reason.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{reason.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Questions people ask
        </h2>
        <dl className="mx-auto mt-8 max-w-2xl divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-5">
              <dt className="font-bold text-slate-900">{faq.q}</dt>
              <dd className="mt-1 text-sm text-slate-600">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Closing CTA */}
      <section className="rounded-2xl bg-slate-900 px-6 py-10 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready for carpets that look new again?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-300">
          Enter your postcode at the top of this page for your fixed price, or
          talk to us if you&apos;d rather book over the phone.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="tel:03300434811"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Call 0330 043 4811
          </a>
          <Link
            href="/pro"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Are you a carpet cleaner?
          </Link>
        </div>
      </section>
    </div>
  );
}
