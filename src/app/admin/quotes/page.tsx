import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/marketplace/auth";
import { listQuotes, quoteStats } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { Card } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quotes",
  robots: { index: false, follow: false },
};

/**
 * Everyone who got as far as a price, booked or not.
 *
 * The ones who did not book are the reason this page exists: they are the only
 * record of what the booking form loses, and without them a quiet week looks
 * exactly like a broken booking button.
 */
export default async function QuotesPage() {
  if (!(await isAdmin())) redirect("/admin");

  const [quotes, week] = await Promise.all([listQuotes(150), quoteStats(7)]);
  const rate = week.quotes > 0 ? Math.round((week.booked / week.quotes) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every basket that reached a price on /book. No name or number is taken
          at this stage — these are postcodes and prices, not leads to chase.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Quoted this week", value: String(week.quotes) },
          { label: "Of those, booked", value: `${week.booked} (${rate}%)` },
          { label: "Value quoted", value: gbp(week.quoted_pence) },
          { label: "Value booked", value: gbp(week.booked_pence) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Card title="Latest quotes">
        {quotes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Nothing yet. A quote appears here as soon as somebody picks their
            first room after entering a postcode.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 font-semibold">When</th>
                  <th className="py-2 font-semibold">Postcode</th>
                  <th className="py-2 font-semibold">What they picked</th>
                  <th className="py-2 text-right font-semibold">Price</th>
                  <th className="py-2 font-semibold">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 align-top">
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="py-3 pr-3 whitespace-nowrap text-slate-600">
                      {quote.updated_at}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap font-semibold text-slate-900">
                      {quote.postcode}
                      {!quote.covered && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          no cover
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-slate-700">
                      {quote.items.length === 0
                        ? "—"
                        : quote.items
                            .map((line) =>
                              line.qty > 1
                                ? `${line.qty} × ${line.label}`
                                : line.label
                            )
                            .join(", ")}
                      {quote.source && (
                        <span className="ml-2 text-xs text-slate-400">
                          via {quote.source}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold tabular-nums text-slate-900">
                      {gbp(quote.total_pence)}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      {quote.booked_ref ? (
                        <Link
                          href={`/admin/jobs/${quote.booked_ref}`}
                          className="font-semibold text-accent-700 underline"
                        >
                          Booked · {quote.booked_ref}
                        </Link>
                      ) : (
                        <span className="text-slate-500">Quoted only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-500">
        A row is one visitor&apos;s basket, updated as they change it — not one
        row per click. Somebody who prices a job twice a week apart appears
        twice, because each visit is its own session.
      </p>
    </main>
  );
}
