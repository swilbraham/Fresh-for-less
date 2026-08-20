import type { Metadata } from "next";
import Link from "next/link";
import BookingFlow from "@/components/marketplace/BookingFlow";
import {
  getBundles,
  getPriceItems,
  getSettings,
} from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a carpet clean — instant fixed price",
  description:
    "Get an instant fixed price for carpet and upholstery cleaning, pick your date, and we'll match you with a vetted independent cleaner covering your postcode.",
  alternates: { canonical: "/book" },
};

export default async function BookPage() {
  const [items, bundles, settings] = await Promise.all([
    getPriceItems(true),
    getBundles(true),
    getSettings(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 pt-28">
      <header className="mx-auto max-w-3xl px-4 pb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          Instant fixed price
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Book a vetted carpet cleaner
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Your price is fixed before you book — no surveys, no surprises. We
          match your job to independent cleaners covering your postcode and the
          first one free takes it.
        </p>
      </header>

      <BookingFlow
        items={items}
        bundles={bundles}
        minimumChargePence={settings.minimum_charge_pence}
        commissionPct={Number(settings.commission_pct)}
      />

      <footer className="mx-auto max-w-3xl px-4 pb-16 pt-8 text-center text-sm text-slate-500">
        <p>
          Are you a carpet cleaner?{" "}
          <Link href="/pro" className="font-semibold text-primary-600 underline">
            Get jobs in your area
          </Link>
        </p>
      </footer>
    </main>
  );
}
