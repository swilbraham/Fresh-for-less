import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getBundles,
  getPriceItems,
  getSettings,
  leadFeesOwed,
  leadSalesStats,
  listQuotes,
  quoteStats,
  quoteConversion,
  listQuoteRequests,
  quoteResponsesForRequests,
  listQuoteResponses,
  nearestCleaners,
  listCleaners,
  MAX_QUOTE_RESPONSES,
} from "@/lib/marketplace/repo";
import { driveMinutes } from "@/lib/marketplace/geo";
import type { NearbyCleaner } from "@/lib/marketplace/repo";
import QuoteBuilder from "@/components/marketplace/QuoteBuilder";
import {
  createOfficeQuoteAction,
  creditLeadAction,
  cancelLeadAction,
  textQuoteCustomerAction,
  listLeadAction,
  rejectLeadCreditAction,
  offerQuoteDiscountAction,
  settleLeadFeesAction,
  addOfficeQuoteAction,
  resendQuoteLinkAction,
  closeQuoteRequestAction,
  chaseQuoteBookingAction,
} from "@/app/admin/actions";
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
  searchParams: Promise<{
    error?: string;
    quoted?: string;
    offered?: string;
    added?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { error, quoted, offered, added } = await searchParams;
  const [
    quotes,
    week,
    month,
    year,
    items,
    bundles,
    settings,
    leadFees,
    leadStats,
    convNow,
    convPrev,
    quoteRequests,
  ] = await Promise.all([
    listQuotes(150),
    quoteStats(7),
    quoteStats(30),
    quoteStats(365),
    getPriceItems(true),
    getBundles(true),
    getSettings(),
    leadFeesOwed(),
    leadSalesStats(),
    quoteConversion(7, 0),
    quoteConversion(7, 7),
    listQuoteRequests(30),
  ]);

  // Everything the ring-round needs: who has quoted so far, who is nearest to
  // each area still waiting, and the full cleaner list for the odd case where
  // the one on the phone is nowhere near.
  const responses = await quoteResponsesForRequests(quoteRequests.map((r) => r.id));
  const cleanerQuotes = await listQuoteResponses(200);
  const decided = cleanerQuotes.filter((x) => x.won);
  const cheapestWon = decided.filter((x) => x.rank === 1).length;
  const avgQuote =
    cleanerQuotes.length > 0
      ? Math.round(
          cleanerQuotes.reduce((sum, x) => sum + x.price_pence, 0) /
            cleanerQuotes.length
        )
      : 0;
  const openRequests = quoteRequests.filter((r) => r.status === "open");
  const cleaners = openRequests.length > 0 ? await listCleaners("approved") : [];
  const nearestByRequest = new Map<number, NearbyCleaner[]>();
  for (const request of openRequests.slice(0, 12)) {
    nearestByRequest.set(request.id, await nearestCleaners(request.outward, 5));
  }
  const rate = week.quotes > 0 ? Math.round((week.booked / week.quotes) * 100) : 0;
  const rateNow =
    convNow.quotes > 0 ? Math.round((convNow.booked / convNow.quotes) * 100) : 0;
  const ratePrev =
    convPrev.quotes > 0 ? Math.round((convPrev.booked / convPrev.quotes) * 100) : 0;
  const convDelta = rateNow - ratePrev;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
        <p className="mt-1 text-sm text-slate-600">
          The 3-quote process end to end: what customers asked for, what
          cleaners priced it at, and what happened next.
        </p>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-primary-700">
          <a className="underline" href="#requests">
            Quote requests
          </a>
          <a className="underline" href="#cleaner-quotes">
            Cleaner quotes
          </a>
          <a className="underline" href="#phone">
            Quote over the phone
          </a>
          <a className="underline" href="#calculator">
            Price calculator history
          </a>
          <a className="underline" href="#lead-fees">
            Lead fees
          </a>
        </nav>
      </div>

      {offered && (
        <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
          Offer sent — they have 48 hours to use the {offered}% code.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {added && (
        <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
          {added}
        </div>
      )}
      {quoted && (
        <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
          {quoted}
        </div>
      )}

      <Card
        id="phone"
        title="Quote someone over the phone"
        description="Take their name, number and postcode, tick what needs doing, and they get a text with the price and a button that books it — already filled in."
      >
        <QuoteBuilder
          action={createOfficeQuoteAction}
          items={items}
          bundles={bundles}
          minimumChargePence={settings.minimum_charge_pence}
          commissionPct={Number(settings.commission_pct)}
          protectionPct={Number(settings.protection_pct)}
          protectionEnabled={settings.protection_enabled}
          submitLabel="Price it & text the link"
        >
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
        </QuoteBuilder>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Quoted this week", value: String(week.quotes) },
          { label: "Of those, booked", value: `${week.booked} (${rate}%)` },
          { label: "Value quoted", value: gbp(week.quoted_pence) },
          { label: "Value booked", value: gbp(week.booked_pence) },
          {
            label: "Leads sold (30d)",
            value: `${leadStats.sold_30d} · ${gbp(leadStats.revenue_30d_pence)}`,
          },
          {
            label: "Leads sold (ever)",
            value: `${leadStats.sold_all} · ${gbp(leadStats.revenue_all_pence)}`,
          },
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

      {/* Conversion watch: quotes CREATED in each 7-day window, so a price
          change shows up here within days instead of as a vague feeling. */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quote → booking conversion
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <p className="text-2xl font-bold tabular-nums text-slate-900">
            {rateNow}%{" "}
            <span className="text-sm font-semibold text-slate-500">
              this week ({convNow.booked}/{convNow.quotes})
            </span>
          </p>
          <p className="text-2xl font-bold tabular-nums text-slate-400">
            {ratePrev}%{" "}
            <span className="text-sm font-semibold text-slate-400">
              last week ({convPrev.booked}/{convPrev.quotes})
            </span>
          </p>
          {convNow.quotes > 0 && convPrev.quotes > 0 && convDelta !== 0 && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                convDelta > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {convDelta > 0 ? "▲" : "▼"} {Math.abs(convDelta)} pts
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Counted by when the quote was created, so each week reflects the
          prices that were live at the time. Check here a few days after any
          price change.
        </p>
      </div>

      {/* Rolling totals — always the last 30/365 days, not calendar months. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Quoted — last 30 days",
            value: gbp(month.quoted_pence),
            sub: `${month.quotes} quotes`,
          },
          {
            label: "Booked — last 30 days",
            value: gbp(month.booked_pence),
            sub: `${month.booked} booked${
              month.quotes > 0
                ? ` (${Math.round((month.booked / month.quotes) * 100)}%)`
                : ""
            }`,
          },
          {
            label: "Quoted — last 12 months",
            value: gbp(year.quoted_pence),
            sub: `${year.quotes} quotes`,
          },
          {
            label: "Booked — last 12 months",
            value: gbp(year.booked_pence),
            sub: `${year.booked} booked${
              year.quotes > 0
                ? ` (${Math.round((year.booked / year.quotes) * 100)}%)`
                : ""
            }`,
          },
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
            <p className="text-xs text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {quoteRequests.length > 0 && (
        <Card
          id="requests"
          title={`Quote requests (${quoteRequests.length})`}
          description={`Quote-request mode: cleaners who cover the area quote from their own dashboard. Where nobody covers it, ring round below and put their price in yourself — the customer can't tell the difference, and up to ${MAX_QUOTE_RESPONSES} quotes fit on each request.`}
        >
          <div className="mt-4 space-y-4">
            {quoteRequests.map((r) => {
              const mine = responses.filter((x) => x.request_id === r.id);
              const nearby = nearestByRequest.get(r.id) ?? [];
              const full = mine.length >= MAX_QUOTE_RESPONSES;
              return (
                <div
                  key={r.id}
                  id={`request-${r.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {r.customer_name || "No name"}{" "}
                        <span className="font-normal text-slate-500">
                          · {r.postcode}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.created_at} ·{" "}
                        <a className="underline" href={`tel:${r.customer_phone}`}>
                          {r.customer_phone}
                        </a>
                        {r.covered ? "" : " · nobody covers this area"}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        {(r.items ?? [])
                          .map((line) => `${line.qty}× ${line.label}`)
                          .join(", ") || "—"}
                      </p>
                      {r.notes ? (
                        <p className="text-xs text-slate-500">“{r.notes}”</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      {r.status === "booked" ? (
                        <span className="text-sm font-semibold text-green-700">
                          Booked {r.booked_ref}
                          {r.accepted_pence ? ` — ${gbp(r.accepted_pence)}` : ""}
                        </span>
                      ) : r.status === "accepted" ? (
                        <span className="text-sm font-semibold text-primary-700">
                          Accepted
                          {r.accepted_pence ? ` ${gbp(r.accepted_pence)}` : ""} —
                          picking a date
                        </span>
                      ) : r.status === "closed" ? (
                        <span className="text-sm text-slate-500">Closed</span>
                      ) : (
                        <span className="text-sm font-semibold text-amber-700">
                          {mine.length} of {MAX_QUOTE_RESPONSES} quotes in
                        </span>
                      )}
                      <p className="mt-1 text-xs">
                        <Link
                          className="text-primary-700 underline"
                          href={`/quotes/${r.token}`}
                        >
                          See the customer&rsquo;s page
                        </Link>
                      </p>
                    </div>
                  </div>

                  {mine.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-slate-700">
                      {mine.map((x) => (
                        <li key={x.id}>
                          <span className="font-semibold tabular-nums">
                            {gbp(x.price_pence)}
                          </span>{" "}
                          — {x.cleaner_name}
                          {x.message ? (
                            <span className="text-slate-500"> “{x.message}”</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}

                  {r.status === "accepted" && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
                      <div className="text-sm text-slate-600">
                        <p>
                          Chosen their cleaner but hasn&rsquo;t picked a date —
                          no date, no clean, no commission.
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.booking_chased_at
                            ? `Last texted ${r.booking_chased_at} · ${r.booking_chases} of 2 automatic nudges used`
                            : "Not nudged yet"}
                          {r.customer_email ? "" : " · no email on file"}
                        </p>
                      </div>
                      <form action={chaseQuoteBookingAction}>
                        <input type="hidden" name="requestId" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white"
                        >
                          Text them to book
                        </button>
                      </form>
                      <a
                        className="text-xs font-semibold text-slate-600 underline"
                        href={`tel:${r.customer_phone}`}
                      >
                        Or ring {r.customer_phone}
                      </a>
                    </div>
                  )}

                  {r.status === "open" && (
                    <div className="mt-4 space-y-3 border-t border-slate-200 pt-3">
                      {nearby.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nearest cleaners to {r.outward}
                          </p>
                          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
                            {nearby.map((c) => (
                              <li key={c.id}>
                                <a className="underline" href={`tel:${c.phone}`}>
                                  {c.business_name || c.name}
                                </a>{" "}
                                <span className="text-xs text-slate-500">
                                  {c.covers
                                    ? "covers it"
                                    : c.miles === null
                                      ? "distance unknown"
                                      : `${Math.round(c.miles)} mi · ~${driveMinutes(c.miles)} min`}
                                  {c.paused ? " · paused" : ""}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {full ? (
                        <p className="text-sm text-slate-600">
                          Three quotes are in — the customer picks from here.
                        </p>
                      ) : (
                        <form
                          action={addOfficeQuoteAction}
                          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_auto]"
                        >
                          <input type="hidden" name="requestId" value={r.id} />
                          <select
                            name="cleanerId"
                            required
                            defaultValue=""
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          >
                            <option value="" disabled>
                              Which cleaner gave you the price?
                            </option>
                            {(nearby.length > 0 ? nearby : []).map((c) => (
                              <option key={`near-${c.id}`} value={c.id}>
                                {c.business_name || c.name}
                                {c.miles === null
                                  ? ""
                                  : ` — ${Math.round(c.miles)} mi`}
                              </option>
                            ))}
                            {cleaners
                              .filter((c) => !nearby.some((n) => n.id === c.id))
                              .map((c) => (
                                <option key={`all-${c.id}`} value={c.id}>
                                  {c.business_name || c.name}
                                </option>
                              ))}
                          </select>
                          <input
                            name="price"
                            inputMode="decimal"
                            placeholder="£ price"
                            required
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Add quote
                          </button>
                          <input
                            name="message"
                            placeholder="Anything they said — “can do Thursday”"
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm sm:col-span-3"
                          />
                          <div className="flex flex-wrap gap-4 text-xs text-slate-600 sm:col-span-3">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="addArea" defaultChecked />
                              Add {r.outward} to their coverage
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" name="quiet" />
                              Don&rsquo;t text the customer — I&rsquo;ll tell them
                            </label>
                          </div>
                        </form>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <form action={resendQuoteLinkAction}>
                          <input type="hidden" name="requestId" value={r.id} />
                          <button
                            type="submit"
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            Send the link again
                          </button>
                        </form>
                        <form action={closeQuoteRequestAction}>
                          <input type="hidden" name="requestId" value={r.id} />
                          <button
                            type="submit"
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            Close request
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card
        id="cleaner-quotes"
        title={`Cleaner quotes (${cleanerQuotes.length})`}
        description="Every price a cleaner has put on a quote request — the 3-quote process in full, winners and losers together. Useful for who prices high, who prices low, and how wide the spread is on the same job."
      >
        {cleanerQuotes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No cleaner has quoted a request yet.
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Average quote
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                  {gbp(avgQuote)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quotes that won
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                  {decided.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cheapest one chosen
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                  {decided.length === 0
                    ? "—"
                    : `${cheapestWon} of ${decided.length}`}
                </p>
                <p className="text-xs text-slate-500">
                  Price isn&rsquo;t always what wins it
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">When</th>
                    <th className="py-2 font-semibold">Customer</th>
                    <th className="py-2 font-semibold">Wants</th>
                    <th className="py-2 font-semibold">Cleaner</th>
                    <th className="py-2 text-right font-semibold">Quoted</th>
                    <th className="py-2 font-semibold">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cleanerQuotes.map((x) => (
                    <tr key={x.id} className="align-top">
                      <td className="py-2 text-slate-500">{x.created_at}</td>
                      <td className="py-2">
                        <Link
                          className="font-semibold text-primary-700 underline"
                          href={`/admin/quotes#request-${x.request_id}`}
                        >
                          {x.customer_name || "No name"}
                        </Link>
                        <p className="text-xs text-slate-500">{x.postcode}</p>
                      </td>
                      <td className="py-2 text-slate-600">
                        {(x.items ?? [])
                          .map((line) => `${line.qty}× ${line.label}`)
                          .join(", ") || "—"}
                        {x.message ? (
                          <p className="text-xs text-slate-400">“{x.message}”</p>
                        ) : null}
                      </td>
                      <td className="py-2">
                        <Link
                          className="text-slate-800 underline"
                          href={`/admin/cleaners#cleaner-${x.cleaner_id}`}
                        >
                          {x.cleaner_name}
                        </Link>
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums text-slate-900">
                        {gbp(x.price_pence)}
                        <p className="text-xs font-normal text-slate-500">
                          {x.of > 1 ? `${x.rank} of ${x.of}` : "only quote"}
                        </p>
                      </td>
                      <td className="py-2">
                        {x.won && x.booked_ref ? (
                          <Link
                            className="font-semibold text-green-700 underline"
                            href={`/admin/jobs/${x.booked_ref}`}
                          >
                            Won — booked {x.booked_ref}
                          </Link>
                        ) : x.won ? (
                          <span className="font-semibold text-primary-700">
                            Chosen — picking a date
                          </span>
                        ) : x.request_status === "open" ? (
                          <span className="text-amber-700">Still open</span>
                        ) : (
                          <span className="text-slate-500">Lost</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Card
        id="calculator"
        title="Website price calculator"
        description="Baskets that reached a price on /book. In quote-request mode the site no longer shows prices, so this is history from fixed-price mode — kept because anyone here who left a mobile is still a lead worth a discount text."
      >
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
                      {(quote.customer_name || quote.customer_phone) && (
                        <span className="block text-xs font-normal text-slate-500">
                          {quote.token ? (
                            <Link
                              href={`/admin/quotes/${quote.token}`}
                              className="font-semibold text-primary-600 underline"
                            >
                              {quote.customer_name || "Lead"}
                            </Link>
                          ) : (
                            quote.customer_name || "Lead"
                          )}
                          {quote.customer_phone && (
                            <>
                              {" · "}
                              <a
                                href={`tel:${quote.customer_phone}`}
                                className="font-semibold text-primary-600 underline"
                              >
                                {quote.customer_phone}
                              </a>
                            </>
                          )}
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
                        <div>
                          <span className="text-slate-500">Quoted only</span>
                          {quote.offer_sent_at && (
                            <p className="mt-1 text-xs font-semibold text-accent-700">
                              {quote.offer_pct}% offer texted {quote.offer_sent_at}
                            </p>
                          )}
                          {quote.lead_sold_to ? (
                            <p className="mt-1 text-xs font-semibold text-accent-700">
                              Lead sold to {quote.lead_sold_to_name} ·{" "}
                              {gbp(quote.lead_price_pence)}
                              {quote.lead_credited_at
                                ? " · credited"
                                : quote.lead_settled_at
                                  ? " · invoiced"
                                  : ""}
                            </p>
                          ) : quote.lead_listed_at ? (
                            <p className="mt-1 text-xs font-semibold text-amber-700">
                              Lead listed at {gbp(quote.lead_price_pence)} —
                              waiting for a buyer
                            </p>
                          ) : null}
                          {quote.lead_credit_requested_at && !quote.lead_credited_at && (
                            <p className="mt-1 max-w-[240px] whitespace-normal rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                              Credit requested {quote.lead_credit_requested_at}:{" "}
                              {{
                                "dead-number": "number dead/unreachable",
                                "wrong-person": "wrong person",
                                "never-asked": "never asked for a quote",
                                "already-mine": "already their customer",
                              }[quote.lead_credit_reason ?? ""] ?? quote.lead_credit_reason}
                            </p>
                          )}
                          {quote.lead_sold_to && !quote.lead_credited_at && !quote.lead_settled_at && (
                            <div className="mt-1 flex gap-1">
                              <form action={creditLeadAction}>
                                <input type="hidden" name="id" value={quote.id} />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  {quote.lead_credit_requested_at ? "Approve credit" : "Credit (dud lead)"}
                                </button>
                              </form>
                              {quote.lead_credit_requested_at && (
                                <form action={rejectLeadCreditAction}>
                                  <input type="hidden" name="id" value={quote.id} />
                                  <button
                                    type="submit"
                                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                  >
                                    Reject — fee stands
                                  </button>
                                </form>
                              )}
                            </div>
                          )}
                          {quote.lead_listed_at && !quote.lead_sold_to && (
                            <form action={cancelLeadAction} className="mt-1">
                              <input type="hidden" name="id" value={quote.id} />
                              <button
                                type="submit"
                                className="rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                              >
                                Cancel lead sale
                              </button>
                            </form>
                          )}
                          {!quote.lead_listed_at && quote.customer_phone && (
                            <form
                              action={listLeadAction}
                              className="mt-1 flex items-center gap-1"
                            >
                              <input type="hidden" name="id" value={quote.id} />
                              <span className="text-xs text-slate-500">£</span>
                              <input
                                name="price"
                                defaultValue="12"
                                aria-label="Lead price in pounds"
                                className="w-12 rounded-lg border border-slate-300 px-2 py-1 text-xs text-right tabular-nums"
                              />
                              <button
                                type="submit"
                                className="rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-amber-700"
                              >
                                Sell as lead
                              </button>
                            </form>
                          )}
                          {!quote.lead_sold_to && quote.customer_phone && (
                            <form
                              action={offerQuoteDiscountAction}
                              className="mt-1 flex items-center gap-1"
                            >
                              <input type="hidden" name="id" value={quote.id} />
                              <select
                                name="pct"
                                defaultValue="10"
                                aria-label="Discount to offer"
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                              >
                                <option value="5">5%</option>
                                <option value="10">10%</option>
                                <option value="15">15%</option>
                                <option value="20">20%</option>
                              </select>
                              <button
                                type="submit"
                                className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
                              >
                                {quote.lead_listed_at
                                  ? "Cancel sale & text offer"
                                  : quote.offer_sent_at
                                    ? "Text again"
                                    : "Text offer"}
                              </button>
                            </form>
                          )}
                          {!quote.lead_sold_to && quote.customer_phone && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-xs font-semibold text-primary-700">
                                💬 Text {quote.customer_name.split(" ")[0] || "them"}
                              </summary>
                              <form
                                action={textQuoteCustomerAction}
                                className="mt-1 w-56 space-y-1"
                              >
                                <input type="hidden" name="id" value={quote.id} />
                                <textarea
                                  name="body"
                                  required
                                  rows={2}
                                  maxLength={600}
                                  placeholder="Your message…"
                                  className="w-full whitespace-normal rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                                />
                                <button
                                  type="submit"
                                  className="rounded-lg bg-primary-600 px-3 py-1 text-xs font-semibold text-white"
                                >
                                  Send
                                </button>
                              </form>
                            </details>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {leadFees.length > 0 && (
        <Card
          id="lead-fees"
          title="Lead fees to invoice"
          description="Sold leads not yet billed. Add the amount to the cleaner's next commission invoice (a manual invoice works too), then mark it invoiced here."
        >
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {leadFees.map((row) => (
              <li
                key={row.cleaner_id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <span className="font-semibold text-slate-900">
                  {row.cleaner_name}
                  <span className="ml-2 font-normal text-slate-500">
                    {row.leads} lead{row.leads === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-bold tabular-nums text-slate-900">
                    {gbp(row.owed_pence)}
                  </span>
                  <form action={settleLeadFeesAction}>
                    <input type="hidden" name="cleanerId" value={row.cleaner_id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Mark invoiced
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs text-slate-500">
        A row is one visitor&apos;s basket, updated as they change it — not one
        row per click. Somebody who prices a job twice a week apart appears
        twice, because each visit is its own session.
      </p>
    </main>
  );
}
