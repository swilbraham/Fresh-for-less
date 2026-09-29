import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import BookingFlow from "@/components/marketplace/BookingFlow";
import BookingLanding from "@/components/marketplace/BookingLanding";
import { gbp } from "@/lib/marketplace/money";
import {
  getBundles,
  getPriceItems,
  getSettings,
} from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Carpet Cleaning Online — Instant Fixed Price, UK-Wide",
  description:
    "Get an instant fixed price for carpet and upholstery cleaning anywhere in the UK. No home visit, no haggling, nothing to pay upfront — just enter your postcode, pick a slot, and a vetted local cleaner is confirmed.",
  alternates: { canonical: "/book" },
};

export default async function BookPage() {
  const [items, bundles, settings] = await Promise.all([
    getPriceItems(true),
    getBundles(true),
    getSettings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
      <div>
        <BookingFlow
          items={items}
          bundles={bundles}
          minimumChargePence={settings.minimum_charge_pence}
          minNoticeDays={settings.min_notice_days}
          commissionPct={Number(settings.commission_pct)}
          protectionPct={Number(settings.protection_pct)}
          protectionEnabled={settings.protection_enabled}
          hero={
            <header className="relative overflow-hidden bg-slate-900 pb-14 pt-14">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,153,245,0.18),transparent_55%)]"
              />
              <div className="relative mx-auto max-w-3xl px-4 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-accent-400">
                  Carpet cleaning across the UK
                </p>
                <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
                  Your fixed price in under a minute
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                  No home visit, no haggling, nothing to pay upfront. Enter your
                  postcode, choose a slot, and we&apos;ll confirm a vetted local
                  cleaner.
                </p>

                <p className="mt-6">
                  <a
                    href="tel:03300434811"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-lg font-bold text-white transition hover:bg-white/20"
                  >
                    <svg className="h-5 w-5 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    Or call to book: 0330 043 4811
                  </a>
                </p>

                <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
                  {[
                    "4.9/5 from 2,000+ homes",
                    "Insured & vetted cleaners",
                    "100% satisfaction guarantee",
                  ].map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <span className="text-accent-400">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </header>
          }
          landing={
            <BookingLanding
              items={items}
              bundles={bundles}
              minimumChargePence={settings.minimum_charge_pence}
            />
          }
        />
      </div>

      <p className="mx-auto max-w-3xl px-4 pb-12 pt-8 text-center text-xs text-slate-500">
        A minimum charge of {gbp(settings.minimum_charge_pence)} applies to every
        job. Your fixed price is shown in full before you book, with nothing to
        pay upfront &mdash; you pay your cleaner on the day.
      </p>

    </main>
      <Footer />

      {/* Always-reachable phone escape hatch: the flow asks for 3 days'
          notice, and the callers it turns away are often the most urgent. */}
      <a
        href="tel:03300434811"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-accent-600 px-5 py-3.5 font-bold text-white shadow-xl shadow-accent-600/30 transition hover:bg-accent-700"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
        Call now
        <span className="hidden sm:inline">· 0330 043 4811</span>
      </a>
    </>
  );
}
