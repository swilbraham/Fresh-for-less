import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { listJobs, type JobRow } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diary",
  robots: { index: false, follow: false },
};

const DAYS_SHOWN = 14;

function iso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function dayLabel(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** One job as a diary line: who's doing it, or loudly nobody. */
function JobLine({ job }: { job: JobRow }) {
  const needsCleaner = ["offered", "unfilled", "provisional"].includes(
    job.status
  );
  return (
    <li
      className={`rounded-xl border px-3 py-2 text-sm ${
        needsCleaner
          ? "border-red-200 bg-red-50"
          : job.status === "completed"
            ? "border-slate-200 bg-slate-50 text-slate-500"
            : "border-accent-200 bg-accent-50/50"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span>
          <Link
            href={`/admin/jobs/${job.ref}`}
            className="font-semibold text-primary-600 underline"
          >
            {job.ref}
          </Link>
          <span className="ml-2 text-slate-700">
            {job.customer_name} · {job.postcode}
          </span>
        </span>
        <span className="font-semibold tabular-nums text-slate-700">
          {gbp(job.total_pence)}
        </span>
      </div>
      <p className={`mt-0.5 text-xs ${needsCleaner ? "font-semibold text-red-700" : "text-slate-500"}`}>
        {job.cleaner_name
          ? `${job.cleaner_name}${job.status === "completed" ? " · done" : ""}`
          : job.status === "provisional"
            ? "No cover for this postcode — needs a call"
            : job.offers > 0
              ? `NO CLEANER — offered to ${job.offers}, nobody accepted`
              : "NO CLEANER — nobody offered yet"}
      </p>
    </li>
  );
}

export default async function DiaryPage() {
  if (!(await isAdmin())) redirect("/admin");

  const today = new Date();
  const end = new Date();
  end.setDate(end.getDate() + DAYS_SHOWN - 1);

  const jobs = await listJobs({
    from: iso(today),
    to: iso(end),
    sort: "soonest",
  });
  const active = jobs.filter((job) => job.status !== "cancelled");

  const byDay = new Map<string, { am: JobRow[]; pm: JobRow[] }>();
  for (const job of active) {
    const day = byDay.get(job.slot_date) ?? { am: [], pm: [] };
    day[job.slot_window === "am" ? "am" : "pm"].push(job);
    byDay.set(job.slot_date, day);
  }

  const days: string[] = [];
  for (let i = 0; i < DAYS_SHOWN; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(iso(date));
  }

  const jobCount = active.length;
  const needCleaner = active.filter((job) =>
    ["offered", "unfilled", "provisional"].includes(job.status)
  ).length;

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Diary — next {DAYS_SHOWN} days
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {jobCount} job{jobCount === 1 ? "" : "s"} booked
          {needCleaner > 0 && (
            <span className="ml-1 font-semibold text-red-600">
              — {needCleaner} still without a cleaner
            </span>
          )}
          . Older or further-out work is on{" "}
          <Link href="/admin/jobs" className="font-semibold text-primary-600 underline">
            Jobs
          </Link>
          .
        </p>

        <div className="mt-6 space-y-4">
          {days.map((day) => {
            const slots = byDay.get(day);
            const count = (slots?.am.length ?? 0) + (slots?.pm.length ?? 0);
            return (
              <section
                key={day}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  count > 0 ? "border-slate-200" : "border-slate-100"
                }`}
              >
                <h2 className="flex items-baseline justify-between text-sm font-bold text-slate-900">
                  {dayLabel(day)}
                  <span className="text-xs font-normal text-slate-400">
                    {count === 0 ? "nothing booked" : `${count} job${count === 1 ? "" : "s"}`}
                  </span>
                </h2>
                {count > 0 && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {(["am", "pm"] as const).map((window) => (
                      <div key={window}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {window === "am" ? "Morning 8–12" : "Afternoon 12–5"}
                        </p>
                        {(slots?.[window].length ?? 0) === 0 ? (
                          <p className="mt-2 text-xs text-slate-400">—</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {slots![window].map((job) => (
                              <JobLine key={job.id} job={job} />
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
