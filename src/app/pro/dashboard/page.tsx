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
import {
  COMMISSION_TERMS_SHORT,
  formatCommissionMonday,
} from "@/lib/marketplace/terms";
import type { Job } from "@/lib/marketplace/types";
import {
  acceptJobAction,
  completeJobAction,
  declineJobAction,
  logoutAction,
  releaseJobAction,
} from "../actions";
import {
  Alert,
  Card,
  ProNav,
  StatusPill,
} from "@/components/marketplace/shell";
import AutoRefresh from "@/components/marketplace/AutoRefresh";
import SubmitButton from "@/components/marketplace/SubmitButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your jobs", robots: { index: false } };

// Takes only what it needs, so it works for a redacted offer as well as a job.
function slotLabel(job: Pick<Job, "slot_date" | "slot_window">): string {
  const date = new Date(`${job.slot_date}T12:00:00`).toLocaleDateString(
    "en-GB",
    { weekday: "short", day: "numeric", month: "short" }
  );
  return `${date} · ${job.slot_window === "am" ? "Morning 8am–12pm" : "Afternoon 12pm–5pm"}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    accepted?: string;
    completed?: string;
    released?: string;
  }>;
}) {
  const cleaner = await currentCleaner();
  if (!cleaner) redirect("/pro?next=/pro/dashboard");

  const { error, accepted, completed, released } = await searchParams;
  const [offers, upcoming, done, areas, invoices] = await Promise.all([
    listOffersForCleaner(cleaner.id),
    listJobsForCleaner(cleaner.id, ["accepted"]),
    listJobsForCleaner(cleaner.id, ["completed"]),
    getCleanerAreas(cleaner.id),
    listInvoices(cleaner.id),
  ]);

  const earned = done.reduce((sum, job) => sum + job.total_pence, 0);

  // Everything earned on completed jobs, less whatever has actually been paid.
  // Counting only issued invoices read as "you owe nothing" in the gap between
  // finishing a job and the invoice being raised, which isn't true.
  const commissionToDate = done.reduce(
    (sum, job) => sum + job.commission_pence,
    0
  );
  const commissionPaid = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total_pence, 0);
  const owed = Math.max(0, commissionToDate - commissionPaid);
  const invoiced = invoices
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
        {released && (
          <Alert tone="info">
            Job handed back and offered to other cleaners. No commission is due.
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
          <Stat
            label="Commission owed"
            value={gbp(owed)}
            hint={
              owed === 0
                ? "Nothing to pay"
                : invoiced > 0
                  ? `${gbp(invoiced)} invoiced · next run ${formatCommissionMonday()}`
                  : `Invoiced ${formatCommissionMonday()}`
            }
          />
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        You keep
                      </p>
                      <p className="text-3xl font-bold text-accent-700 tabular-nums">
                        {gbp(job.total_pence - job.commission_pence)}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Collect {gbp(job.total_pence)} from the customer
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
                      <SubmitButton
                        pendingLabel="Accepting…"
                        className="w-full rounded-xl bg-accent-600 px-5 py-2.5 font-semibold text-white transition hover:bg-accent-700"
                      >
                        Accept this job
                      </SubmitButton>
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
                    Accept and the job is yours: you get the full address and
                    phone number straight away, you collect{" "}
                    {gbp(job.total_pence)} from the customer on the day, and you
                    keep {gbp(job.total_pence - job.commission_pence)}.{" "}
                    {COMMISSION_TERMS_SHORT}
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
                        to collect on the day
                      </p>
                      <p className="mt-1 text-sm font-semibold text-accent-700 tabular-nums">
                        You keep {gbp(job.total_pence - job.commission_pence)}
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

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <form action={completeJobAction}>
                      <input type="hidden" name="jobId" value={job.id} />
                      <SubmitButton
                        pendingLabel="Saving…"
                        className="rounded-xl bg-primary-600 px-5 py-2.5 font-semibold text-white transition hover:bg-primary-700"
                      >
                        Mark complete
                      </SubmitButton>
                    </form>

                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-slate-500 hover:text-red-600">
                        Can&apos;t make it?
                      </summary>
                      <form action={releaseJobAction} className="mt-3 flex flex-wrap items-end gap-2">
                        <input type="hidden" name="jobId" value={job.id} />
                        <input
                          name="reason"
                          placeholder="Reason (optional)"
                          aria-label="Reason for handing the job back"
                          className="rounded-xl border border-slate-300 px-3 py-2"
                        />
                        <SubmitButton
                          pendingLabel="Releasing…"
                          className="rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Hand this job back
                        </SubmitButton>
                        <p className="w-full text-xs text-slate-500">
                          It goes straight back to other cleaners. Tell us as
                          early as you can — drops inside 24 hours are recorded
                          and reviewed.
                        </p>
                      </form>
                    </details>
                  </div>
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

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
