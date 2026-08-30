import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { listInvoices, listUninvoicedCommission } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { generateInvoicesAction, setInvoiceStatusAction } from "../actions";
import { Alert, Card, StatusPill } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Commission invoices",
  robots: { index: false, follow: false },
};

function monthBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { start: iso(start), end: iso(end) };
}

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { error, saved, created } = await searchParams;

  const [pending, invoices] = await Promise.all([
    listUninvoicedCommission(),
    listInvoices(),
  ]);
  const { start, end } = monthBounds();

  const pendingTotal = pending.reduce((sum, row) => sum + row.total_pence, 0);
  const unpaidTotal = invoices
    .filter((invoice) => invoice.status === "issued")
    .reduce((sum, invoice) => sum + invoice.total_pence, 0);

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Invoice updated.</Alert>}
        {created !== undefined && (
          <Alert tone="success">
            {created === "0"
              ? "Nothing to invoice — every completed job is already billed."
              : `Raised ${created} commission invoice${created === "1" ? "" : "s"}.`}
          </Alert>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Accrued, not yet invoiced
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {gbp(pendingTotal)}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Invoiced, awaiting payment
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-900 tabular-nums">
              {gbp(unpaidTotal)}
            </p>
          </div>
        </div>

        <Card
          title="Raise commission invoices"
          description="Bills every completed job that isn't already on an invoice, one invoice per cleaner. Safe to run twice — a job can only ever be billed once."
        >
          {pending.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {pending.map((row) => (
                <li
                  key={row.cleaner_id}
                  className="flex justify-between py-2 text-slate-700"
                >
                  <span>
                    {row.cleaner_name} — {row.jobs} job
                    {row.jobs === 1 ? "" : "s"}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {gbp(row.total_pence)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form
            action={generateInvoicesAction}
            className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5"
          >
            <div>
              <label
                htmlFor="periodStart"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Period start
              </label>
              <input
                id="periodStart"
                name="periodStart"
                type="date"
                defaultValue={start}
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label
                htmlFor="periodEnd"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Period end
              </label>
              <input
                id="periodEnd"
                name="periodEnd"
                type="date"
                defaultValue={end}
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={pending.length === 0}
              className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white disabled:opacity-40"
            >
              Raise invoices
            </button>
          </form>
        </Card>

        <Card title={`Invoices (${invoices.length})`} className="mt-8">
          {invoices.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No invoices raised yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Invoice</th>
                    <th className="py-2 font-semibold">Cleaner</th>
                    <th className="py-2 font-semibold">Period</th>
                    <th className="py-2 font-semibold">Jobs</th>
                    <th className="py-2 text-right font-semibold">Amount</th>
                    <th className="py-2 font-semibold">Status</th>
                    <th className="py-2 font-semibold" />
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
                      <td className="py-2 text-slate-700">
                        {invoice.cleaner_name}
                      </td>
                      <td className="py-2 whitespace-nowrap text-slate-600">
                        {invoice.period_start} → {invoice.period_end}
                      </td>
                      <td className="py-2 text-slate-600">{invoice.jobs}</td>
                      <td className="py-2 text-right font-semibold tabular-nums">
                        {gbp(invoice.total_pence)}
                      </td>
                      <td className="py-2">
                        <StatusPill status={invoice.status} />
                      </td>
                      <td className="py-2 text-right">
                        <form action={setInvoiceStatusAction}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={invoice.status === "paid" ? "issued" : "paid"}
                          />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-primary-600 underline"
                          >
                            {invoice.status === "paid"
                              ? "Mark unpaid"
                              : "Mark paid"}
                          </button>
                        </form>
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
