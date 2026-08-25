import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import BookingFlow from "@/components/marketplace/BookingFlow";
import BookingLanding from "@/components/marketplace/BookingLanding";
import NjordApproved from "@/components/marketplace/NjordApproved";
import NjordBadge from "@/components/marketplace/NjordBadge";
import {
  getBundles,
  getPriceItems,
  getSettings,
} from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Carpet Cleaning — Njord Approved Cleaners",
  description:
    "An instant fixed price for carpet and upholstery cleaning, carried out by a Njord Approved cleaner — trained, certified, insured and using the Njord cleaning system.",
  // A working duplicate of /book. Kept out of the index so it can't compete
  // with the real booking page or pick up ad traffic by accident.
  robots: { index: false, follow: false },
};

export default async function BookTestPage() {
  const [items, bundles, settings] = await Promise.all([
    getPriceItems(true),
    getBundles(true),
    getSettings(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <header className="relative overflow-hidden bg-slate-900 pb-14 pt-14">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,153,245,0.22),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <NjordBadge className="mx-auto mb-6 h-auto w-full max-w-[320px]" />

            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Your fixed price in under a minute
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              No home visit, no haggling, nothing to pay upfront. Enter your
              postcode, choose a slot, and your job is carried out by a Njord
              Approved cleaner.
            </p>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
              {[
                "Trained & certified",
                "Fully insured",
                "The Njord cleaning system",
              ].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span className="text-primary-400">✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="pt-10">
          <BookingFlow
            items={items}
            bundles={bundles}
            minimumChargePence={settings.minimum_charge_pence}
            commissionPct={Number(settings.commission_pct)}
            protectionPct={Number(settings.protection_pct)}
            protectionEnabled={settings.protection_enabled}
            landing={
              <>
                <div className="mt-16">
                  <NjordApproved audience="customer" />
                </div>
                <BookingLanding
                  items={items}
                  bundles={bundles}
                  minimumChargePence={settings.minimum_charge_pence}
                />
              </>
            }
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
