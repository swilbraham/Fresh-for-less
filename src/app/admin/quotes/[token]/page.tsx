import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  basketFromQuote,
  getPriceItems,
  getQuoteByToken,
  getSettings,
  siteUrl,
} from "@/lib/marketplace/repo";
import { gbp, gbpShort } from "@/lib/marketplace/money";
import { Alert, Card } from "@/components/marketplace/shell";
import {
  bookQuoteAction,
  resendQuoteAction,
  updateQuoteAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Quote", robots: { index: false, follow: false } };

/** Tomorrow, as the earliest date the office should normally offer. */
function defaultDate(minNoticeDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(1, minNoticeDays));
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

export default async function AdminQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; saved?: string; sent?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { token } = await params;
  const { error, saved, sent } = await searchParams;

  const quote = await getQuoteByToken(token);
  if (!quote || !quote.token) notFound();

  const [items, settings] = await Promise.all([getPriceItems(true), getSettings()]);
  const { basket, protection } = basketFromQuote(quote);
  const lineTotal = quote.items.reduce((sum, line) => sum + line.amount_pence, 0);
  const topUp = Math.max(0, quote.total_pence - lineTotal);
  const link = `${siteUrl()}/quote/${quote.token}`;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Link href="/admin/quotes" className="text-sm font-semibold text-slate-600 hover:text-primary-600">
          ← All quotes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {quote.customer_name || "Quote"}{" "}
          <span className="font-mono text-base text-slate-500">{quote.token}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {quote.customer_phone}
          {quote.customer_email ? ` · ${quote.customer_email}` : ""}
          {quote.postcode ? ` · ${quote.postcode}` : " · no postcode yet"}
        </p>
      </div>

      {error && <Alert>{error}</Alert>}
      {saved && <Alert tone="success">Saved and re-priced. The link they already have now shows the new figure.</Alert>}
      {sent && <Alert tone="success">Texted again.</Alert>}

      {quote.booked_ref && (
        <Alert tone="success">
          Booked as{" "}
          <Link href={`/admin/jobs/${quote.booked_ref}`} className="font-semibold underline">
            {quote.booked_ref}
          </Link>
          . Change the job rather than the quote from here on.
        </Alert>
      )}

      <Card title="What they were quoted" description={`They see this at ${link}`}>
        <ul className="mt-3 divide-y divide-slate-100 border-y border-slate-100 text-sm">
          {quote.items.map((line) => (
            <li key={line.code} className="flex justify-between gap-4 py-2">
              <span className="text-slate-700">
                {line.qty > 1 ? `${line.qty} × ` : ""}
                {line.label}
                {line.note && (
                  <span className="block text-xs text-accent-700">{line.note}</span>
                )}
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {gbp(line.amount_pence)}
              </span>
            </li>
          ))}
          {topUp > 0 && (
            <li className="flex justify-between gap-4 py-2">
              <span className="text-slate-700">Minimum charge for a visit</span>
              <span className="font-semibold tabular-nums text-slate-900">{gbp(topUp)}</span>
            </li>
          )}
        </ul>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-bold text-slate-900">Fixed price</span>
          <span className="text-2xl font-bold tabular-nums text-accent-700">
            {gbp(quote.total_pence)}
          </span>
        </div>

        {!quote.booked_ref && (
          <form action={resendQuoteAction} className="mt-4">
            <input type="hidden" name="token" value={quote.token} />
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Text them the link again
            </button>
          </form>
        )}
      </Card>

      {!quote.booked_ref && (
        <Card
          title="Amend it"
          description="Re-prices against today's price list and keeps the same link, so the text they already have shows the new figure."
        >
          <form action={updateQuoteAction} className="mt-4 space-y-4">
            <input type="hidden" name="token" value={quote.token} />
            <div className="grid gap-3 sm:grid-cols-4">
              <input name="customerName" required defaultValue={quote.customer_name} placeholder="Name" aria-label="Name" className="rounded-xl border border-slate-300 px-4 py-2.5" />
              <input name="customerPhone" required defaultValue={quote.customer_phone} placeholder="Mobile" aria-label="Mobile" className="rounded-xl border border-slate-300 px-4 py-2.5" />
              <input name="customerEmail" defaultValue={quote.customer_email} placeholder="Email (optional)" aria-label="Email" className="rounded-xl border border-slate-300 px-4 py-2.5" />
              <input name="postcode" defaultValue={quote.postcode} placeholder="Postcode (optional)" aria-label="Postcode" className="rounded-xl border border-slate-300 px-4 py-2.5 uppercase" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <label key={item.code} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <span className="text-slate-700">
                    {item.label}{" "}
                    <span className="text-slate-400">{gbpShort(item.unit_price_pence)}</span>
                  </span>
                  <input
                    type="number"
                    name={`qty_${item.code}`}
                    min="0"
                    max={item.max_qty || 20}
                    defaultValue={basket[item.code] ?? 0}
                    aria-label={`How many ${item.label}`}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-right"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white">
                Save &amp; re-price
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="protection" defaultChecked={protection} className="h-4 w-4 rounded border-slate-300 accent-accent-600" />
                Stain protection
              </label>
              <span className="text-xs text-slate-500">
                Saving doesn&apos;t text them — use the button above when you want them to see it.
              </span>
            </div>
          </form>
        </Card>
      )}

      {!quote.booked_ref && (
        <Card
          title="Book it for them"
          description="For when they say yes on the call. Takes the same path as a web booking: the job goes out to cleaners and they get the usual confirmation and manage link."
        >
          <form action={bookQuoteAction} className="mt-4 space-y-4">
            <input type="hidden" name="token" value={quote.token} />
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="addressLine" required placeholder="Address" aria-label="Address" className="rounded-xl border border-slate-300 px-4 py-2.5 sm:col-span-2" />
              <input name="town" placeholder="Town" aria-label="Town" className="rounded-xl border border-slate-300 px-4 py-2.5" />
              <input name="postcode" required defaultValue={quote.postcode} placeholder="Postcode" aria-label="Postcode" className="rounded-xl border border-slate-300 px-4 py-2.5 uppercase" />
              <input type="date" name="slotDate" required defaultValue={defaultDate(settings.min_notice_days)} aria-label="Date" className="rounded-xl border border-slate-300 px-4 py-2.5" />
              <select name="slotWindow" defaultValue="am" aria-label="Morning or afternoon" className="rounded-xl border border-slate-300 px-4 py-2.5">
                <option value="am">Morning (8am–12pm)</option>
                <option value="pm">Afternoon (12pm–5pm)</option>
              </select>
              <input name="parking" placeholder="Parking (optional)" aria-label="Parking" className="rounded-xl border border-slate-300 px-4 py-2.5" />
              <input name="notes" placeholder="Anything they mentioned" aria-label="Notes" className="rounded-xl border border-slate-300 px-4 py-2.5 sm:col-span-2" />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" name="agreed" required className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-accent-600" />
              <span>
                I told them the price, the cancellation window and that payment
                is due in full on the day, and they agreed on the call. Booking
                this way records no tick from the customer, because there
                wasn&apos;t one.
              </span>
            </label>

            <button type="submit" className="rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white transition hover:bg-accent-700">
              Book it — {gbp(quote.total_pence)}
            </button>
          </form>
        </Card>
      )}
    </main>
  );
}
