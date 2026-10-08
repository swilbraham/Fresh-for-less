import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getFinanceSummary,
  listAdSpend,
  listCleanerFinance,
  profitByDay,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { Card } from "@/components/marketplace/shell";
import { saveAdSpendAction, saveMetaWeekAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profit",
  robots: { index: false, follow: false },
};

function sum<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

/** "2026-10-08" -> "Wed 8 Oct". */
function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function ProfitPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { saved, error } = await searchParams;

  const [allDays, spendRows, summary, cleaners] = await Promise.all([
    profitByDay(183),
    listAdSpend(30),
    getFinanceSummary(),
    listCleanerFinance(),
  ]);
  const days = allDays.slice(0, 30);
  const notesFor = new Map(spendRows.map((row) => [row.day, row]));
  const spendFor = new Map(spendRows.map((row) => [row.day, row.meta_pence]));

  // days comes newest-first.
  const last7 = days.slice(0, 7);
  const window = (rows: typeof days) => {
    const commission = sum(rows, (r) => r.commission_pence);
    const spend = sum(rows, (r) => r.spend_pence);
    const jobs = sum(rows, (r) => r.jobs);
    const quotes = sum(rows, (r) => r.quotes);
    const leads = sum(rows, (r) => r.leads);
    return {
      commission,
      spend,
      jobs,
      quotes,
      leads,
      net: commission - spend,
      value: sum(rows, (r) => r.value_pence),
    };
  };
  const week = window(last7);
  const month = window(days);

  // Weekly (w/c Monday, last 8) and monthly (last 6) rollups.
  const mondayOf = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    return date.toISOString().slice(0, 10);
  };
  const rollup = (key: (iso: string) => string, keep: number) => {
    const buckets = new Map<string, { commission: number; spend: number; jobs: number }>();
    for (const d of allDays) {
      const k = key(d.day);
      const bucket = buckets.get(k) ?? { commission: 0, spend: 0, jobs: 0 };
      bucket.commission += d.commission_pence;
      bucket.spend += d.spend_pence;
      bucket.jobs += d.jobs;
      buckets.set(k, bucket);
    }
    return [...buckets.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, keep);
  };
  const weeks = rollup(mondayOf, 8);
  const months = rollup((iso) => iso.slice(0, 7), 6);
  const monthName = (ym: string) => {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  };

  const avgCommissionPerJob = month.jobs > 0 ? month.commission / month.jobs : 0;
  const costPerJob7 = week.jobs > 0 ? week.spend / week.jobs : null;
  const costPerQuote7 = week.quotes > 0 ? week.spend / week.quotes : null;
  const conversion = month.quotes > 0 ? (month.jobs / month.quotes) * 100 : null;
  const roas7 = week.spend > 0 ? week.commission / week.spend : null;

  // The plain-English verdict: the one paragraph the page exists for.
  let verdictTone = "border-slate-200 bg-slate-50 text-slate-800";
  let verdict: string;
  if (week.spend === 0) {
    verdict =
      week.commission > 0
        ? `No ad spend recorded in the last 7 days, so every penny of the ${gbp(week.commission)} commission from ${week.jobs} booking${week.jobs === 1 ? "" : "s"} is margin. Log your spend below to see the real picture.`
        : "No ad spend recorded and no bookings in the last 7 days. Log your spend below as soon as ads are running — this page only tells the truth if the spend goes in.";
  } else if (week.net > 0) {
    verdictTone = "border-accent-300 bg-accent-50 text-accent-900";
    verdict = `You're in profit: the last 7 days made ${gbp(week.commission)} commission on ${gbp(week.spend)} of ads — ${gbp(week.net)} ahead, earning ${roas7!.toFixed(1)}× every ad pound. ${
      costPerJob7 !== null
        ? `Each booking cost ${gbp(Math.round(costPerJob7))} to win against ${gbp(Math.round(avgCommissionPerJob))} average commission.`
        : ""
    }`;
  } else {
    verdictTone = "border-red-300 bg-red-50 text-red-900";
    verdict = `You're behind: ${gbp(week.spend)} of ads in the last 7 days brought ${gbp(week.commission)} commission — ${gbp(-week.net)} down. ${
      costPerJob7 !== null
        ? `Bookings are costing ${gbp(Math.round(costPerJob7))} each but average commission is ${gbp(Math.round(avgCommissionPerJob))}; a booking has to cost less than that to make money.`
        : `No bookings came in at all — check the ads are pointing at /book and the postcodes they target are covered.`
    }`;
  }

  // What's owed, and by who.
  const owedRows = cleaners
    .map((c) => ({
      ...c,
      owed: Number(c.accrued_pence) + Number(c.unpaid_pence),
    }))
    .filter((c) => c.owed > 0 || Number(c.upcoming_commission_pence) > 0)
    .sort((a, b) => b.owed - a.owed);

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/London",
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profit</h1>
        <p className="mt-1 text-sm text-slate-600">
          Commission in against ad money out. Bookings count on the day they
          were made — the day the ad that won them was paid for — and
          commission is already net of any discount codes.
        </p>
      </div>

      {saved && (
        <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
          Spend saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className={`rounded-2xl border px-5 py-4 text-sm font-medium ${verdictTone}`}>
        {verdict}
      </div>

      {/* Headline windows */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Last 7 days — commission won">
          <p className="text-2xl font-bold tabular-nums text-slate-900">{gbp(week.commission)}</p>
          <p className="mt-1 text-xs text-slate-500">
            from {week.jobs} booking{week.jobs === 1 ? "" : "s"} worth {gbp(week.value)}
          </p>
        </Card>
        <Card title="Last 7 days — ad spend">
          <p className="text-2xl font-bold tabular-nums text-slate-900">{gbp(week.spend)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {costPerQuote7 !== null ? `${gbp(Math.round(costPerQuote7))} per quote` : "no quotes yet"}
            {costPerJob7 !== null ? ` · ${gbp(Math.round(costPerJob7))} per booking` : ""}
          </p>
        </Card>
        <Card title="Last 7 days — net">
          <p className={`text-2xl font-bold tabular-nums ${week.net >= 0 ? "text-accent-700" : "text-red-600"}`}>
            {week.net >= 0 ? gbp(week.net) : `−${gbp(-week.net)}`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {roas7 !== null ? `${roas7.toFixed(1)}× return on ad spend` : "no spend logged"}
          </p>
        </Card>
        <Card title="Last 30 days — net">
          <p className={`text-2xl font-bold tabular-nums ${month.net >= 0 ? "text-accent-700" : "text-red-600"}`}>
            {month.net >= 0 ? gbp(month.net) : `−${gbp(-month.net)}`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {gbp(month.commission)} commission − {gbp(month.spend)} ads
            {conversion !== null ? ` · ${conversion.toFixed(0)}% of quotes book` : ""}
          </p>
        </Card>
      </div>

      {/* The rule of thumb that decides whether ads are worth it */}
      <Card title="Your break-even line">
        <p className="text-sm text-slate-700">
          Average commission per booking over 30 days is{" "}
          <strong className="tabular-nums">{gbp(Math.round(avgCommissionPerJob))}</strong>
          {conversion !== null && month.quotes > 0 ? (
            <>
              {" "}and {conversion.toFixed(0)}% of quotes turn into bookings — so a{" "}
              <strong>quote</strong> is worth about{" "}
              <strong className="tabular-nums">
                {gbp(Math.round((avgCommissionPerJob * month.jobs) / month.quotes))}
              </strong>{" "}
              to you.
            </>
          ) : null}{" "}
          Any ad channel that charges more than{" "}
          <strong className="tabular-nums">{gbp(Math.round(avgCommissionPerJob))}</strong> per
          booking loses money before overheads.
        </p>
      </Card>

      {/* What's owed, by who */}
      <Card title="What you're owed">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid to date</p>
            <p className="text-lg font-bold tabular-nums text-slate-900">{gbp(summary.paid_pence)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Invoiced, unpaid</p>
            <p className="text-lg font-bold tabular-nums text-amber-700">{gbp(summary.invoiced_unpaid_pence)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Done, not yet invoiced</p>
            <p className="text-lg font-bold tabular-nums text-amber-700">{gbp(summary.accrued_pence)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Booked, not yet done</p>
            <p className="text-lg font-bold tabular-nums text-slate-700">{gbp(summary.accepted_commission_pence)}</p>
          </div>
        </div>

        {owedRows.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 font-semibold">Cleaner</th>
                  <th className="py-2 text-right font-semibold">Owes you now</th>
                  <th className="py-2 text-right font-semibold">of which invoiced</th>
                  <th className="py-2 text-right font-semibold">Coming (booked)</th>
                  <th className="py-2 text-right font-semibold">Paid to date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {owedRows.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-3 font-semibold text-slate-900">
                      {c.business_name || c.name}
                    </td>
                    <td className="py-2 text-right font-bold tabular-nums text-slate-900">
                      {gbp(c.owed)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-600">
                      {gbp(Number(c.unpaid_pence))}
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-600">
                      {gbp(Number(c.upcoming_commission_pence))}
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-600">
                      {gbp(Number(c.paid_pence))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-500">
          &ldquo;Owes you now&rdquo; is completed work: invoiced-but-unpaid plus
          finished jobs the weekly invoice run hasn&apos;t billed yet. Chase and
          mark payments on{" "}
          <Link href="/admin/invoices" className="font-semibold text-primary-600 underline">
            Commission invoices
          </Link>
          .
        </p>
      </Card>

      {/* Quick Meta week grid */}
      <Card title="This week's Meta spend — quick entry">
        <form action={saveMetaWeekAction}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {days.slice(0, 7).map((d) => (
              <label key={d.day} className="block">
                <span className="block text-xs font-semibold text-slate-600">
                  {dayLabel(d.day)}
                </span>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-slate-500">£</span>
                  <input
                    name={`meta_${d.day}`}
                    inputMode="decimal"
                    defaultValue={
                      spendFor.has(d.day) && spendFor.get(d.day)! > 0
                        ? (spendFor.get(d.day)! / 100).toFixed(2).replace(/\.00$/, "")
                        : ""
                    }
                    placeholder="—"
                    className="w-full rounded-xl border border-slate-300 px-2 py-2 text-sm tabular-nums"
                  />
                </div>
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Save Meta spend
            </button>
            <p className="text-xs text-slate-500">
              Blank days are left as they are. Google and other spend go in the
              form below.
            </p>
          </div>
        </form>
      </Card>

      {/* Weekly & monthly profit */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Week by week">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 font-semibold">Week</th>
                <th className="py-2 text-right font-semibold">Bookings</th>
                <th className="py-2 text-right font-semibold">Commission</th>
                <th className="py-2 text-right font-semibold">Ads</th>
                <th className="py-2 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeks.map(([wc, w]) => {
                const net = w.commission - w.spend;
                return (
                  <tr key={wc}>
                    <td className="py-2 whitespace-nowrap text-slate-700">w/c {dayLabel(wc)}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{w.jobs || "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-900">{w.commission ? gbp(w.commission) : "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{w.spend ? gbp(w.spend) : "—"}</td>
                    <td className={`py-2 text-right font-semibold tabular-nums ${net > 0 ? "text-accent-700" : net < 0 ? "text-red-600" : "text-slate-400"}`}>
                      {net === 0 ? "—" : net > 0 ? gbp(net) : `−${gbp(-net)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        <Card title="Month by month">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 font-semibold">Month</th>
                <th className="py-2 text-right font-semibold">Bookings</th>
                <th className="py-2 text-right font-semibold">Commission</th>
                <th className="py-2 text-right font-semibold">Ads</th>
                <th className="py-2 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {months.map(([ym, m]) => {
                const net = m.commission - m.spend;
                return (
                  <tr key={ym}>
                    <td className="py-2 whitespace-nowrap text-slate-700">{monthName(ym)}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{m.jobs || "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-900">{m.commission ? gbp(m.commission) : "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{m.spend ? gbp(m.spend) : "—"}</td>
                    <td className={`py-2 text-right font-semibold tabular-nums ${net > 0 ? "text-accent-700" : net < 0 ? "text-red-600" : "text-slate-400"}`}>
                      {net === 0 ? "—" : net > 0 ? gbp(net) : `−${gbp(-net)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500">
            Ad totals only include days you&apos;ve logged — a quiet-looking
            month might just be missing its spend.
          </p>
        </Card>
      </div>

      {/* Spend entry */}
      <Card title="Log ad spend — any day, all platforms">
        <form action={saveAdSpendAction} className="flex flex-wrap items-end gap-3 text-sm">
          <label className="block">
            <span className="block text-xs font-semibold text-slate-600">Day</span>
            <input
              type="date"
              name="day"
              defaultValue={today}
              max={today}
              required
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-600">Meta £</span>
            <input name="meta" inputMode="decimal" placeholder="0" className="mt-1 w-24 rounded-xl border border-slate-300 px-3 py-2 tabular-nums" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-600">Google £</span>
            <input name="google" inputMode="decimal" placeholder="0" className="mt-1 w-24 rounded-xl border border-slate-300 px-3 py-2 tabular-nums" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-600">Other £</span>
            <input name="other" inputMode="decimal" placeholder="0" className="mt-1 w-24 rounded-xl border border-slate-300 px-3 py-2 tabular-nums" />
          </label>
          <label className="block grow">
            <span className="block text-xs font-semibold text-slate-600">Notes</span>
            <input name="notes" placeholder="e.g. 3for99 campaign" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-primary-600 px-5 py-2.5 font-semibold text-white transition hover:bg-primary-700"
          >
            Save day
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Saving the same day again overwrites it — correcting a figure is just
          typing it in again. Leave a platform at 0 if nothing ran.
        </p>
      </Card>

      {/* Day by day */}
      <Card title="Last 30 days, day by day">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 font-semibold">Day</th>
                <th className="py-2 text-right font-semibold">Quotes</th>
                <th className="py-2 text-right font-semibold">Leads</th>
                <th className="py-2 text-right font-semibold">Bookings</th>
                <th className="py-2 text-right font-semibold">Value</th>
                <th className="py-2 text-right font-semibold">Commission</th>
                <th className="py-2 text-right font-semibold">Ad spend</th>
                <th className="py-2 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((d) => {
                const net = d.commission_pence - d.spend_pence;
                const note = notesFor.get(d.day)?.notes;
                return (
                  <tr key={d.day} className={d.spend_pence > 0 && net < 0 ? "bg-red-50/60" : ""}>
                    <td className="py-2 pr-3 whitespace-nowrap text-slate-700">
                      {dayLabel(d.day)}
                      {note && <span className="ml-2 text-xs text-slate-400">{note}</span>}
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{d.quotes || "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{d.leads || "—"}</td>
                    <td className="py-2 text-right tabular-nums font-semibold text-slate-900">{d.jobs || "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{d.value_pence ? gbp(d.value_pence) : "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-900">{d.commission_pence ? gbp(d.commission_pence) : "—"}</td>
                    <td className="py-2 text-right tabular-nums text-slate-600">{d.spend_pence ? gbp(d.spend_pence) : "—"}</td>
                    <td className={`py-2 text-right font-semibold tabular-nums ${net > 0 ? "text-accent-700" : net < 0 ? "text-red-600" : "text-slate-400"}`}>
                      {net === 0 ? "—" : net > 0 ? gbp(net) : `−${gbp(-net)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
                <td className="py-2">30-day total</td>
                <td className="py-2 text-right tabular-nums">{month.quotes}</td>
                <td className="py-2 text-right tabular-nums">{month.leads}</td>
                <td className="py-2 text-right tabular-nums">{month.jobs}</td>
                <td className="py-2 text-right tabular-nums">{gbp(month.value)}</td>
                <td className="py-2 text-right tabular-nums">{gbp(month.commission)}</td>
                <td className="py-2 text-right tabular-nums">{gbp(month.spend)}</td>
                <td className={`py-2 text-right tabular-nums ${month.net >= 0 ? "text-accent-700" : "text-red-600"}`}>
                  {month.net >= 0 ? gbp(month.net) : `−${gbp(-month.net)}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Loss days (spend with less commission back) are tinted red. Leads are
          quotes where a mobile number was left. Remember commission here is
          platform margin, not take-home — cleaner payouts are already out, but
          SMS costs, Stripe fees and your time are not.
        </p>
      </Card>
    </main>
  );
}
