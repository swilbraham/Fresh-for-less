import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getJobByRef,
  getJobDrops,
  getJobOffers,
  listCleaners,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { AdminNav, Alert, Card, StatusPill } from "@/components/marketplace/shell";
import {
  assignJobAction,
  cancelJobAction,
  waiveCommissionAction,
  reassignJobAction,
  rebroadcastJobAction,
} from "../../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Job", robots: { index: false, follow: false } };

function longDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AdminJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ error?: string; waived?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { ref } = await params;
  const { error, waived } = await searchParams;

  const job = await getJobByRef(ref.toUpperCase());
  if (!job) notFound();

  const [offers, drops, cleaners] = await Promise.all([
    getJobOffers(job.id),
    getJobDrops(job.id),
    listCleaners("approved"),
  ]);

  const keeps = job.total_pence - job.commission_pence;
  const open = !["completed", "cancelled"].includes(job.status);

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/admin/jobs"
          className="text-sm font-semibold text-slate-600 hover:text-primary-600"
        >
          ← All jobs
        </Link>

        <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{job.ref}</h1>
          <StatusPill status={job.status} />
          {job.rescheduled_count > 0 && (
            <span className="text-sm text-slate-500">
              moved {job.rescheduled_count}×
            </span>
          )}
        </div>

        {error && <Alert>{error}</Alert>}
        {waived && (
          <Alert tone="success">
            Commission waived — this job won&apos;t be invoiced.
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="The job">
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="When" value={`${longDate(job.slot_date)} · ${job.slot_window === "am" ? "Morning 8am–12pm" : "Afternoon 12pm–5pm"}`} />
              <Row label="Where" value={`${job.address_line}${job.town ? `, ${job.town}` : ""}, ${job.postcode}`} />
              <Row label="Booked" value={job.created_at} />
            </dl>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              What was booked
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {job.items.map((line) => (
                <li key={line.code} className="flex justify-between gap-3">
                  <span className="text-slate-700">
                    {line.qty} × {line.label}
                    {line.note && (
                      <span className="block text-xs text-accent-700">{line.note}</span>
                    )}
                  </span>
                  <span className="tabular-nums font-medium">{gbp(line.amount_pence)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
              <Row label="Customer pays" value={gbp(job.total_pence)} strong />
              <Row
                label={
                  job.commission_pence === 0
                    ? "Commission — waived"
                    : `Commission (${Number(job.commission_pct)}%)`
                }
                value={gbp(job.commission_pence)}
              />
              <Row label="Cleaner keeps" value={gbp(keeps)} />
            </dl>

            {job.notes && (
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <span className="font-semibold">Customer notes:</span> {job.notes}
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card title="Customer">
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Name" value={job.customer_name} />
                <Row label="Phone" value={job.customer_phone} />
                <Row label="Email" value={job.customer_email} />
              </dl>
            </Card>

            <Card title="Cleaner">
              {job.cleaner_id ? (
                <p className="mt-2 text-sm text-slate-700">
                  Assigned — see the offer history below.
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Nobody assigned yet.
                </p>
              )}

              {open && cleaners.length > 0 && (
                <form action={assignJobAction} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={job.id} />
                  <select
                    name="cleanerId"
                    defaultValue=""
                    aria-label="Assign to a cleaner"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Assign to…</option>
                    {cleaners.map((cleaner) => (
                      <option key={cleaner.id} value={cleaner.id}>
                        {cleaner.name}
                        {cleaner.business_name ? ` — ${cleaner.business_name}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Assign
                  </button>
                  <label className="flex w-full items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      name="waiveCommission"
                      className="h-4 w-4 rounded border-slate-300 accent-accent-600"
                    />
                    No commission on this job — don&apos;t invoice it
                  </label>
                </form>
              )}

              {open && (
                <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs">
                  {job.status === "accepted" && (
                    <form action={reassignJobAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <button type="submit" className="font-semibold text-primary-600 underline">
                        Take off this cleaner &amp; re-offer
                      </button>
                    </form>
                  )}
                  {["provisional", "unfilled", "offered"].includes(job.status) && (
                    <form action={rebroadcastJobAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <button type="submit" className="font-semibold text-primary-600 underline">
                        Re-broadcast
                      </button>
                    </form>
                  )}
                  {job.commission_pence > 0 && (
                    <form action={waiveCommissionAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <input type="hidden" name="ref" value={job.ref} />
                      <button type="submit" className="font-semibold text-slate-600 underline">
                        Waive commission
                      </button>
                    </form>
                  )}
                  <form action={cancelJobAction}>
                    <input type="hidden" name="id" value={job.id} />
                    <button type="submit" className="font-semibold text-red-600 underline">
                      Cancel booking
                    </button>
                  </form>
                </div>
              )}
            </Card>
          </div>
        </div>

        <Card title={`Offered to ${offers.length} cleaner${offers.length === 1 ? "" : "s"}`} className="mt-6">
          {offers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Not offered to anyone yet — nobody covers {job.outward}, or it&apos;s
              still provisional.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {offers.map((offer) => (
                <li key={offer.cleaner_id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span className="text-slate-700">
                    {offer.cleaner_name}
                    {offer.business_name ? ` · ${offer.business_name}` : ""}
                    <span className="block text-xs text-slate-500">
                      {offer.phone} · offered {offer.sent_at}
                    </span>
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      offer.response === "accepted"
                        ? "text-accent-700"
                        : offer.response === "declined"
                          ? "text-red-600"
                          : "text-slate-400"
                    }`}
                  >
                    {offer.response
                      ? `${offer.response} ${offer.responded_at ?? ""}`
                      : "no reply yet"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {drops.length > 0 && (
          <Card title="Handed back" className="mt-6">
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {drops.map((drop, index) => (
                <li key={index} className="py-2">
                  <span className="font-medium text-slate-800">{drop.cleaner_name}</span>{" "}
                  <span className="text-slate-500">
                    ({drop.dropped_by}) · {Math.round(Number(drop.hours_notice))}h notice ·{" "}
                    {drop.dropped_at}
                  </span>
                  {drop.reason && (
                    <span className="block text-xs text-slate-600">{drop.reason}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right ${strong ? "font-bold text-slate-900" : "text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}
