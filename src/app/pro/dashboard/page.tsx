import { redirect } from "next/navigation";
import Link from "next/link";
import { currentCleaner } from "@/lib/marketplace/auth";
import {
  getCleanerAreas,
  listInvoices,
  listJobsForCleaner,
  listOffersForCleaner,
  listOpenJobs,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import {
  COMMISSION_TERMS_SHORT,
  formatCommissionRun,
} from "@/lib/marketplace/terms";
import type { Job } from "@/lib/marketplace/types";
import {
  acceptJobAction,
  completeJobAction,
  declineJobAction,
  disputeJobAction,
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

/** How many days ago a slot date was, used to close the dispute window. */
function daysSince(slotDate: string): number {
  const then = Date.parse(`${slotDate}T12:00:00Z`);
  if (Number.isNaN(then)) return Number.MAX_SAFE_INTEGER;
  return Math.floor((Date.now() - then) / 86_400_000);
}

/** The window for saying a job never happened, before it becomes a phone call. */
const DISPUTE_DAYS = 7;

// Has the job's slot been and gone? Windows end at 12pm and 5pm London time.
function slotOver(job: Pick<Job, "slot_date" | "slot_window">): boolean {
  const london = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/London" })
  );
  const today = `${london.getFullYear()}-${String(london.getMonth() + 1).padStart(2, "0")}-${String(london.getDate()).padStart(2, "0")}`;
  if (job.slot_date < today) return true;
  if (job.slot_date > today) return false;
  return london.getHours() >= (job.slot_window === "am" ? 12 : 17);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    accepted?: string;
    completed?: string;
    released?: string;
    disputed?: string;
  }>;
}) {
  const cleaner = await currentCleaner();
  if (!cleaner) redirect("/pro?next=/pro/dashboard");

  const { error, accepted, completed, released, disputed } = await searchParams;
  const [offers, openJobs, upcoming, done, areas, invoices] = await Promise.all([
    listOffersForCleaner(cleaner.id),
    listOpenJobs(),
    listJobsForCleaner(cleaner.id, ["accepted"]),
    listJobsForCleaner(cleaner.id, ["completed"]),
    getCleanerAreas(cleaner.id),
    listInvoices(cleaner.id),
  ]);

  // The board is everything unclaimed that is not already sitting in their own
  // offers above — including areas they never registered. A cleaner who would
  // travel for a big job beats an empty slot, and they can see where it is
  // before deciding.
  const offeredIds = new Set(offers.map((job) => job.id));
  const board = cleaner.paused_at
    ? []
    : openJobs.filter((job) => !offeredIds.has(job.id));

  const earned = done.reduce((sum, job) => sum + job.total_pence, 0);

  // Jobs the evening run completed on their behalf. They never clicked
  // anything, so this is the only place they get to say it didn't happen.
  const assumed = done.filter(
    (job) =>
      job.completion_assumed &&
      !job.cleaner_disputed_at &&
      daysSince(job.slot_date) <= DISPUTE_DAYS
  );

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
        {disputed && (
          <Alert tone="info">
            Thank you — we&apos;ve recorded that this job didn&apos;t happen and
            the office has been told.{" "}
            {disputed !== "1"
              ? `It has been taken off invoice ${disputed}, so there is nothing to pay on it.`
              : "No commission is due on it."}
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
                  ? `${gbp(invoiced)} invoiced · next run ${formatCommissionRun()}`
                  : `Invoiced ${formatCommissionRun()}`
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

                  {job.parking && (
                    <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
                      <span className="font-semibold">Parking:</span>{" "}
                      {job.parking}
                    </p>
                  )}
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

        {/* Everything unclaimed, wherever it is */}
        <Card
          title={`Open jobs anywhere (${board.length})`}
          description="Unclaimed work across the whole network, including areas you haven't registered. First to accept keeps it."
          className="mb-6"
        >
          {cleaner.paused_at ? (
            <p className="mt-4 text-sm text-slate-500">
              Your account is paused, so you aren&apos;t being offered work at
              the moment. Give the office a ring when you want switching back
              on.
            </p>
          ) : board.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Nothing unclaimed right now. Anything that comes in and isn&apos;t
              taken will appear here, even if you missed the text.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {board.map((job) => (
                <li
                  key={job.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {job.outward}
                        {job.town ? ` · ${job.town}` : ""}
                      </p>
                      <p className="text-sm text-slate-600">{slotLabel(job)}</p>
                      <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                        {job.items.map((line) => (
                          <li
                            key={line.code}
                            className="rounded-full bg-slate-50 px-2.5 py-1 font-medium text-slate-700 ring-1 ring-slate-200"
                          >
                            {line.qty} × {line.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        You keep
                      </p>
                      <p className="text-2xl font-bold text-accent-700 tabular-nums">
                        {gbp(job.total_pence - job.commission_pence)}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Collect {gbp(job.total_pence)} on the day
                      </p>
                    </div>
                  </div>

                  <form action={acceptJobAction} className="mt-4">
                    <input type="hidden" name="jobId" value={job.id} />
                    <SubmitButton
                      pendingLabel="Accepting…"
                      className="w-full rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                    >
                      Accept this job
                    </SubmitButton>
                  </form>
                  <p className="mt-2 text-xs text-slate-500">
                    Only take it if you can genuinely get there — the customer
                    is told you&apos;re coming the moment you accept.
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
                  className={`rounded-xl border p-4 ${
                    slotOver(job)
                      ? "border-amber-300 bg-amber-50/50"
                      : "border-slate-200"
                  }`}
                >
                  {slotOver(job) && (
                    <p className="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
                      This clean&apos;s time slot has finished — all done and
                      paid? Tap &ldquo;Mark complete&rdquo; below so it goes on
                      your invoice correctly. Didn&apos;t happen? Use
                      &ldquo;Can&apos;t make it?&rdquo; or reply to our text.
                    </p>
                  )}
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

                  {job.parking && (
                    <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
                      <span className="font-semibold">Parking:</span>{" "}
                      {job.parking}
                    </p>
                  )}
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

                    {slotOver(job) && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-semibold text-slate-500 hover:text-red-600">
                          This didn&apos;t happen
                        </summary>
                        <form
                          action={disputeJobAction}
                          className="mt-3 flex flex-wrap items-end gap-2"
                        >
                          <input type="hidden" name="jobId" value={job.id} />
                          <input
                            name="reason"
                            placeholder="What happened? (optional)"
                            aria-label="Why this job didn't happen"
                            className="rounded-xl border border-slate-300 px-3 py-2"
                          />
                          <SubmitButton
                            pendingLabel="Sending…"
                            className="rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            Tell the office
                          </SubmitButton>
                          <p className="w-full text-xs text-slate-500">
                            Use this if the clean never took place — nobody in,
                            cancelled at the door, anything else. It stops the
                            job being invoiced, and if it already has been, the
                            charge comes off.
                          </p>
                        </form>
                      </details>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Completed without them clicking anything */}
        {assumed.length > 0 && (
          <Card
            title={`Completed for you (${assumed.length})`}
            description="You didn't mark these complete, so we assumed they went ahead and invoiced them. If any of them didn't happen, say so here."
            className="mb-6"
          >
            <ul className="mt-4 space-y-3">
              {assumed.map((job) => (
                <li
                  key={job.id}
                  className="rounded-xl border border-amber-300 bg-amber-50/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {job.customer_name} · {job.ref}
                      </p>
                      <p className="text-sm text-slate-600">{slotLabel(job)}</p>
                      <p className="text-sm text-slate-600">{job.postcode}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 tabular-nums">
                      {gbp(job.commission_pence)} commission
                    </p>
                  </div>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-semibold text-slate-500 hover:text-red-600">
                      This didn&apos;t happen
                    </summary>
                    <form
                      action={disputeJobAction}
                      className="mt-3 flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="jobId" value={job.id} />
                      <input
                        name="reason"
                        placeholder="What happened? (optional)"
                        aria-label={`Why ${job.ref} didn't happen`}
                        className="rounded-xl border border-slate-300 px-3 py-2"
                      />
                      <SubmitButton
                        pendingLabel="Sending…"
                        className="rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Tell the office
                      </SubmitButton>
                      <p className="w-full text-xs text-slate-500">
                        The charge comes off your invoice and the office is
                        told. You have {DISPUTE_DAYS} days from the clean to do
                        this here — after that, give us a ring.
                      </p>
                    </form>
                  </details>
                </li>
              ))}
            </ul>
          </Card>
        )}

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
                      <td className="py-2 font-medium text-slate-800">
                        {job.ref}
                        {job.completion_assumed && (
                          <span className="ml-1 text-xs font-normal text-amber-700">
                            assumed
                          </span>
                        )}
                      </td>
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
