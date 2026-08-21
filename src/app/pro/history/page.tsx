import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCleaner } from "@/lib/marketplace/auth";
import { jobTotals, listJobs } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { Card, ProNav, StatusPill } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = { title: "Your job history", robots: { index: false } };

const STATUSES = ["completed", "accepted", "cancelled"] as const;

function longDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string; q?: string }>;
}) {
  const cleaner = await currentCleaner();
  if (!cleaner) redirect("/pro?next=/pro/history");

  const { status, from, to, q } = await searchParams;

  // cleanerId is set from the session, never from the query string — a cleaner
  // must not be able to read another's jobs by editing the URL.
  const filters = { status, from, to, q, cleanerId: cleaner.id };
  const [jobs, totals] = await Promise.all([
    listJobs(filters),
    jobTotals(filters),
  ]);

  const kept = totals.value_pence - totals.commission_pence;
  const tabHref = (next?: string) => {
    const params = new URLSearchParams();
    if (next) params.set("status", next);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (q) params.set("q", q);
    const query = params.toString();
    return query ? `/pro/history?${query}` : "/pro/history";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <ProNav name={cleaner.name} />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">
          Your job history
        </h1>

        <nav className="mb-4 flex flex-wrap gap-2">
          <Link
            href={tabHref()}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              !status
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            All
          </Link>
          {STATUSES.map((value) => (
            <Link
              key={value}
              href={tabHref(value)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition ${
                status === value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {value}
            </Link>
          ))}
        </nav>

        <form
          method="get"
          className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          {status && <input type="hidden" name="status" value={status} />}
          <div>
            <label htmlFor="from" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              From
            </label>
            <input id="from" name="from" type="date" defaultValue={from ?? ""} className="mt-1 rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="to" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              To
            </label>
            <input id="to" name="to" type="date" defaultValue={to ?? ""} className="mt-1 rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div className="min-w-[180px] flex-1">
            <label htmlFor="q" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </label>
            <input id="q" name="q" defaultValue={q ?? ""} placeholder="Reference, customer or postcode" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <button type="submit" className="rounded-xl bg-primary-600 px-5 py-2.5 font-semibold text-white">
            Apply
          </button>
          {(status || from || to || q) && (
            <Link href="/pro/history" className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600">
              Clear
            </Link>
          )}
        </form>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Jobs shown", value: String(totals.jobs), hint: "Including cancelled" },
            { label: "Collected from customers", value: gbp(totals.value_pence), hint: "Excludes cancelled" },
            { label: "You kept", value: gbp(kept), hint: "After commission on completed work" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4">
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

        <Card>
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500">
              No jobs match that. Once you&apos;ve completed work it&apos;ll all
              be listed here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <li key={job.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {longDate(job.slot_date)}{" "}
                        <span className="text-sm font-normal text-slate-500">
                          {job.slot_window === "am" ? "Morning" : "Afternoon"}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        {job.customer_name} · {job.address_line}
                        {job.town ? `, ${job.town}` : ""}, {job.postcode}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{job.ref}</p>
                    </div>
                    <div className="text-right">
                      <StatusPill status={job.status} />
                      <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                        {gbp(job.total_pence)}
                      </p>
                      {job.status === "completed" && (
                        <p className="text-xs text-accent-700">
                          kept {gbp(job.total_pence - job.commission_pence)}
                        </p>
                      )}
                    </div>
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                    {job.items.map((line) => (
                      <li key={line.code} className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                        {line.qty} × {line.label}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}
