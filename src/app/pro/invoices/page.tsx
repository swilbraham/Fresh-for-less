import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCleaner } from "@/lib/marketplace/auth";
import { listInvoices, listJobsForCleaner } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { Card, ProNav, StatusPill } from "@/components/marketplace/shell";
import {
  COMMISSION_TERMS_LONG,
  formatCommissionMonday,
} from "@/lib/marketplace/terms";

export const dynamic = "force-dynamic";

export const metadata = { title: "Commission", robots: { index: false } };

export default async function InvoicesPage() {
  const cleaner = await currentCleaner();
  if (!cleaner) redirect("/pro?next=/pro/invoices");

  const [invoices, completed] = await Promise.all([
    listInvoices(cleaner.id),
    listJobsForCleaner(cleaner.id, ["completed"]),
  ]);

  const invoicedTotal = invoices.reduce((sum, i) => sum + i.total_pence, 0);
  const commissionToDate = completed.reduce(
    (sum, job) => sum + job.commission_pence,
    0
  );
  const notYetInvoiced = Math.max(0, commissionToDate - invoicedTotal);
  const outstanding = invoices
    .filter((invoice) => invoice.status === "issued")
    .reduce((sum, invoice) => sum + invoice.total_pence, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <ProNav name={cleaner.name} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Commission</h1>
        <p className="mt-2 text-slate-600">{COMMISSION_TERMS_LONG}</p>
        <p className="mt-2 text-sm font-semibold text-slate-700">
          Next invoice run: {formatCommissionMonday()}
        </p>

        <div className="my-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Invoiced &amp; unpaid
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-900 tabular-nums">
              {gbp(outstanding)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Accrued this week
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {gbp(notYetInvoiced)}
            </p>
          </div>
        </div>

        <Card title="Your invoices">
          {invoices.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No commission invoices raised yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Invoice</th>
                    <th className="py-2 font-semibold">Period</th>
                    <th className="py-2 font-semibold">Jobs</th>
                    <th className="py-2 text-right font-semibold">Amount</th>
                    <th className="py-2 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-2 font-medium">
                        <Link
                          href={`/pro/invoices/${invoice.ref}`}
                          className="text-primary-600 underline"
                        >
                          {invoice.ref}
                        </Link>
                      </td>
                      <td className="py-2 text-slate-600">
                        {invoice.period_start} → {invoice.period_end}
                      </td>
                      <td className="py-2 text-slate-600">{invoice.jobs}</td>
                      <td className="py-2 text-right font-semibold tabular-nums">
                        {gbp(invoice.total_pence)}
                      </td>
                      <td className="py-2 text-right">
                        <StatusPill status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
