import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCleaner } from "@/lib/marketplace/auth";
import { getSettings } from "@/lib/marketplace/repo";
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
  searchParams: Promise<{ error?: string }>;
}) {
  if (await currentCleaner()) redirect("/pro/dashboard");
  const { error } = await searchParams;
  const settings = await getSettings();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 pt-10 pb-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 lg:grid-cols-2">
        <div>
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
                `You pay ${Number(settings.commission_pct)}% commission on completed jobs only. Nothing for quotes that go nowhere.`,
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

          <Link
            href="/pro/register"
            className="mt-8 inline-block rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700"
          >
            Apply to join
          </Link>
        </div>

        <div>
          {error && <Alert>{error}</Alert>}
          <Card title="Cleaner sign in">
            <form action={loginAction} className="mt-4 space-y-4">
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
