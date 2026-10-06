import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/marketplace/auth";
import { getPriceItems, listQuotes, quoteStats } from "@/lib/marketplace/repo";
import { createOfficeQuoteAction } from "@/app/admin/actions";
import { gbpShort } from "@/lib/marketplace/money";
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
export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; quoted?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { error, quoted } = await searchParams;
  const [quotes, week, items] = await Promise.all([
    listQuotes(150),
    quoteStats(7),
    getPriceItems(true),
  ]);
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {quoted && (
        <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
          {quoted}
        </div>
      )}

      <Card
        title="Quote someone over the phone"
        description="Take their name, number and postcode, tick what needs doing, and they get a text with the price and a button that books it — already filled in."
      >
        <form action={createOfficeQuoteAction} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <input
              name="customerName"
              required
              placeholder="Name"
              aria-label="Customer name"
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            />
            <input
              name="customerPhone"
              required
              type="tel"
              placeholder="Mobile number"
              aria-label="Mobile number"
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            />
            <input
              name="customerEmail"
              type="email"
              placeholder="Email (optional)"
              aria-label="Email"
              className="rounded-xl border border-slate-300 px-4 py-2.5"
            />
            <input
              name="postcode"
              placeholder="Postcode (optional)"
              aria-label="Postcode"
              className="rounded-xl border border-slate-300 px-4 py-2.5 uppercase"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <label
                key={item.code}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">
                  {item.label}{" "}
                  <span className="text-slate-400">
                    {gbpShort(item.unit_price_pence)}
                  </span>
                </span>
                <input
                  type="number"
                  name={`qty_${item.code}`}
                  min="0"
                  max={item.max_qty || 20}
                  defaultValue={0}
                  aria-label={`How many ${item.label}`}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-right"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700"
            >
              Price it &amp; text the link
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="protection"
                className="h-4 w-4 rounded border-slate-300 accent-accent-600"
              />
              Include stain protection
            </label>
            <p className="text-xs text-slate-500">
              The price is worked out here, not in their browser, so the figure
              they are shown is the one the booking form will charge.
            </p>
          </div>
        </form>
      </Card>

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
                      {quote.customer_name && (
                        <span className="block text-xs font-normal text-slate-500">
                          {quote.token ? (
                            <Link
                              href={`/admin/quotes/${quote.token}`}
                              className="font-semibold text-primary-600 underline"
                            >
                              {quote.customer_name}
                            </Link>
                          ) : (
                            quote.customer_name
                          )}{" "}
                          · {quote.customer_phone}
                        </span>
                      )}
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
