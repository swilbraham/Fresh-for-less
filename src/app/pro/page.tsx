import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCleaner } from "@/lib/marketplace/auth";
import {
  getBundles,
  getPriceItems,
  getSettings,
} from "@/lib/marketplace/repo";
import { buildQuote, type Basket } from "@/lib/marketplace/pricing";
import { gbp, gbpShort } from "@/lib/marketplace/money";
import { COMMISSION_TERMS_LONG } from "@/lib/marketplace/terms";
import {
  DROP_REVIEW_DAYS,
  DROP_REVIEW_LIMIT,
  LATE_DROP_HOURS,
} from "@/lib/marketplace/repo";
import { loginAction } from "./actions";
import { Alert, Card, Field } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carpet cleaner jobs — join the network",
  description:
    "Independent carpet cleaners: register your postcode coverage and availability, and get pre-priced local jobs sent straight to you. No lead fees — a simple commission on completed work.",
  alternates: { canonical: "/pro" },
};

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (await currentCleaner()) redirect("/pro/dashboard");
  const { error, next } = await searchParams;
  // Arriving from a job text: they're an existing cleaner, not a recruit.
  const returning = Boolean(next?.startsWith("/pro"));
  const [settings, items, bundles] = await Promise.all([
    getSettings(),
    getPriceItems(true),
    getBundles(true),
  ]);

  const commissionPct = Number(settings.commission_pct);
  const quoteOpts = {
    minimumChargePence: settings.minimum_charge_pence,
    commissionPct,
  };

  // Worked examples beat a unit price list — a cleaner wants to know what a
  // real job pays, not what one room costs.
  const exampleBaskets: { label: string; basket: Basket }[] = [
    { label: "Lounge, stairs and landing", basket: { room: 1, stairs: 1, landing: 1 } },
    { label: "Three bedrooms", basket: { room: 3 } },
    { label: "Whole house — 4 rooms, stairs, landing", basket: { room: 4, stairs: 1, landing: 1 } },
    { label: "Three-seater sofa and an armchair", basket: { sofa3: 1, armchair: 1 } },
  ];

  const examples = exampleBaskets
    .map((example) => ({
      label: example.label,
      quote: buildQuote(example.basket, items, bundles, quoteOpts),
    }))
    .filter((example) => example.quote.total_pence > 0);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 pt-10 pb-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 lg:grid-cols-2">
        <div className={returning ? "order-2" : ""}>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            For carpet cleaners
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Fill your diary with priced local work
          </h1>
          <p className="mt-4 text-slate-600">
            Customers get an instant fixed price from our national price list and
            book a slot. The job goes straight out to every vetted cleaner
            covering that postcode — first one to accept keeps it.
          </p>

          <ul className="mt-6 space-y-4">
            {[
              [
                "No lead fees, no bidding",
                `You pay ${Number(settings.commission_pct)}% commission on completed jobs only, invoiced weekly. Nothing for quotes that go nowhere.`,
              ],
              [
                "You control your patch",
                "Register the postcode areas you cover and the half-days you work. You only ever see jobs you can actually do.",
              ],
              [
                "Priced before it reaches you",
                "Every job arrives with the price already agreed with the customer, so there's nothing to quote or negotiate.",
              ],
              [
                "Paid on the day",
                "The customer pays you direct, cash or card. We invoice your commission separately.",
              ],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="text-sm text-slate-600">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              What you&apos;d earn
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Real jobs at our current national prices, showing what you keep
              after {commissionPct}% commission.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Job</th>
                    <th className="py-2 text-right font-semibold">Customer pays</th>
                    <th className="py-2 text-right font-semibold">You keep</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examples.map((example) => (
                    <tr key={example.label}>
                      <td className="py-2 pr-3 text-slate-700">{example.label}</td>
                      <td className="py-2 text-right tabular-nums text-slate-600">
                        {gbp(example.quote.total_pence)}
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums text-accent-700">
                        {gbp(
                          example.quote.total_pence - example.quote.commission_pence
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <strong className="text-slate-800">How you get paid.</strong>{" "}
              {COMMISSION_TERMS_LONG}
            </p>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-primary-600">
                See the full price list
              </summary>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {items.map((item) => (
                  <li key={item.code} className="flex justify-between py-1.5">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="tabular-nums text-slate-800">
                      {gbpShort(item.unit_price_pence)}
                    </span>
                  </li>
                ))}
              </ul>
              {bundles.length > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  Offers apply automatically where they beat the itemised price —{" "}
                  {bundles.map((b) => b.label).join(", ")}. Every job has a{" "}
                  {gbpShort(settings.minimum_charge_pence)} minimum.
                </p>
              )}
            </details>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              What we expect
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Short and stated up front, so there are no surprises later.
            </p>

            <ul className="mt-4 space-y-3 text-sm">
              {[
                [
                  "Only accept what you can do",
                  "Jobs are first-to-accept. Take one and the customer is told you're coming, so only accept slots you can genuinely make.",
                ],
                [
                  "Tell us early if things change",
                  `Hand the job back from your dashboard and it goes straight to another cleaner. Drops inside ${LATE_DROP_HOURS} hours are recorded, and ${DROP_REVIEW_LIMIT} of them in ${DROP_REVIEW_DAYS} days means a conversation.`,
                ],
                [
                  "Never turn up without notice",
                  "A no-show costs the customer their day and us the relationship. It means suspension, not a warning.",
                ],
                [
                  "Honour the price",
                  "The customer has been given a fixed price with no home visit. Charging extra on the doorstep breaks the promise the whole thing is built on.",
                ],
                [
                  "Keep your insurance current",
                  "Public liability cover has to stay valid. We'll ask before it expires.",
                ],
                [
                  "Collect the full amount",
                  "Take the whole price from the customer on the day. Commission is invoiced separately, never deducted at your end.",
                ],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    •
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="text-slate-600">{body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-slate-500">
              Do those and you&apos;ll get a steady run of priced local work. We
              don&apos;t charge lead fees, so we only make money when you do.
            </p>
          </div>

          <Link
            href="/pro/register"
            className="mt-6 inline-block rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700"
          >
            Apply to join
          </Link>
        </div>

        <div className={returning ? "order-1" : ""}>
          {error && <Alert>{error}</Alert>}
          {returning && !error && (
            <Alert tone="info">
              <strong>Already a cleaner with us?</strong> Sign in below to see
              the job — you don&apos;t need to register again.
            </Alert>
          )}
          <Card title={returning ? "Sign in to see this job" : "Cleaner sign in"}>
            <form action={loginAction} className="mt-4 space-y-4">
              <input type="hidden" name="next" value={next ?? ""} />
              <Field label="Email" name="email" type="email" required />
              <Field label="Password" name="password" type="password" required />
              <button
                type="submit"
                className="w-full rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
              >
                Sign in
              </button>
            </form>
            <p className="mt-4 text-sm text-slate-500">
              <Link
                href="/pro/forgot"
                className="font-semibold text-primary-600 underline"
              >
                Forgotten your password?
              </Link>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              New here?{" "}
              <Link
                href="/pro/register"
                className="font-semibold text-primary-600 underline"
              >
                Apply to join the network
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </main>
      <Footer />
    </>
  );
}
