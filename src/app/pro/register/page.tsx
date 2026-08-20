import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCleaner } from "@/lib/marketplace/auth";
import { registerAction } from "../actions";
import {
  Alert,
  AvailabilityGrid,
  Card,
  Field,
} from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply to join the cleaner network",
  robots: { index: false, follow: true },
};

const DEFAULT_AVAILABILITY = [1, 2, 3, 4, 5].map((weekday) => ({
  weekday,
  am: true,
  pm: true,
}));

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await currentCleaner()) redirect("/pro/dashboard");
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Apply to join the network
        </h1>
        <p className="mt-2 text-slate-600">
          We check insurance and experience before switching accounts on —
          usually within one working day.
        </p>

        <div className="mt-8">{error && <Alert>{error}</Alert>}</div>

        <form action={registerAction} className="space-y-6">
          <Card title="About you">
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Your name" name="name" required />
              <Field
                label="Trading name"
                name="businessName"
                placeholder="Optional"
              />
              <Field label="Email" name="email" type="email" required />
              <Field label="Mobile" name="phone" type="tel" required />
              <Field
                label="Password"
                name="password"
                type="password"
                required
                hint="At least 8 characters."
                className="sm:col-span-2"
              />
            </div>
          </Card>

          <Card
            title="Vetting"
            description="We won't switch your account on without public liability cover in place."
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Insurance provider"
                name="insuranceProvider"
                placeholder="e.g. Simply Business"
              />
              <Field
                label="Policy expiry"
                name="insuranceExpiry"
                type="date"
              />
              <Field
                label="Years of experience"
                name="yearsExperience"
                type="number"
                defaultValue={0}
              />
              <Field
                label="Machine / equipment"
                name="equipment"
                placeholder="e.g. Truckmount, Prochem Steempro"
              />
            </div>
          </Card>

          <Card
            title="Where you work"
            description="List the postcode areas you cover — just the first part, separated by spaces or commas."
          >
            <textarea
              name="coverage"
              rows={3}
              required
              placeholder="CH41 CH42 CH43 L1 L2 L3"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase placeholder:normal-case tracking-wide outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              You&apos;ll only be offered jobs inside these areas.
            </p>
          </Card>

          <Card
            title="When you work"
            description="Tick the half-days you can take jobs. You can change this any time and block out individual dates later."
          >
            <AvailabilityGrid availability={DEFAULT_AVAILABILITY} />
          </Card>

          <div className="flex gap-3">
            <Link
              href="/pro"
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600"
            >
              Back
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700"
            >
              Submit application
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
