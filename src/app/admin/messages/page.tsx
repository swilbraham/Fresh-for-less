import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getCleanerThread,
  getCustomerThread,
  listCleaners,
  listCustomerThreads,
  listInboundSms,
} from "@/lib/marketplace/repo";
import { Card } from "@/components/marketplace/shell";
import { textCleanerAction, textCustomerAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

function when(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    cleaner?: string;
    job?: string;
    error?: string;
    sent?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { cleaner: cleanerParam, job: jobParam, error, sent } = await searchParams;

  const [cleaners, customers, inbound] = await Promise.all([
    listCleaners("approved"),
    listCustomerThreads(40),
    listInboundSms(30),
  ]);

  // A ?job= in the URL means a customer thread; otherwise show cleaners.
  const customerMode = Boolean(jobParam);
  const jobId = Number(jobParam) || 0;
  const customer = customers.find((c) => c.job_id === jobId) ?? null;

  const selectedId = customerMode ? 0 : Number(cleanerParam) || cleaners[0]?.id || 0;
  const selected = customerMode
    ? null
    : cleaners.find((c) => c.id === selectedId) ?? null;

  const thread = customerMode
    ? jobId
      ? await getCustomerThread(jobId)
      : []
    : selected
      ? await getCleanerThread(selected.id)
      : [];

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      <p className="mt-1 text-sm text-slate-500">
        Text a cleaner directly. Their replies come back to the same thread and
        you get a text when one arrives.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {sent && (
        <p className="mt-4 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
          Text sent.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="min-w-0">
          <div className="mb-3 flex rounded-xl border border-slate-200 bg-white p-1 text-sm">
            <Link
              href="/admin/messages"
              className={`flex-1 rounded-lg px-3 py-1.5 text-center ${
                customerMode
                  ? "text-slate-600 hover:text-slate-900"
                  : "bg-primary-600 font-semibold text-white"
              }`}
            >
              Cleaners
            </Link>
            <Link
              href={
                customers[0]
                  ? `/admin/messages?job=${customers[0].job_id}`
                  : "/admin/messages?job=0"
              }
              className={`flex-1 rounded-lg px-3 py-1.5 text-center ${
                customerMode
                  ? "bg-primary-600 font-semibold text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Customers
            </Link>
          </div>

          <Card title={customerMode ? "Recent customers" : "Cleaners"}>
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {!customerMode &&
                cleaners.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/messages?cleaner=${c.id}`}
                      className={`block px-1 py-2 ${
                        c.id === selectedId
                          ? "font-semibold text-primary-700"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {c.name}
                      <span className="block text-xs font-normal text-slate-400">
                        {c.business_name || c.phone}
                      </span>
                    </Link>
                  </li>
                ))}
              {!customerMode && cleaners.length === 0 && (
                <li className="py-2 text-slate-500">No approved cleaners yet.</li>
              )}

              {customerMode &&
                customers.map((c) => (
                  <li key={c.job_id}>
                    <Link
                      href={`/admin/messages?job=${c.job_id}`}
                      className={`block px-1 py-2 ${
                        c.job_id === jobId
                          ? "font-semibold text-primary-700"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {c.customer_name}
                      {c.replies > 0 && (
                        <span className="ml-2 rounded-full bg-accent-100 px-1.5 text-[11px] font-semibold text-accent-700">
                          {c.replies}
                        </span>
                      )}
                      <span className="block text-xs font-normal text-slate-400">
                        {c.ref} · {c.slot_date}
                      </span>
                    </Link>
                  </li>
                ))}
              {customerMode && customers.length === 0 && (
                <li className="py-2 text-slate-500">No bookings yet.</li>
              )}
            </ul>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          {customerMode && customer ? (
            <Card
              title={`${customer.customer_name} — ${customer.customer_phone}`}
            >
              <p className="-mt-1 text-xs text-slate-500">
                <Link
                  href={`/admin/jobs/${customer.ref}`}
                  className="font-semibold text-primary-600 underline"
                >
                  {customer.ref}
                </Link>{" "}
                · {customer.slot_date} · {customer.status}
              </p>
              <div className="mt-3 max-h-[420px] space-y-3 overflow-y-auto">
                {thread.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Nothing sent to {customer.customer_name} yet.
                  </p>
                )}
                {thread.map((m) => {
                  const inboundMsg = m.direction === "in";
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        inboundMsg
                          ? "bg-slate-100 text-slate-800"
                          : "ml-auto bg-primary-600 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          inboundMsg ? "text-slate-500" : "text-primary-100"
                        }`}
                      >
                        {when(m.created_at)}
                        {!inboundMsg && !m.sent_at && !m.error && " · logged only"}
                        {!inboundMsg && m.error && " · failed"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <form action={textCustomerAction} className="mt-4 flex gap-2">
                <input type="hidden" name="jobId" value={customer.job_id} />
                <textarea
                  name="body"
                  required
                  rows={2}
                  maxLength={600}
                  placeholder={`Text ${customer.customer_name}…`}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="self-end rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white"
                >
                  Send
                </button>
              </form>
              <p className="mt-2 text-xs text-slate-500">
                Sent as Fresh For Less. Don&apos;t give out the cleaner&apos;s
                number — replies come back here.
              </p>
            </Card>
          ) : selected ? (
            <Card title={`${selected.name} — ${selected.phone}`}>
              <div className="mt-3 max-h-[420px] space-y-3 overflow-y-auto">
                {thread.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Nothing sent to {selected.name} yet.
                  </p>
                )}
                {thread.map((m) => {
                  const inboundMsg = m.direction === "in";
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        inboundMsg
                          ? "bg-slate-100 text-slate-800"
                          : "ml-auto bg-primary-600 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          inboundMsg ? "text-slate-500" : "text-primary-100"
                        }`}
                      >
                        {when(m.created_at)}
                        {!inboundMsg && !m.sent_at && !m.error && " · logged only"}
                        {!inboundMsg && m.error && " · failed"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <form action={textCleanerAction} className="mt-4 flex gap-2">
                <input type="hidden" name="cleanerId" value={selected.id} />
                <textarea
                  name="body"
                  required
                  rows={2}
                  maxLength={600}
                  placeholder={`Text ${selected.name}…`}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="self-end rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white"
                >
                  Send
                </button>
              </form>
            </Card>
          ) : (
            <Card title={customerMode ? "No customer selected" : "No cleaner selected"}>
              <p className="mt-2 text-sm text-slate-500">
                {customerMode
                  ? "Pick a booking on the left to text that customer."
                  : "Approve a cleaner first and they'll appear here."}
              </p>
            </Card>
          )}

          <Card title="Recent replies">
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {inbound.map((m) => (
                <li key={m.id} className="py-2">
                  <p className="font-semibold text-slate-800">{m.subject}</p>
                  <p className="text-slate-600">{m.body}</p>
                  <p className="text-xs text-slate-400">
                    {m.recipient} · {when(m.created_at)}
                  </p>
                </li>
              ))}
              {inbound.length === 0 && (
                <li className="py-2 text-slate-500">
                  No replies yet. They appear here once the Twilio webhook is
                  pointed at this site.
                </li>
              )}
            </ul>
          </Card>
        </div>
        </div>
      </div>
    </main>
  );
}
