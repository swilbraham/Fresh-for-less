import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getJobByRef,
  getJobDrops,
  getJobMessages,
  getJobInvoiceRef,
  getCleaner,
  getCustomerThread,
  getCleanerThread,
  netOfVatPence,
  getJobOffers,
  listCleaners,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { toE164 } from "@/lib/marketplace/phone";
import { Alert, Card, StatusPill } from "@/components/marketplace/shell";
import {
  assignJobAction,
  cancelJobAction,
  waiveCommissionAction,
  setJobCommissionAction,
  textCleanerAction,
  textCustomerAction,
  setJobPriceAction,
  rescheduleJobAction,
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
  searchParams: Promise<{
    error?: string;
    waived?: string;
    repriced?: string;
    commission?: string;
    moved?: string;
    sent?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { ref } = await params;
  const { error, waived, commission, moved, repriced, sent } = await searchParams;

  const job = await getJobByRef(ref.toUpperCase());
  if (!job) notFound();

  const [offers, drops, cleaners, messages, invoiceRef] = await Promise.all([
    getJobOffers(job.id),
    getJobDrops(job.id),
    listCleaners("approved"),
    getJobMessages(job.id),
    getJobInvoiceRef(job.id),
  ]);

  // Who to offer a message box for, and what's already been said on this job.
  const assignedCleaner = job.cleaner_id
    ? cleaners.find((c) => c.id === job.cleaner_id) ??
      (await getCleaner(job.cleaner_id))
    : null;
  const customerThread = (await getCustomerThread(job.id)).slice(-4);
  // The cleaner's own thread rather than this job's messages: their replies
  // arrive as plain texts with no job attached, so filtering by job would
  // show what we sent and hide what they said back.
  const cleanerThread = assignedCleaner
    ? (await getCleanerThread(assignedCleaner.id)).slice(-4)
    : [];

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
    <main>
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
        {sent && (
          <Alert tone="success">Message sent.</Alert>
        )}
        {moved && (
          <Alert tone={moved === "unfilled" ? "error" : "success"}>
            {moved === "kept" && "Moved. The cleaner was free, so the job is still theirs and they've been texted."}
            {moved.startsWith("offered") &&
              `Moved. The cleaner wasn't free, so it's gone back out to ${moved.replace("offered", "")} cleaner(s).`}
            {moved === "unfilled" &&
              "Moved, but nobody covers that slot — it's unfilled and needs assigning."}
            {" The customer has been texted the new date."}
          </Alert>
        )}
        {commission && (
          <Alert tone="info">
            Commission updated. {job.cleaner_id ? "The cleaner has been texted the new figure." : ""}
          </Alert>
        )}
        {repriced === "1" && (
          <Alert tone="success">
            Price updated. The customer has been told, and so has every cleaner
            who was quoted the old figure.
          </Alert>
        )}
        {repriced === "unreachable" && (
          <Alert tone="info">
            <strong>Price updated — but ring the customer.</strong> Every cleaner
            who was quoted the old figure has been told. {job.customer_name} has
            no mobile or email on file, so nothing could be sent to them
            {job.customer_phone ? ` — call ${job.customer_phone}` : ""}.
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
              {job.list_total_pence > 0 && (
                <Row
                  label="List price"
                  value={<span className="line-through">{gbp(job.list_total_pence)}</span>}
                />
              )}
              <Row
                label={job.list_total_pence > 0 ? "Agreed price" : "Customer pays"}
                value={gbp(job.total_pence)}
                strong
              />
              <Row
                label={
                  job.commission_pence === 0
                    ? "Commission — waived"
                    : job.commission_on_net
                      ? `Commission (${Number(job.commission_pct)}% of ${gbp(
                          netOfVatPence(job.total_pence)
                        )} ex VAT)`
                      : `Commission (${Number(job.commission_pct)}%)`
                }
                value={gbp(job.commission_pence)}
              />
              <Row label="Cleaner keeps" value={gbp(keeps)} />
            </dl>

            {job.parking && (
              <div className="mt-4 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">
                <span className="font-semibold">Parking:</span> {job.parking}
              </div>
            )}

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

              {open && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <form
                    action={rescheduleJobAction}
                    className="flex flex-wrap items-center gap-2 text-xs"
                  >
                    <input type="hidden" name="id" value={job.id} />
                    <input type="hidden" name="ref" value={job.ref} />
                    <label htmlFor="slotDate" className="text-slate-600">
                      Move to
                    </label>
                    <input
                      id="slotDate"
                      name="slotDate"
                      type="date"
                      defaultValue={job.slot_date}
                      className="rounded-lg border border-slate-300 px-2 py-1"
                    />
                    <select
                      name="slotWindow"
                      defaultValue={job.slot_window}
                      className="rounded-lg border border-slate-300 px-2 py-1"
                    >
                      <option value="am">Morning 8am–12pm</option>
                      <option value="pm">Afternoon 12pm–5pm</option>
                    </select>
                    <button
                      type="submit"
                      className="font-semibold text-primary-600 underline"
                    >
                      Move job
                    </button>
                  </form>
                  <p className="mt-2 text-xs text-slate-500">
                    Keeps the cleaner if they&apos;re free that slot, otherwise
                    re-offers it. Either way the customer gets a text.
                  </p>
                </div>
              )}

              {commissionEditable && (
                <div className="mt-4 border-t border-slate-100 pt-4 text-xs">
                  <form
                    action={setJobPriceAction}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="id" value={job.id} />
                    <input type="hidden" name="ref" value={job.ref} />
                    <label htmlFor="agreedPrice" className="text-slate-600">
                      Change the price to
                    </label>
                    <span className="text-slate-500">£</span>
                    <input
                      id="agreedPrice"
                      name="agreedPrice"
                      inputMode="decimal"
                      placeholder={(job.total_pence / 100).toFixed(2)}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-right tabular-nums"
                    />
                    <button
                      type="submit"
                      className="font-semibold text-primary-600 underline"
                    >
                      Save price
                    </button>
                  </form>
                  <p className="mt-2 text-xs text-slate-500">
                    This becomes the price. The customer is told, and so is the
                    cleaner holding it — or everyone still deciding on it.
                    Commission is reworked on the new figure.
                  </p>
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

        <Card title="Send a message" className="mt-6">
          <div className="mt-2 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {job.customer_name}
                <span className="ml-2 font-normal text-slate-500">customer</span>
              </p>
              {customerThread.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {customerThread.map((m) => (
                    <li
                      key={m.id}
                      className={`rounded-lg px-3 py-1.5 text-xs ${
                        m.direction === "in"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-primary-50 text-primary-900"
                      }`}
                    >
                      <span className="font-semibold">
                        {m.direction === "in" ? "They said" : "You sent"}:
                      </span>{" "}
                      {m.body.slice(0, 140)}
                    </li>
                  ))}
                </ul>
              )}
              {customerThread.length > 0 && (
                <p className="mt-2 text-xs">
                  <Link
                    href={`/admin/messages?job=${job.id}`}
                    className="font-semibold text-primary-600 underline"
                  >
                    Full conversation
                  </Link>
                </p>
              )}
              <form action={textCustomerAction} className="mt-3 space-y-2">
                <input type="hidden" name="jobId" value={job.id} />
                <input type="hidden" name="ref" value={job.ref} />
                <textarea
                  name="body"
                  required
                  rows={2}
                  maxLength={600}
                  placeholder={`Text ${job.customer_name.split(" ")[0]} about ${job.ref}…`}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Text customer
                </button>
              </form>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {assignedCleaner ? assignedCleaner.name : "No cleaner yet"}
                {assignedCleaner && (
                  <span className="ml-2 font-normal text-slate-500">cleaner</span>
                )}
              </p>
              {assignedCleaner && cleanerThread.length > 0 && (
                <>
                  <ul className="mt-2 space-y-1.5">
                    {cleanerThread.map((m) => (
                      <li
                        key={m.id}
                        className={`rounded-lg px-3 py-1.5 text-xs ${
                          m.direction === "in"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-primary-50 text-primary-900"
                        }`}
                      >
                        <span className="font-semibold">
                          {m.direction === "in" ? "They said" : "You sent"}:
                        </span>{" "}
                        {m.body.slice(0, 140)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">
                    <Link
                      href={`/admin/messages?cleaner=${assignedCleaner.id}`}
                      className="font-semibold text-primary-600 underline"
                    >
                      Full conversation
                    </Link>
                  </p>
                </>
              )}
              {assignedCleaner ? (
                <form action={textCleanerAction} className="mt-3 space-y-2">
                  <input type="hidden" name="cleanerId" value={assignedCleaner.id} />
                  <input type="hidden" name="ref" value={job.ref} />
                  <textarea
                    name="body"
                    required
                    rows={2}
                    maxLength={600}
                    placeholder={`Text ${assignedCleaner.name.split(" ")[0]} about ${job.ref}…`}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Text cleaner
                  </button>
                </form>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Nobody has taken this job yet, so there&apos;s no one to
                  message. Use Re-broadcast or assign someone first.
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Both go out as texts from your Fresh For Less number, and replies
            come back to{" "}
            <Link href="/admin/messages" className="font-semibold text-primary-600 underline">
              Messages
            </Link>
            .
          </p>
        </Card>

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
  value: React.ReactNode;
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
