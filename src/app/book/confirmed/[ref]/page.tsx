import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobByRef } from "@/lib/marketplace/repo";
import { bookingToken } from "@/lib/marketplace/auth";
import { gbp } from "@/lib/marketplace/money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

export default async function ConfirmedPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const job = await getJobByRef(ref.toUpperCase());
  if (!job) notFound();

  const itemsTotal = job.items.reduce((sum, line) => sum + line.amount_pence, 0);
  const minimumTopUp = Math.max(0, job.total_pence - itemsTotal);

  const date = new Date(`${job.slot_date}T12:00:00`).toLocaleDateString(
    "en-GB",
    { weekday: "long", day: "numeric", month: "long" }
  );

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-2xl border border-accent-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-3xl">
            ✓
          </div>
          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            You&apos;re booked in
          </h1>
          <p className="mt-2 text-slate-600">
            Reference <strong className="text-slate-900">{job.ref}</strong>. We
            emailed a copy to {job.customer_email}.
          </p>

          <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
            <Row label="Date" value={`${date} · ${job.slot_window === "am" ? "Morning 8am–12pm" : "Afternoon 12pm–5pm"}`} />
            <Row label="Address" value={`${job.address_line}${job.town ? `, ${job.town}` : ""}, ${job.postcode}`} />
            <Row label="Fixed price" value={`${gbp(job.total_pence)} — pay your cleaner on the day`} />
          </dl>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {job.status === "accepted" ? (
              <p>
                <strong className="text-slate-900">Cleaner confirmed.</strong>{" "}
                You&apos;ll get their name and number by email shortly.
              </p>
            ) : job.status === "unfilled" ? (
              <p>
                <strong className="text-slate-900">
                  We&apos;re finding you a cleaner.
                </strong>{" "}
                Nobody was free for that exact slot, so our team will call you on{" "}
                {job.customer_phone} to sort an alternative.
              </p>
            ) : (
              <p>
                <strong className="text-slate-900">
                  We&apos;re confirming your cleaner.
                </strong>{" "}
                Our vetted cleaners covering {job.outward} have been notified.
                We&apos;ll email you their name and number as soon as your job
                is confirmed.
              </p>
            )}
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
            What you booked
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {job.items.map((line) => (
              <li key={line.code} className="flex justify-between">
                <span>
                  {line.qty} × {line.label}
                  {line.note && (
                    <span className="ml-1 text-accent-700">({line.note})</span>
                  )}
                </span>
                <span className="font-semibold tabular-nums">
                  {gbp(line.amount_pence)}
                </span>
              </li>
            ))}
            {minimumTopUp > 0 && (
              <li className="flex justify-between text-slate-500">
                <span>Minimum charge applied</span>
                <span className="tabular-nums">+{gbp(minimumTopUp)}</span>
              </li>
            )}
            <li className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-900">
              <span>Total</span>
              <span className="tabular-nums">{gbp(job.total_pence)}</span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/booking/${job.ref}?t=${bookingToken(job.ref)}`}
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
            >
              Change or cancel this booking
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Back to the site
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            We&apos;ve texted and emailed you this link so you can find it later.
          </p>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 sm:text-right">{value}</dd>
    </div>
  );
}
