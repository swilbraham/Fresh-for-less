import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  cleanerLeaderboard,
  listSlaWarnings,
  slaForMonth,
  SLA_ACCEPT_PCT,
  SLA_DROP_NOTICE_HOURS,
  SLA_MAX_DROPS_PER_MONTH,
  SLA_RESPONSE_HOURS,
} from "@/lib/marketplace/repo";
import { promoteToAreaCleanerAction, sendSlaWarningAction } from "../actions";
import { Alert, Card } from "@/components/marketplace/shell";
import CopyButton from "@/components/marketplace/CopyButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Service levels",
  robots: { index: false, follow: false },
};

function monthLabel(month: string): string {
  return new Date(`${month}-01T12:00:00`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(month: string, by: number): string {
  const d = new Date(`${month}-01T12:00:00`);
  d.setMonth(d.getMonth() + by);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ServiceLevelsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    sent?: string;
    error?: string;
    promoted?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const params = await searchParams;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = /^\d{4}-\d{2}$/.test(params.month ?? "")
    ? params.month!
    : thisMonth;

  const [rows, warnings, leaders] = await Promise.all([
    slaForMonth(month),
    listSlaWarnings(),
    cleanerLeaderboard(),
  ]);

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Area cleaner service levels
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              The standards exclusivity is held to: at least {SLA_ACCEPT_PCT}%
              of offers accepted, a yes within {SLA_RESPONSE_HOURS} hours, no
              no-shows, and at most {SLA_MAX_DROPS_PER_MONTH} cancellation a
              month with {SLA_DROP_NOTICE_HOURS} hours&apos; notice. A miss gets
              a written notice; a second within three months lets you end
              exclusivity or reassign the patch.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a
              href={`/admin/service-levels?month=${shiftMonth(month, -1)}`}
              className="rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-700"
            >
              ←
            </a>
            <span className="font-semibold text-slate-900">
              {monthLabel(month)}
            </span>
            {month < thisMonth && (
              <a
                href={`/admin/service-levels?month=${shiftMonth(month, 1)}`}
                className="rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-700"
              >
                →
              </a>
            )}
          </div>
        </div>

        {params.sent && <Alert tone="success">Written notice sent and recorded.</Alert>}
        {params.promoted && (
          <Alert tone="success">
            Done — they now hold {params.promoted}. Their patch is below and on
            /admin/cleaners.
          </Alert>
        )}
        {params.error && <Alert>{params.error}</Alert>}

        <Card
          title="Best performers"
          description="Every approved cleaner, best first: share of answered offers accepted over the last 90 days, fewest no-shows and short-notice drops, most jobs completed, fastest yes. One click hands them first refusal on everything they cover; copy their districts to point your ads where they work."
          className="mb-6"
        >
          <ul className="mt-4 divide-y divide-slate-100">
            {leaders.map((leader, index) => {
              const acceptPct =
                leader.answered > 0
                  ? Math.round((leader.accepted / leader.answered) * 100)
                  : null;
              const holdsAllCoverage =
                leader.coverage.length > 0 &&
                leader.coverage.every((o) => leader.preferred.includes(o));
              return (
                <li key={leader.cleaner_id} className="py-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-400">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-slate-900">{leader.name}</span>
                    {leader.preferred.length > 0 && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        Area cleaner: {leader.preferred.join(" ")}
                      </span>
                    )}
                    {leader.backup.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        Backup: {leader.backup.join(" ")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {acceptPct === null
                      ? "No offers answered in the last 90 days"
                      : `Accepted ${acceptPct}% of offers`}
                    {" · "}
                    {leader.completed} job{leader.completed === 1 ? "" : "s"} completed
                    {leader.avg_response_mins !== null && (
                      <>
                        {" · "}says yes in{" "}
                        {leader.avg_response_mins < 90
                          ? `${leader.avg_response_mins} min`
                          : `${Math.round(leader.avg_response_mins / 6) / 10} h`}
                      </>
                    )}
                    {(leader.no_shows > 0 || leader.late_drops > 0) && (
                      <span className="font-semibold text-red-700">
                        {" · "}
                        {leader.no_shows > 0 &&
                          `${leader.no_shows} no-show${leader.no_shows === 1 ? "" : "s"}`}
                        {leader.no_shows > 0 && leader.late_drops > 0 && ", "}
                        {leader.late_drops > 0 && `${leader.late_drops} late drop${leader.late_drops === 1 ? "" : "s"}`}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {leader.coverage.length === 0 ? (
                      <span className="text-xs text-slate-400">
                        No coverage set
                      </span>
                    ) : (
                      leader.coverage.map((outward) => (
                        <span
                          key={outward}
                          className={`rounded-md px-1.5 py-0.5 font-mono text-xs ${
                            leader.preferred.includes(outward)
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {outward}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-start gap-3">
                    {!holdsAllCoverage && leader.coverage.length > 0 && (
                      <form action={promoteToAreaCleanerAction}>
                        <input type="hidden" name="id" value={leader.cleaner_id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                        >
                          Make area cleaner — all {leader.coverage.length} district
                          {leader.coverage.length === 1 ? "" : "s"}
                        </button>
                      </form>
                    )}
                    {leader.coverage.length > 0 && (
                      <CopyButton
                        text={leader.coverage.join("\n")}
                        label="Copy districts for ads"
                        className="border border-slate-300 text-slate-700"
                      />
                    )}
                  </div>
                </li>
              );
            })}
            {leaders.length === 0 && (
              <li className="py-4 text-sm text-slate-500">
                No approved cleaners yet.
              </li>
            )}
          </ul>
        </Card>

        {rows.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              Nobody holds a patch yet. Give a cleaner first refusal on
              /admin/cleaners and they appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const answered = row.accepted + row.declined + row.expired;
              const acceptPct =
                answered > 0 ? Math.round((row.accepted / answered) * 100) : null;
              const misses: string[] = [];
              if (acceptPct !== null && acceptPct < SLA_ACCEPT_PCT) {
                misses.push(`accepted ${acceptPct}% (standard ${SLA_ACCEPT_PCT}%)`);
              }
              if (
                row.avg_response_mins !== null &&
                row.avg_response_mins > SLA_RESPONSE_HOURS * 60
              ) {
                misses.push(
                  `average yes took ${Math.round(row.avg_response_mins / 60)}h (standard ${SLA_RESPONSE_HOURS}h)`
                );
              }
              if (row.no_shows > 0) misses.push(`${row.no_shows} no-show${row.no_shows === 1 ? "" : "s"}`);
              if (row.drops > SLA_MAX_DROPS_PER_MONTH || row.late_drops > 0) {
                misses.push(
                  `${row.drops} cancellation${row.drops === 1 ? "" : "s"}` +
                    (row.late_drops > 0
                      ? ` (${row.late_drops} inside ${SLA_DROP_NOTICE_HOURS}h)`
                      : "")
                );
              }

              return (
                <Card key={row.cleaner_id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {row.name}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        misses.length === 0
                          ? "bg-accent-100 text-accent-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {misses.length === 0 ? "Meeting the standards" : "Missed this month"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Patch: {row.areas ?? "—"}
                    {row.warnings_3m > 0 && (
                      <span className="ml-2 font-semibold text-red-700">
                        {row.warnings_3m} written notice
                        {row.warnings_3m === 1 ? "" : "s"} in the last 3 months
                      </span>
                    )}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-slate-500">Offers</dt>
                      <dd className="font-semibold text-slate-900">{row.offered}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Accepted</dt>
                      <dd className="font-semibold text-slate-900">
                        {row.accepted}
                        {acceptPct !== null && (
                          <span
                            className={
                              acceptPct < SLA_ACCEPT_PCT
                                ? "ml-1 text-red-700"
                                : "ml-1 text-slate-500"
                            }
                          >
                            ({acceptPct}%)
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">
                        Declined / no answer
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {row.declined} / {row.expired}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Average yes</dt>
                      <dd className="font-semibold text-slate-900">
                        {row.avg_response_mins === null
                          ? "—"
                          : row.avg_response_mins < 90
                            ? `${row.avg_response_mins} min`
                            : `${Math.round(row.avg_response_mins / 6) / 10} h`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Cancellations</dt>
                      <dd className="font-semibold text-slate-900">
                        {row.drops}
                        {row.late_drops > 0 && (
                          <span className="ml-1 text-red-700">
                            ({row.late_drops} late)
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">No-shows</dt>
                      <dd
                        className={`font-semibold ${row.no_shows > 0 ? "text-red-700" : "text-slate-900"}`}
                      >
                        {row.no_shows}
                      </dd>
                    </div>
                  </dl>

                  {misses.length > 0 && (
                    <form
                      action={sendSlaWarningAction}
                      className="mt-4 space-y-2 border-t border-slate-100 pt-4"
                    >
                      <input type="hidden" name="id" value={row.cleaner_id} />
                      <input type="hidden" name="month" value={month} />
                      <label
                        htmlFor={`warn-${row.cleaner_id}`}
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Send a written notice
                      </label>
                      <textarea
                        id={`warn-${row.cleaner_id}`}
                        name="body"
                        rows={3}
                        defaultValue={`In ${monthLabel(month)} you ${misses.join("; ")}. The agreement asks for at least ${SLA_ACCEPT_PCT}% of offers accepted, a reply within ${SLA_RESPONSE_HOURS} hours (8am-8pm), no no-shows, and no more than ${SLA_MAX_DROPS_PER_MONTH} cancellation a month with ${SLA_DROP_NOTICE_HOURS} hours' notice.`}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-red-700 px-5 py-2.5 font-semibold text-white"
                      >
                        Send &amp; record notice
                      </button>
                    </form>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {warnings.length > 0 && (
          <Card title="Written notices" className="mt-6">
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {warnings.map((w) => (
                <li key={w.id} className="py-2">
                  <span className="font-semibold text-slate-900">
                    {w.cleaner_name}
                  </span>{" "}
                  <span className="text-slate-500">
                    — {w.month}, sent {w.created_at}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-500">{w.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}
