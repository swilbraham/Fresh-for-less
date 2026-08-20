import { redirect } from "next/navigation";
import Link from "next/link";
import { currentCleaner } from "@/lib/marketplace/auth";
import {
  getCleanerAreas,
  listInvoices,
  listJobsForCleaner,
  listOffersForCleaner,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import type { Job } from "@/lib/marketplace/types";
import {
  acceptJobAction,
  completeJobAction,
  declineJobAction,
  logoutAction,
} from "../actions";
import {
  Alert,
  Card,
  ProNav,
  StatusPill,
} from "@/components/marketplace/shell";
import AutoRefresh from "@/components/marketplace/AutoRefresh";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your jobs", robots: { index: false } };

function slotLabel(job: Job): string {
  const date = new Date(`${job.slot_date}T12:00:00`).toLocaleDateString(
    "en-GB",
    { weekday: "short", day: "numeric", month: "short" }
  );
  return `${date} · ${job.slot_window === "am" ? "Morning 8am–12pm" : "Afternoon 12pm–5pm"}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; accepted?: string; completed?: string }>;
}) {
  const cleaner = await currentCleaner();
  if (!cleaner) redirect("/pro");

  const { error, accepted, completed } = await searchParams;
  const [offers, upcoming, done, areas, invoices] = await Promise.all([
    listOffersForCleaner(cleaner.id),
    listJobsForCleaner(cleaner.id, ["accepted"]),
    listJobsForCleaner(cleaner.id, ["completed"]),
    getCleanerAreas(cleaner.id),
    listInvoices(cleaner.id),
  ]);

  const earned = done.reduce((sum, job) => sum + job.total_pence, 0);
  const owed = invoices
    .filter((invoice) => invoice.status === "issued")
    .reduce((sum, invoice) => sum + invoice.total_pence, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <ProNav name={cleaner.name} />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {accepted && <Alert tone="success">Job accepted — it&apos;s yours.</Alert>}
        {completed && (
          <Alert tone="success">
            Job marked complete. Commission has been added to your next invoice.
          </Alert>
        )}

        {cleaner.status === "pending" && (
          <Alert tone="info">
            <strong>Your account is awaiting approval.</strong> We&apos;re
            checking your details — jobs will start appearing here as soon as
            you&apos;re switched on.
          </Alert>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Jobs completed" value={String(done.length)} />
          <Stat label="Collected from customers" value={gbp(earned)} />
          <Stat label="Commission outstanding" value={gbp(owed)} />
        </div>

        {/* Live offers */}
        <Card
          title={`Available jobs (${offers.length})`}
          description="First cleaner to accept keeps the job."
          className="mb-6"
        >
          <AutoRefresh />
          {offers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Nothing available right now.{" "}
              {areas.length === 0 ? (
                <>
                  You haven&apos;t set any coverage yet —{" "}
                  <Link
                    href="/pro/coverage"
                    className="font-semibold text-primary-600 underline"
                  >
                    add your postcode areas
                  </Link>
                  .
                </>
              ) : (
                <>Covering {areas.join(", ")}.</>
              )}
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {offers.map((job) => (
                <li
                  key={job.id}
                  className="rounded-xl border border-primary-200 bg-primary-50/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {job.outward}
                        {job.town ? ` · ${job.town}` : ""}
                      </p>
                      <p className="text-sm text-slate-600">{slotLabel(job)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 tabular-nums">
                        {gbp(job.total_pence)}
                      </p>
                      <p className="text-xs text-slate-500">
                        less {gbp(job.commission_pence)} commission
                      </p>
                    </div>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                    {job.items.map((line) => (
                      <li
                        key={line.code}
                        className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200"
                      >
                        {line.qty} × {line.label}
                      </li>
                    ))}
                  </ul>

                  {job.notes && (
                    <p className="mt-3 text-sm text-slate-600">
                      <span className="font-semibold">Customer notes:</span>{" "}
                      {job.notes}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <form action={acceptJobAction} className="flex-1">
                      <input type="hidden" name="jobId" value={job.id} />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-accent-600 px-5 py-2.5 font-semibold text-white transition hover:bg-accent-700"
                      >
                        Accept this job
                      </button>
                    </form>
                    <form action={declineJobAction}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        Pass
                      </button>
                    </form>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Full address and phone number are shared the moment you
                    accept.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Accepted work */}
        <Card
          title={`Your diary (${upcoming.length})`}
          description="Jobs you've accepted. Mark them complete once you're finished and paid."
          className="mb-6"
        >
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No jobs booked in yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((job) => (
                <li
                  key={job.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {job.customer_name} · {job.ref}
                      </p>
                      <p className="text-sm text-slate-600">{slotLabel(job)}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {job.address_line}
                        {job.town ? `, ${job.town}` : ""}, {job.postcode}
                      </p>
                      <a
                        href={`tel:${job.customer_phone}`}
                        className="text-sm font-semibold text-primary-600 underline"
                      >
                        {job.customer_phone}
                      </a>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900 tabular-nums">
                        {gbp(job.total_pence)}
                      </p>
                      <p className="text-xs text-slate-500">
                        collect from customer
                      </p>
                    </div>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                    {job.items.map((line) => (
                      <li
                        key={line.code}
                        className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700"
                      >
                        {line.qty} × {line.label}
                      </li>
                    ))}
                  </ul>

                  {job.notes && (
                    <p className="mt-3 text-sm text-slate-600">
                      <span className="font-semibold">Customer notes:</span>{" "}
                      {job.notes}
                    </p>
                  )}

                  <form action={completeJobAction} className="mt-4">
                    <input type="hidden" name="jobId" value={job.id} />
                    <button
                      type="submit"
                      className="rounded-xl bg-primary-600 px-5 py-2.5 font-semibold text-white transition hover:bg-primary-700"
                    >
                      Mark complete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* History */}
        <Card title={`Completed (${done.length})`} className="mb-6">
          {done.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nothing completed yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Ref</th>
                    <th className="py-2 font-semibold">Date</th>
                    <th className="py-2 font-semibold">Postcode</th>
                    <th className="py-2 text-right font-semibold">Job value</th>
                    <th className="py-2 text-right font-semibold">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {done.map((job) => (
                    <tr key={job.id}>
                      <td className="py-2 font-medium text-slate-800">{job.ref}</td>
                      <td className="py-2 text-slate-600">{job.slot_date}</td>
                      <td className="py-2 text-slate-600">{job.postcode}</td>
                      <td className="py-2 text-right tabular-nums">
                        {gbp(job.total_pence)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-slate-500">
                        {gbp(job.commission_pence)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <StatusPill status={cleaner.status} />
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm font-semibold text-slate-500 underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </p>
    </div>
  );
}
