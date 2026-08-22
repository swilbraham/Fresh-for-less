import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentCleaner, isAdmin } from "@/lib/marketplace/auth";
import { getCleaner, getInvoice, getSettings } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Commission invoice",
  robots: { index: false, follow: false },
};

function longDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function dueDate(issued: string, days: number): string {
  const date = new Date(`${issued}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;

  const result = await getInvoice(ref.toUpperCase());
  if (!result) notFound();
  const { invoice, lines } = result;

  // A cleaner may only open their own; the office may open any.
  const admin = await isAdmin();
  const cleaner = await currentCleaner();
  if (!admin) {
    if (!cleaner) redirect(`/pro?next=/pro/invoices/${ref}`);
    if (cleaner.id !== invoice.cleaner_id) notFound();
  }

  const [settings, billed] = await Promise.all([
    getSettings(),
    getCleaner(invoice.cleaner_id),
  ]);
  const due = dueDate(invoice.issued_at, settings.payment_terms_days);
  const hasBankDetails = Boolean(settings.payee_account && settings.payee_sort_code);

  return (
    <main className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        <div className="mb-4 flex justify-between print:hidden">
          <Link
            href="/pro/invoices"
            className="text-sm font-semibold text-slate-600 hover:text-primary-600"
          >
            ← All invoices
          </Link>
          <p className="text-sm text-slate-500">
            Use your browser&apos;s Print to save this as a PDF.
          </p>
        </div>

        <article className="rounded-2xl bg-white p-10 shadow-sm print:rounded-none print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Invoice</h1>
              <p className="mt-1 font-mono text-sm text-slate-600">
                {invoice.ref}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold text-slate-900">
                {settings.payee_name || "Fresh For Less Carpet Cleaning"}
              </p>
              {settings.payee_address && (
                <p className="mt-1 whitespace-pre-line text-slate-600">
                  {settings.payee_address}
                </p>
              )}
              <p className="mt-1 text-slate-600">0330 043 4811</p>
            </div>
          </header>

          <section className="grid gap-6 py-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Billed to
              </h2>
              <p className="mt-1 font-semibold text-slate-900">
                {billed?.business_name || invoice.cleaner_name}
              </p>
              {billed?.business_name && (
                <p className="text-sm text-slate-600">{invoice.cleaner_name}</p>
              )}
              <p className="text-sm text-slate-600">{billed?.email}</p>
            </div>
            <div className="sm:text-right">
              <dl className="space-y-1 text-sm">
                <div className="sm:flex sm:justify-end sm:gap-3">
                  <dt className="text-slate-500">Invoice date</dt>
                  <dd className="font-semibold text-slate-900">
                    {longDate(invoice.issued_at)}
                  </dd>
                </div>
                <div className="sm:flex sm:justify-end sm:gap-3">
                  <dt className="text-slate-500">Period</dt>
                  <dd className="font-semibold text-slate-900">
                    {longDate(invoice.period_start)} – {longDate(invoice.period_end)}
                  </dd>
                </div>
                <div className="sm:flex sm:justify-end sm:gap-3">
                  <dt className="text-slate-500">Payment due</dt>
                  <dd className="font-semibold text-slate-900">{due}</dd>
                </div>
                <div className="sm:flex sm:justify-end sm:gap-3">
                  <dt className="text-slate-500">Status</dt>
                  <dd
                    className={`font-semibold capitalize ${
                      invoice.status === "paid"
                        ? "text-accent-700"
                        : "text-amber-700"
                    }`}
                  >
                    {invoice.status}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Commission on completed jobs
          </h2>
          <table className="mt-2 w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 font-semibold">Date</th>
                <th className="py-2 font-semibold">Job</th>
                <th className="py-2 text-right font-semibold">Job value</th>
                <th className="py-2 text-right font-semibold">Rate</th>
                <th className="py-2 text-right font-semibold">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.ref}>
                  <td className="py-2 whitespace-nowrap text-slate-600">
                    {line.slot_date}
                  </td>
                  <td className="py-2 text-slate-700">
                    {line.ref} · {line.postcode}
                    <span className="block text-xs text-slate-500">
                      {line.customer_name}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums text-slate-600">
                    {gbp(line.total_pence)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-slate-500">
                    {Number(line.commission_pct)}%
                  </td>
                  <td className="py-2 text-right font-semibold tabular-nums">
                    {gbp(line.amount_pence)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td colSpan={4} className="py-3 text-right font-bold text-slate-900">
                  Total due
                </td>
                <td className="py-3 text-right text-lg font-bold tabular-nums text-slate-900">
                  {gbp(invoice.total_pence)}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="mt-2 text-xs text-slate-500">
            No VAT is charged. {settings.payee_name || "Fresh For Less"} is not
            VAT registered.
          </p>

          <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 print:bg-white">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              How to pay
            </h2>
            {hasBankDetails ? (
              <>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex gap-3">
                    <dt className="w-32 text-slate-500">Account name</dt>
                    <dd className="font-semibold text-slate-900">
                      {settings.payee_name}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-32 text-slate-500">Sort code</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">
                      {settings.payee_sort_code.replace(
                        /(\d{2})(\d{2})(\d{2})/,
                        "$1-$2-$3"
                      )}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-32 text-slate-500">Account number</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">
                      {settings.payee_account}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-32 text-slate-500">Reference</dt>
                    <dd className="font-mono font-semibold text-slate-900">
                      {invoice.ref}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-slate-500">
                  Please use {invoice.ref} as the payment reference so we can
                  match it up. Payment due by {due}.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-700">
                Bank details haven&apos;t been set yet — add them in
                /admin/prices and they&apos;ll appear here.
              </p>
            )}
          </section>

          <p className="mt-6 text-xs text-slate-500">
            This invoice covers platform commission only. You collected the full
            job price directly from each customer on the day.
          </p>

          {settings.legal_footer && (
            <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
              {settings.legal_footer}
            </p>
          )}
        </article>
      </div>
    </main>
  );
}
