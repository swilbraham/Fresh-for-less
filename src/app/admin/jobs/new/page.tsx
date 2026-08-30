import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { getBundles, getPriceItems, getSettings } from "@/lib/marketplace/repo";
import { AdminNav, Alert, Card, Field } from "@/components/marketplace/shell";
import PhoneBookingForm from "@/components/marketplace/PhoneBookingForm";
import { createPhoneBookingAction } from "../../actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New booking",
  robots: { index: false, follow: false },
};

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { error } = await searchParams;

  const [items, bundles, settings] = await Promise.all([
    getPriceItems(true),
    getBundles(true),
    getSettings(),
  ]);

  // Phone bookings deliberately ignore min_notice_days. That rule exists to
  // stop the website promising a slot nobody can staff; on the phone the diary
  // is in front of you, and urgent jobs are exactly what the number is for.
  const today = new Date();
  const earliest = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin/jobs" className="text-sm font-semibold text-slate-600 hover:text-primary-600">
          ← All jobs
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Book a job over the phone
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Goes out to cleaners exactly like an online booking. If nobody covers
          the postcode it&apos;s held as a request instead.
        </p>

        <div className="mt-6">{error && <Alert>{error}</Alert>}</div>

        <form action={createPhoneBookingAction} className="space-y-6">
          <Card title="What needs cleaning">
            <PhoneBookingForm
              items={items}
              bundles={bundles}
              minimumChargePence={settings.minimum_charge_pence}
              commissionPct={Number(settings.commission_pct)}
              protectionPct={Number(settings.protection_pct)}
              protectionEnabled={settings.protection_enabled}
            />
          </Card>

          <Card title="When">
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Date" name="slotDate" type="date" required defaultValue={earliest} />
              <div>
                <label htmlFor="slotWindow" className="block text-sm font-semibold text-slate-700">
                  Arrival window
                </label>
                <select
                  id="slotWindow"
                  name="slotWindow"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                >
                  <option value="am">Morning 8am–12pm</option>
                  <option value="pm">Afternoon 12pm–5pm</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Availability isn&apos;t checked here — you can book a slot the
              online form wouldn&apos;t offer, and assign it yourself if nobody
              takes it.
            </p>
          </Card>

          <Card title="Customer">
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="customerName" required />
              <Field label="Phone" name="customerPhone" type="tel" required />
              <Field
                label="Email (optional)"
                name="customerEmail"
                type="email"
                hint="Leave blank if they didn't give one — they'll still be texted."
                className="sm:col-span-2"
              />
              <Field label="Address" name="addressLine" className="sm:col-span-2" />
              <Field label="Town" name="town" />
              <Field label="Postcode" name="postcode" required />
              <Field
                label="Where can they park?"
                name="parking"
                className="sm:col-span-2"
                placeholder="Driveway, on the street, permit needed…"
              />
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-semibold text-slate-700">
                  Notes for the cleaner
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="Pets, access, anything else they mentioned"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                />
              </div>
            </div>
          </Card>

          <Card
            title="Agreed price (optional)"
            description="Leave blank to use the price above. Fill it in if you agreed something different on the call and this becomes the price — it is what the customer is confirmed at and what cleaners are offered. Commission is worked out on it. The list price is kept on the job for your reference only."
          >
            <Field label="Price agreed (£)" name="agreedPrice" className="mt-4 max-w-[200px]" />
          </Card>

          <div className="flex gap-3">
            <Link href="/admin/jobs" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600">
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700"
            >
              Create booking &amp; send to cleaners
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
