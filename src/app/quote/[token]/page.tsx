import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import { getQuoteByToken } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { COMPANY_DISCLOSURE } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your quote",
  robots: { index: false, follow: false },
};

/**
 * A quote the office priced over the phone, opened from a text.
 *
 * Deliberately a page of its own rather than a pre-filled booking form: the
 * customer agreed to a price on the phone and wants to see that price, not a
 * form. Booking is one button, and everything they already told us travels
 * with it.
 */
export default async function QuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);
  if (!quote || !quote.token) notFound();

  const expired = Boolean(
    quote.expires_at && new Date(`${quote.expires_at}T23:59:59`) < new Date()
  );

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">
              Your quote
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {quote.customer_name
                ? `${quote.customer_name.split(" ")[0]}, here's your price`
                : "Here's your price"}
            </h1>
            <p className="mt-2 text-slate-600">
              For {quote.postcode}, as we discussed on the phone. Nothing to pay
              now — you pay your cleaner on the day.
            </p>

            <ul className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
              {quote.items.map((line) => (
                <li key={line.code} className="flex justify-between gap-4 py-3">
                  <span className="text-slate-700">
                    {line.qty > 1 ? `${line.qty} × ` : ""}
                    {line.label}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {gbp(line.amount_pence)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-900">
                Fixed price
              </span>
              <span className="text-3xl font-bold tabular-nums text-accent-700">
                {gbp(quote.total_pence)}
              </span>
            </div>

            {quote.booked_ref ? (
              <div className="mt-6 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
                <strong>Already booked.</strong> Your reference is{" "}
                {quote.booked_ref}. We sent the details by text and email.
              </div>
            ) : expired ? (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>This quote has expired.</strong> Prices change, so give
                us a ring and we&apos;ll do you a fresh one — it&apos;ll usually
                be the same.
              </div>
            ) : (
              <>
                <Link
                  href={`/book?quote=${quote.token}`}
                  className="mt-6 block rounded-xl bg-accent-600 px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-accent-700"
                >
                  Accept &amp; pick a date
                </Link>
                <p className="mt-3 text-center text-sm text-slate-500">
                  Your name, number and postcode are already filled in — you
                  just choose a day.
                </p>
              </>
            )}

            <dl className="mt-8 space-y-1 text-sm text-slate-500">
              <div className="flex justify-between gap-4">
                <dt>Quoted</dt>
                <dd>{quote.created_at}</dd>
              </div>
              {quote.expires_at && !quote.booked_ref && (
                <div className="flex justify-between gap-4">
                  <dt>Price held until</dt>
                  <dd>{quote.expires_at}</dd>
                </div>
              )}
            </dl>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            {COMPANY_DISCLOSURE}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
