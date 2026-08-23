import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  jobStatusCounts,
  jobTotals,
  listCleaners,
  listJobs,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import {
  assignJobAction,
  cancelJobAction,
  reassignJobAction,
  rebroadcastJobAction,
} from "../actions";
import Link from "next/link";
import { AdminNav, Alert, Card, StatusPill } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs",
  robots: { index: false, follow: false },
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    offered?: string;
    assigned?: string;
    status?: string;
    group?: string;
    sort?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { error, saved, offered, assigned, status, group, sort, from, to, q } =
    await searchParams;

  const isGroup = group === "outstanding" || group === "attention";
  // Upcoming work reads soonest-first; finished work reads newest-first.
  const sortOrder =
    sort === "soonest" || sort === "latest"
      ? (sort as "soonest" | "latest")
      : isGroup
        ? "soonest"
        : "latest";

  const filters = {
    status,
    from,
    to,
    q,
    group: isGroup ? (group as "outstanding" | "attention") : undefined,
    sort: sortOrder,
  };
  const [jobs, totals, counts, approvedCleaners] = await Promise.all([
    listJobs(filters),
    jobTotals(filters),
    jobStatusCounts(filters),
    listCleaners("approved"),
  ]);

  const STATUSES = [
    "provisional",
    "offered",
    "accepted",
    "completed",
    "unfilled",
    "cancelled",
  ] as const;

  // Preserve the other filters when switching status tab.
  const href = (over: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { status, group, sort, from, to, q, ...over };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const query = params.toString();
    return query ? `/admin/jobs?${query}` : "/admin/jobs";
  };
  const tabHref = (next?: string) =>
    href({ status: next, group: undefined });

  const filtered = Boolean(status || group || from || to || q);

  const iso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  const today = iso(new Date());
  const inDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return iso(date);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Job updated.</Alert>}
        {assigned && <Alert tone="success">Job assigned and both sides told.</Alert>}
        {offered !== undefined && (
          <Alert tone="success">
            Re-broadcast to {offered} cleaner{offered === "1" ? "" : "s"}.
          </Alert>
        )}

        <h1 className="mb-4 text-2xl font-bold text-slate-900">Jobs</h1>

        {/* Status tabs */}
        <nav className="mb-4 flex flex-wrap gap-2">
          <Link
            href={tabHref()}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              !status && !isGroup
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary-300"
            }`}
          >
            All ({counts.__all ?? 0})
          </Link>
          <Link
            href={href({ group: "outstanding", status: undefined })}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              group === "outstanding"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary-300"
            }`}
          >
            Outstanding ({counts.__outstanding ?? 0})
          </Link>
          <Link
            href={href({ group: "attention", status: undefined })}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              group === "attention"
                ? "bg-red-600 text-white"
                : (counts.__attention ?? 0) > 0
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            Needs attention ({counts.__attention ?? 0})
          </Link>
          {STATUSES.map((value) => (
            <Link
              key={value}
              href={tabHref(value)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition ${
                status === value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary-300"
              }`}
            >
              {value} ({counts[value] ?? 0})
            </Link>
          ))}
        </nav>

        {/* Date range and search */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Quick view:</span>
          {[
            { label: "Today", from: today, to: today },
            { label: "Next 7 days", from: today, to: inDays(7) },
            { label: "Next 30 days", from: today, to: inDays(30) },
            { label: "Last 30 days", from: inDays(-30), to: today },
          ].map((range) => (
            <Link
              key={range.label}
              href={href({ from: range.from, to: range.to })}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                from === range.from && to === range.to
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary-300"
              }`}
            >
              {range.label}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-2 text-slate-500">
            Sort:
            <Link
              href={href({ sort: "soonest" })}
              className={`rounded-lg px-2.5 py-1 font-medium ${
                sortOrder === "soonest"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              Soonest first
            </Link>
            <Link
              href={href({ sort: "latest" })}
              className={`rounded-lg px-2.5 py-1 font-medium ${
                sortOrder === "latest"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              Latest first
            </Link>
          </span>
        </div>

        <form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          {status && <input type="hidden" name="status" value={status} />}
          {isGroup && <input type="hidden" name="group" value={group} />}
          <input type="hidden" name="sort" value={sortOrder} />
          <div>
            <label htmlFor="from" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Slot from
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={from ?? ""}
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Slot to
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={to ?? ""}
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label htmlFor="q" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Reference, name, postcode or town"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white"
          >
            Apply
          </button>
          {filtered && (
            <Link
              href="/admin/jobs"
              className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Totals for the current selection */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Jobs shown", value: String(totals.jobs), hint: "Including cancelled" },
            {
              label: "Booked value",
              value: gbp(totals.value_pence),
              hint: "Excludes cancelled & unfilled",
            },
            {
              label: "Commission earned",
              value: gbp(totals.commission_pence),
              hint: "Completed jobs only",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{stat.hint}</p>
            </div>
          ))}
        </div>

        {jobs.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              {filtered
                ? "No jobs match those filters."
                : "No bookings yet. Customers book at /book."}
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ref</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Slot</th>
                  <th className="px-4 py-3 font-semibold">Cleaner</th>
                  <th className="px-4 py-3 text-right font-semibold">Value</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Commission
                  </th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className={
                      job.status === "cancelled" ? "bg-slate-50/60 text-slate-400" : ""
                    }
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/admin/jobs/${job.ref}`}
                        className="text-primary-600 underline"
                      >
                        {job.ref}
                      </Link>
                      {job.items.length > 0 && (
                        <span className="block text-xs font-normal text-slate-500">
                          {job.items
                            .map((line) => `${line.qty}× ${line.label}`)
                            .join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{job.customer_name}</p>
                      <p className="text-xs text-slate-500">
                        {job.postcode} · {job.customer_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {job.slot_date}
                      <span className="ml-1 uppercase text-xs">
                        {job.slot_window}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.cleaner_name ?? (
                        <span className="text-slate-400">
                          {job.offers} offered
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {gbp(job.total_pence)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                      {gbp(job.commission_pence)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={job.status} />
                      {job.status === "cancelled" && job.cancelled_by && (
                        <p className="mt-1 text-xs text-slate-500">
                          by {job.cancelled_by}
                          {job.late_cancellation && (
                            <span className="ml-1 font-semibold text-red-600">
                              late
                            </span>
                          )}
                        </p>
                      )}
                      {job.rescheduled_count > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                          moved {job.rescheduled_count}×
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {(job.status === "unfilled" ||
                          job.status === "cancelled") && (
                          <form action={rebroadcastJobAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className="text-xs font-semibold text-primary-600 underline"
                            >
                              Re-broadcast
                            </button>
                          </form>
                        )}
                        {!["completed", "cancelled"].includes(job.status) &&
                          approvedCleaners.length > 0 && (
                            <form
                              action={assignJobAction}
                              className="flex items-center gap-1"
                            >
                              <input type="hidden" name="id" value={job.id} />
                              <select
                                name="cleanerId"
                                defaultValue=""
                                aria-label={`Assign ${job.ref} to a cleaner`}
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                              >
                                <option value="">Assign to…</option>
                                {approvedCleaners.map((cleaner) => (
                                  <option key={cleaner.id} value={cleaner.id}>
                                    {cleaner.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="text-xs font-semibold text-accent-700 underline"
                              >
                                Go
                              </button>
                            </form>
                          )}
                        {job.status === "accepted" && (
                          <form action={reassignJobAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              title="Take it off this cleaner and offer it to others — the customer keeps their slot"
                              className="text-xs font-semibold text-primary-600 underline"
                            >
                              Reassign
                            </button>
                          </form>
                        )}
                        {["offered", "accepted", "unfilled"].includes(
                          job.status
                        ) && (
                          <form action={cancelJobAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className="text-xs font-semibold text-red-600 underline"
                            >
                              Cancel
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
