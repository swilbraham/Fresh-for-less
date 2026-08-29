import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getFinanceSummary,
  getSettings,
  listCleanerFinance,
  listMonthlyFinance,
  listUpcomingWeeks,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { AdminNav, Card } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finances",
  robots: { index: false, follow: false },
};

/** "2026-08" -> "August 2026". */
function monthName(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** Commission as a percentage of what the customer paid. */
function effectiveRate(commission: number, value: number): string {
  if (value <= 0) return "—";
  return `${((commission / value) * 100).toFixed(1)}%`;
}

/** "2026-08-24" -> "w/c 24 Aug", with this week and next week called out. */
function weekLabel(iso: string): { label: string; when: "past" | "now" | "future" } {
  const [y, m, d] = iso.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisWeek = new Date(today);
  // Monday of the current week — Postgres' date_trunc('week') is Monday-based.
  thisWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const diffWeeks = Math.round(
    (start.getTime() - thisWeek.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const stamp = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (diffWeeks === 0) return { label: `This week (from ${stamp})`, when: "now" };
  if (diffWeeks === 1) return { label: `Next week (from ${stamp})`, when: "future" };
  return {
    label: `w/c ${stamp}`,
    when: diffWeeks < 0 ? "past" : "future",
  };
}

function change(now: number, before: number): string | null {
  if (before <= 0) return null;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return "level with last month";
  return `${pct > 0 ? "up" : "down"} ${Math.abs(pct)}% on last month`;
}

export default async function AdminFinancesPage() {
  if (!(await isAdmin())) redirect("/admin");

  const [money, months, cleaners, weeks, settings] = await Promise.all([
    getFinanceSummary(),
    listMonthlyFinance(18),
    listCleanerFinance(),
    listUpcomingWeeks(12),
    getSettings(),
  ]);

  const owed = money.accrued_pence + money.invoiced_unpaid_pence;
  const bucketed =
    money.accrued_pence + money.invoiced_unpaid_pence + money.paid_pence;
  const pipelineValue = money.accepted_value_pence + money.offered_value_pence;
  const pipelineCommission =
    money.accepted_commission_pence + money.offered_commission_pence;

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Finances</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Every figure below is what customers actually paid, and the
            commission you earn from it. Cleaners collect the money and you
            invoice them weekly, so &ldquo;owed to you&rdquo; is the number that
            matters day to day.
          </p>
        </header>

        {/* ---------------------------------------------- headline ------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Owed to you"
            value={gbp(owed)}
            note={`${gbp(money.invoiced_unpaid_pence)} invoiced · ${gbp(
              money.accrued_pence
            )} not billed yet`}
            tone="amber"
            href="/admin/invoices"
          />
          <Stat
            label="Banked"
            value={gbp(money.paid_pence)}
            note="Commission invoices marked paid"
            tone="green"
          />
          <Stat
            label="Booked in"
            value={gbp(pipelineValue)}
            note={`${money.accepted_jobs + money.offered_jobs} job${
              money.accepted_jobs + money.offered_jobs === 1 ? "" : "s"
            } · ${gbp(pipelineCommission)} commission to come`}
            href="/admin/jobs"
          />
          <Stat
            label="This month"
            value={gbp(money.month_commission_pence)}
            note={
              change(money.month_commission_pence, money.last_month_commission_pence) ??
              `${money.month_jobs} job${money.month_jobs === 1 ? "" : "s"} completed`
            }
          />
        </div>

        {/* ---------------------------------------------- pipeline ------- */}
        <Card
          title="Work sold but not yet done"
          description="Nothing here has earned commission yet — it earns when the job is marked complete. Offered jobs are not guaranteed: no cleaner has taken them."
          className="mt-8"
        >
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 font-semibold">Stage</th>
                  <th className="py-2 text-right font-semibold">Jobs</th>
                  <th className="py-2 text-right font-semibold">Customer value</th>
                  <th className="py-2 text-right font-semibold">Your commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                <Row
                  label="Accepted by a cleaner"
                  hint="Booked and covered"
                  jobs={money.accepted_jobs}
                  value={money.accepted_value_pence}
                  commission={money.accepted_commission_pence}
                />
                <Row
                  label="Out to cleaners"
                  hint="Waiting for someone to accept"
                  jobs={money.offered_jobs}
                  value={money.offered_value_pence}
                  commission={money.offered_commission_pence}
                />
                <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
                  <td className="py-3">Booked in</td>
                  <td className="py-3 text-right">
                    {money.accepted_jobs + money.offered_jobs}
                  </td>
                  <td className="py-3 text-right">{gbp(pipelineValue)}</td>
                  <td className="py-3 text-right">{gbp(pipelineCommission)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ---------------------------------------------- when ----------- */}
        <Card
          title="When it lands"
          description="The same booked-in work, by the week the job is scheduled. Unallocated means it is still out to cleaners with nobody signed up."
          className="mt-8"
        >
          {weeks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Nothing in the diary. Booked jobs appear here as they come in.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Week</th>
                    <th className="py-2 text-right font-semibold">Jobs</th>
                    <th className="py-2 text-right font-semibold">Unallocated</th>
                    <th className="py-2 text-right font-semibold">Customer value</th>
                    <th className="py-2 text-right font-semibold">Your commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {weeks.map((week) => {
                    const { label, when } = weekLabel(week.week_start);
                    return (
                      <tr
                        key={week.week_start}
                        className={when === "now" ? "bg-slate-50" : undefined}
                      >
                        <td className="py-2 whitespace-nowrap font-semibold text-slate-900">
                          {label}
                          {when === "past" && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              date passed
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right text-slate-700">{week.jobs}</td>
                        <td
                          className={`py-2 text-right ${
                            week.unallocated > 0
                              ? "font-semibold text-amber-700"
                              : "text-slate-400"
                          }`}
                        >
                          {week.unallocated || "—"}
                        </td>
                        <td className="py-2 text-right text-slate-700">
                          {gbp(week.value_pence)}
                        </td>
                        <td className="py-2 text-right font-semibold text-slate-900">
                          {gbp(week.commission_pence)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {money.overdue_jobs > 0 && (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>
                {money.overdue_jobs} accepted job
                {money.overdue_jobs === 1 ? "" : "s"}
              </strong>{" "}
              {money.overdue_jobs === 1 ? "has" : "have"} a date that has already
              passed but {money.overdue_jobs === 1 ? "has" : "have"} not been
              marked complete — {gbp(money.overdue_commission_pence)} of
              commission you cannot invoice until{" "}
              {money.overdue_jobs === 1 ? "it is" : "they are"} closed off.{" "}
              <Link href="/admin/jobs?status=accepted&sort=soonest" className="underline">
                Close them off
              </Link>
              .
            </p>
          )}
        </Card>

        {/* ---------------------------------------------- earned --------- */}
        <Card
          title="Commission earned, and where it sits"
          description="Every completed job is in exactly one of these three rows, so they add up to the total. If a figure looks wrong, this is the place to spot it."
          className="mt-8"
        >
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <tbody className="divide-y divide-slate-100 tabular-nums">
                <tr>
                  <td className="py-3">
                    <span className="font-semibold text-slate-900">
                      Not invoiced yet
                    </span>
                    <span className="block text-xs text-slate-500">
                      Completed work the weekly run has not billed
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {gbp(money.accrued_pence)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">
                    <span className="font-semibold text-slate-900">
                      Invoiced, not paid
                    </span>
                    <span className="block text-xs text-slate-500">
                      Billed to cleaners and outstanding
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {gbp(money.invoiced_unpaid_pence)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3">
                    <span className="font-semibold text-slate-900">Paid</span>
                    <span className="block text-xs text-slate-500">
                      In the bank
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {gbp(money.paid_pence)}
                  </td>
                </tr>
                <tr className="border-t-2 border-slate-300 text-slate-900">
                  <td className="py-3 font-bold">
                    Total commission earned
                    <span className="block text-xs font-normal text-slate-500">
                      On {money.completed_jobs} completed job
                      {money.completed_jobs === 1 ? "" : "s"} worth{" "}
                      {gbp(money.completed_value_pence)} to customers
                    </span>
                  </td>
                  <td className="py-3 text-right text-xl font-bold">
                    {gbp(bucketed)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {bucketed !== money.completed_commission_pence && (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Heads up: completed jobs carry{" "}
              {gbp(money.completed_commission_pence)} of commission, but the
              three rows above come to {gbp(bucketed)} — a difference of{" "}
              {gbp(Math.abs(bucketed - money.completed_commission_pence))}. That
              happens when a job was invoiced and then cancelled. The invoice
              still stands; the job no longer counts as completed.
            </p>
          )}

          <p className="mt-4 text-sm text-slate-600">
            Your headline rate is {Number(settings.commission_pct)}%, and you are
            actually taking{" "}
            <strong className="text-slate-900">
              {effectiveRate(
                money.completed_commission_pence,
                money.completed_value_pence
              )}
            </strong>{" "}
            of what customers pay. Lower is normal: VAT-registered cleaners are
            charged on what they keep after VAT, not the customer&rsquo;s price.
          </p>
        </Card>

        {/* ---------------------------------------------- by month ------- */}
        <Card
          title="Month by month"
          description="Completed work, dated by the day the job was finished — that is when the commission is earned. Cancelled jobs are excluded."
          className="mt-8"
        >
          {months.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No completed jobs yet. This fills in as work gets done.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Month</th>
                    <th className="py-2 text-right font-semibold">Jobs</th>
                    <th className="py-2 text-right font-semibold">Customer value</th>
                    <th className="py-2 text-right font-semibold">Your commission</th>
                    <th className="py-2 text-right font-semibold">Average job</th>
                    <th className="py-2 text-right font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {months.map((row) => (
                    <tr key={row.month}>
                      <td className="py-2 whitespace-nowrap font-semibold text-slate-900">
                        {monthName(row.month)}
                      </td>
                      <td className="py-2 text-right text-slate-700">{row.jobs}</td>
                      <td className="py-2 text-right text-slate-700">
                        {gbp(row.value_pence)}
                      </td>
                      <td className="py-2 text-right font-semibold text-slate-900">
                        {gbp(row.commission_pence)}
                      </td>
                      <td className="py-2 text-right text-slate-500">
                        {gbp(Math.round(row.value_pence / Math.max(1, row.jobs)))}
                      </td>
                      <td className="py-2 text-right text-slate-500">
                        {effectiveRate(row.commission_pence, row.value_pence)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ---------------------------------------------- by cleaner ----- */}
        <Card
          title="By cleaner"
          description="Both halves of each cleaner: work they have taken that hasn't happened yet, and work they have finished along with what they still owe you on it."
          className="mt-8"
        >
          {cleaners.length === 0 && money.offered_jobs === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Nothing to show until a job is booked.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="text-left text-xs text-slate-500">
                  <tr>
                    <th className="py-1" />
                    <th
                      className="border-b border-slate-200 pb-1 text-center text-xs font-semibold uppercase tracking-wide"
                      colSpan={2}
                    >
                      Booked in
                    </th>
                    <th
                      className="border-b border-slate-200 pb-1 text-center text-xs font-semibold uppercase tracking-wide"
                      colSpan={3}
                    >
                      Completed
                    </th>
                    <th
                      className="border-b border-slate-200 pb-1 text-center text-xs font-semibold uppercase tracking-wide"
                      colSpan={2}
                    >
                      Commission
                    </th>
                  </tr>
                  <tr className="text-left text-xs uppercase tracking-wide">
                    <th className="py-2 font-semibold">Cleaner</th>
                    <th className="py-2 text-right font-semibold">Jobs</th>
                    <th className="py-2 text-right font-semibold">To come</th>
                    <th className="py-2 text-right font-semibold">Jobs</th>
                    <th className="py-2 text-right font-semibold">Turned over</th>
                    <th className="py-2 text-right font-semibold">Earned</th>
                    <th className="py-2 text-right font-semibold">Owes you</th>
                    <th className="py-2 text-right font-semibold">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {cleaners.map((row) => {
                    const owes = row.accrued_pence + row.unpaid_pence;
                    return (
                      <tr key={row.id}>
                        <td className="py-2">
                          <Link
                            href="/admin/cleaners"
                            className="font-semibold text-slate-900 hover:underline"
                          >
                            {row.business_name || row.name}
                          </Link>
                          {row.vat_registered && (
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              VAT
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right text-slate-700">
                          {row.upcoming_jobs || "—"}
                        </td>
                        <td className="py-2 text-right text-slate-700">
                          {row.upcoming_commission_pence
                            ? gbp(row.upcoming_commission_pence)
                            : "—"}
                        </td>
                        <td className="py-2 text-right text-slate-700">
                          {row.jobs || "—"}
                        </td>
                        <td className="py-2 text-right text-slate-700">
                          {gbp(row.value_pence)}
                        </td>
                        <td className="py-2 text-right font-semibold text-slate-900">
                          {gbp(row.commission_pence)}
                        </td>
                        <td
                          className={`py-2 text-right font-semibold ${
                            owes > 0 ? "text-amber-700" : "text-slate-400"
                          }`}
                        >
                          {gbp(owes)}
                        </td>
                        <td className="py-2 text-right text-slate-500">
                          {gbp(row.paid_pence)}
                        </td>
                      </tr>
                    );
                  })}

                  {money.offered_jobs > 0 && (
                    <tr className="bg-amber-50/60">
                      <td className="py-2">
                        <span className="font-semibold text-amber-900">
                          Not allocated yet
                        </span>
                        <span className="block text-xs text-amber-800">
                          Out to cleaners, nobody has accepted
                        </span>
                      </td>
                      <td className="py-2 text-right text-amber-900">
                        {money.offered_jobs}
                      </td>
                      <td className="py-2 text-right text-amber-900">
                        {gbp(money.offered_commission_pence)}
                      </td>
                      <td className="py-2 text-right text-slate-400">—</td>
                      <td className="py-2 text-right text-slate-400">—</td>
                      <td className="py-2 text-right text-slate-400">—</td>
                      <td className="py-2 text-right text-slate-400">—</td>
                      <td className="py-2 text-right text-slate-400">—</td>
                    </tr>
                  )}

                  <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
                    <td className="py-3">Total</td>
                    <td className="py-3 text-right">
                      {money.accepted_jobs + money.offered_jobs}
                    </td>
                    <td className="py-3 text-right">{gbp(pipelineCommission)}</td>
                    <td className="py-3 text-right">{money.completed_jobs}</td>
                    <td className="py-3 text-right">
                      {gbp(money.completed_value_pence)}
                    </td>
                    <td className="py-3 text-right">
                      {gbp(money.completed_commission_pence)}
                    </td>
                    <td className="py-3 text-right text-amber-700">{gbp(owed)}</td>
                    <td className="py-3 text-right">{gbp(money.paid_pence)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ---------------------------------------------- footnotes ------ */}
        <Card
          title="Take it to your accountant"
          description="A month-by-month CSV of completed work and commission, plus the underlying job and invoice data."
          className="mt-8"
        >
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { type: "finance", label: "Monthly finance summary" },
              { type: "jobs", label: "Every job" },
              { type: "invoices", label: "Commission invoices" },
            ].map((item) => (
              <a
                key={item.type}
                href={`/admin/export?type=${item.type}`}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {item.label} (CSV)
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            These are marketplace figures, not a tax return — nothing here
            accounts for VAT on your own commission or for your costs.
            {money.cancelled_jobs > 0 && (
              <>
                {" "}
                {money.cancelled_jobs} cancelled job
                {money.cancelled_jobs === 1 ? "" : "s"} worth{" "}
                {gbp(money.cancelled_value_pence)} {money.cancelled_jobs === 1 ? "is" : "are"}{" "}
                excluded throughout.
              </>
            )}
          </p>
        </Card>
      </div>
    </main>
  );
}

function Row({
  label,
  hint,
  jobs,
  value,
  commission,
}: {
  label: string;
  hint: string;
  jobs: number;
  value: number;
  commission: number;
}) {
  return (
    <tr>
      <td className="py-3">
        <span className="font-semibold text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </td>
      <td className="py-3 text-right text-slate-700">{jobs}</td>
      <td className="py-3 text-right text-slate-700">{gbp(value)}</td>
      <td className="py-3 text-right font-semibold text-slate-900">
        {gbp(commission)}
      </td>
    </tr>
  );
}

function Stat({
  label,
  value,
  note,
  href,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  href?: string;
  tone?: "amber" | "green";
}) {
  const palette =
    tone === "amber"
      ? "border-amber-300 bg-amber-50"
      : tone === "green"
        ? "border-emerald-300 bg-emerald-50"
        : "border-slate-200 bg-white hover:border-primary-300";

  const body = (
    <div className={`h-full rounded-2xl border p-5 shadow-sm transition ${palette}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </p>
      {note && <p className="mt-1 text-xs text-slate-600">{note}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
