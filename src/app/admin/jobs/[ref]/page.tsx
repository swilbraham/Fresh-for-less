import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getJobByRef,
  getJobDrops,
  getJobMessages,
  getJobInvoiceRef,
  getJobOffers,
  listCleaners,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { toE164 } from "@/lib/marketplace/phone";
import { AdminNav, Alert, Card, StatusPill } from "@/components/marketplace/shell";
import {
  assignJobAction,
  cancelJobAction,
  waiveCommissionAction,
  setJobCommissionAction,
  reassignJobAction,
  rebroadcastJobAction,
} from "../../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Job", robots: { index: false, follow: false } };

function longDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AdminJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ error?: string; waived?: string; commission?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { ref } = await params;
  const { error, waived, commission } = await searchParams;

  const job = await getJobByRef(ref.toUpperCase());
  if (!job) notFound();

  const [offers, drops, cleaners, messages, invoiceRef] = await Promise.all([
    getJobOffers(job.id),
    getJobDrops(job.id),
    listCleaners("approved"),
    getJobMessages(job.id),
    getJobInvoiceRef(job.id),
  ]);

  // Commission stays adjustable after the job is done — that's when a goodwill
  // discount usually gets agreed — but not once it's been billed.
  const commissionEditable = job.status !== "cancelled" && !invoiceRef;

  /**
   * Match messages to a cleaner by the address they were actually sent to.
   * Being offered a job and being reachable are different things.
   */
  const deliveryFor = (phone: string, email: string) => {
    const mobile = toE164(phone);
    const mine = messages.filter(
      (m) => m.recipient === mobile || m.recipient === email
    );
    const sms = mine.find((m) => m.channel === "sms");
    if (!sms) return { label: "no text sent", tone: "text-amber-700" };
    if (sms.error)
      return { label: `text failed: ${sms.error.slice(0, 40)}`, tone: "text-red-600" };
    if (sms.sent_at)
      return { label: `texted ${sms.sent_at}`, tone: "text-accent-700" };
    return { label: "text logged, not delivered", tone: "text-amber-700" };
  };

  const keeps = job.total_pence - job.commission_pence;
  const open = !["completed", "cancelled"].includes(job.status);

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/admin/jobs"
          className="text-sm font-semibold text-slate-600 hover:text-primary-600"
        >
          ← All jobs
        </Link>

        <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{job.ref}</h1>
          <StatusPill status={job.status} />
          {job.rescheduled_count > 0 && (
            <span className="text-sm text-slate-500">
              moved {job.rescheduled_count}×
            </span>
          )}
        </div>

        {error && <Alert>{error}</Alert>}
        {commission && (
          <Alert tone="info">
            Commission updated. {job.cleaner_id ? "The cleaner has been texted the new figure." : ""}
          </Alert>
        )}
        {waived && (
          <Alert tone="success">
            Commission waived — this job won&apos;t be invoiced.
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="The job">
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="When" value={`${longDate(job.slot_date)} · ${job.slot_window === "am" ? "Morning 8am–12pm" : "Afternoon 12pm–5pm"}`} />
              <Row label="Where" value={`${job.address_line}${job.town ? `, ${job.town}` : ""}, ${job.postcode}`} />
              <Row label="Booked" value={job.created_at} />
            </dl>

            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              What was booked
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {job.items.map((line) => (
                <li key={line.code} className="flex justify-between gap-3">
                  <span className="text-slate-700">
                    {line.qty} × {line.label}
                    {line.note && (
                      <span className="block text-xs text-accent-700">{line.note}</span>
                    )}
                  </span>
                  <span className="tabular-nums font-medium">{gbp(line.amount_pence)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
              <Row label="Customer pays" value={gbp(job.total_pence)} strong />
              <Row
                label={
                  job.commission_pence === 0
                    ? "Commission — waived"
                    : `Commission (${Number(job.commission_pct)}%)`
                }
                value={gbp(job.commission_pence)}
              />
              <Row label="Cleaner keeps" value={gbp(keeps)} />
            </dl>

            {job.notes && (
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <span className="font-semibold">Customer notes:</span> {job.notes}
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card title="Customer">
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Name" value={job.customer_name} />
                <Row label="Phone" value={job.customer_phone} />
                <Row label="Email" value={job.customer_email} />
              </dl>
            </Card>

            <Card title="Cleaner">
              {job.cleaner_id ? (
                <p className="mt-2 text-sm text-slate-700">
                  Assigned — see the offer history below.
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Nobody assigned yet.
                </p>
              )}

              {open && cleaners.length > 0 && (
                <form action={assignJobAction} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={job.id} />
                  <select
                    name="cleanerId"
                    defaultValue=""
                    aria-label="Assign to a cleaner"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Assign to…</option>
                    {cleaners.map((cleaner) => (
                      <option key={cleaner.id} value={cleaner.id}>
                        {cleaner.name}
                        {cleaner.business_name ? ` — ${cleaner.business_name}` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Assign
                  </button>
                  <label className="flex w-full items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      name="waiveCommission"
                      className="h-4 w-4 rounded border-slate-300 accent-accent-600"
                    />
                    No commission on this job — don&apos;t invoice it
                  </label>
                </form>
              )}

              {open && (
                <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs">
                  {job.status === "accepted" && (
                    <form action={reassignJobAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <button type="submit" className="font-semibold text-primary-600 underline">
                        Take off this cleaner &amp; re-offer
                      </button>
                    </form>
                  )}
                  {["provisional", "unfilled", "offered"].includes(job.status) && (
                    <form action={rebroadcastJobAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <button type="submit" className="font-semibold text-primary-600 underline">
                        Re-broadcast
                      </button>
                    </form>
                  )}
                  <form action={cancelJobAction}>
                    <input type="hidden" name="id" value={job.id} />
                    <button type="submit" className="font-semibold text-red-600 underline">
                      Cancel booking
                    </button>
                  </form>
                </div>
              )}

              {commissionEditable && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs">
                  <form action={setJobCommissionAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={job.id} />
                    <input type="hidden" name="ref" value={job.ref} />
                    <label htmlFor="pct" className="text-slate-600">
                      Commission on this job
                    </label>
                    <input
                      id="pct"
                      name="pct"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      defaultValue={Number(job.commission_pct)}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right tabular-nums"
                    />
                    <span className="text-slate-500">%</span>
                    <button type="submit" className="font-semibold text-primary-600 underline">
                      Save
                    </button>
                  </form>
                  {job.commission_pence > 0 && (
                    <form action={waiveCommissionAction}>
                      <input type="hidden" name="id" value={job.id} />
                      <input type="hidden" name="ref" value={job.ref} />
                      <button type="submit" className="font-semibold text-slate-600 underline">
                        Waive
                      </button>
                    </form>
                  )}
                </div>
              )}

              {invoiceRef && (
                <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  Commission is fixed — this job is on invoice{" "}
                  <span className="font-semibold text-slate-700">{invoiceRef}</span>.
                </p>
              )}
            </Card>
          </div>
        </div>

        <Card title={`Offered to ${offers.length} cleaner${offers.length === 1 ? "" : "s"}`} className="mt-6">
          {offers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Not offered to anyone yet — nobody covers {job.outward}, or it&apos;s
              still provisional.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {offers.map((offer) => (
                <li key={offer.cleaner_id} className="flex flex-wrap justify-between gap-2 py-2">
                  <span className="text-slate-700">
                    {offer.cleaner_name}
                    {offer.business_name ? ` · ${offer.business_name}` : ""}
                    <span className="block text-xs text-slate-500">
                      {offer.phone} · offered {offer.sent_at}
                    </span>
                    <span
                      className={`block text-xs font-medium ${deliveryFor(offer.phone, "").tone}`}
                    >
                      {deliveryFor(offer.phone, "").label}
                    </span>
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      offer.response === "accepted"
                        ? "text-accent-700"
                        : offer.response === "declined"
                          ? "text-red-600"
                          : "text-slate-400"
                    }`}
                  >
                    {offer.response
                      ? `${offer.response} ${offer.responded_at ?? ""}`
                      : "no reply yet"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Messages sent (${messages.length})`} className="mt-6">
          {messages.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Nothing sent for this job yet.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">When</th>
                    <th className="py-2 font-semibold">Channel</th>
                    <th className="py-2 font-semibold">To</th>
                    <th className="py-2 font-semibold">Message</th>
                    <th className="py-2 font-semibold">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="py-2 whitespace-nowrap text-slate-500">
                        {message.created_at}
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
                          {message.channel}
                        </span>
                      </td>
                      <td className="py-2 text-slate-700">{message.recipient}</td>
                      <td className="py-2 text-slate-600">{message.subject}</td>
                      <td
                        className={`py-2 text-xs font-medium ${
                          message.error
                            ? "text-red-600"
                            : message.sent_at
                              ? "text-accent-700"
                              : "text-slate-400"
                        }`}
                      >
                        {message.error
                          ? `failed: ${message.error.slice(0, 40)}`
                          : message.sent_at
                            ? `sent ${message.sent_at}`
                            : "logged only"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {drops.length > 0 && (
          <Card title="Handed back" className="mt-6">
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {drops.map((drop, index) => (
                <li key={index} className="py-2">
                  <span className="font-medium text-slate-800">{drop.cleaner_name}</span>{" "}
                  <span className="text-slate-500">
                    ({drop.dropped_by}) · {Math.round(Number(drop.hours_notice))}h notice ·{" "}
                    {drop.dropped_at}
                  </span>
                  {drop.reason && (
                    <span className="block text-xs text-slate-600">{drop.reason}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right ${strong ? "font-bold text-slate-900" : "text-slate-800"}`}>
        {value}
      </dd>
    </div>
  );
}
