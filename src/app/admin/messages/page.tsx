import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getCleanerThread,
  getCustomerThread,
  listCleanerActiveJobs,
  listCleanerActivity,
  listCleaners,
  listCustomerThreads,
  listInboundSmsResolved,
} from "@/lib/marketplace/repo";
import { Card } from "@/components/marketplace/shell";
import {
  textAllCleanersAction,
  textAreaCleanersAction,
  textCleanerAction,
  textCustomerAction,
} from "../actions";

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

/** "2h ago" / "3d ago" — enough to order a sidebar by eye. */
function ago(value: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    cleaner?: string;
    job?: string;
    error?: string;
    sent?: string;
    broadcast?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const {
    cleaner: cleanerParam,
    job: jobParam,
    error,
    sent,
    broadcast,
  } = await searchParams;

  const [cleaners, customers, inbound, activity] = await Promise.all([
    listCleaners("approved"),
    listCustomerThreads(40),
    listInboundSmsResolved(30),
    listCleanerActivity(),
  ]);

  // Who spoke last, most recently, floats to the top of the sidebar.
  const byActivity = [...cleaners].sort((a, b) => {
    const at = activity.get(a.id)?.last_at ?? "";
    const bt = activity.get(b.id)?.last_at ?? "";
    if (at !== bt) return at < bt ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  // A ?job= in the URL means a customer thread; otherwise show cleaners.
  const customerMode = Boolean(jobParam);
  const jobId = Number(jobParam) || 0;
  const customer = customers.find((c) => c.job_id === jobId) ?? null;

  const selectedId = customerMode ? 0 : Number(cleanerParam) || cleaners[0]?.id || 0;
  const selected = customerMode
    ? null
    : cleaners.find((c) => c.id === selectedId) ?? null;

  const [thread, activeJobs] = await Promise.all([
    customerMode
      ? jobId
        ? getCustomerThread(jobId)
        : Promise.resolve([])
      : selected
        ? getCleanerThread(selected.id)
        : Promise.resolve([]),
    !customerMode && selected
      ? listCleanerActiveJobs(selected.id)
      : Promise.resolve([]),
  ]);

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
      {broadcast && (
        <p className="mt-4 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
          {broadcast}
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
                byActivity.map((c) => {
                  const act = activity.get(c.id);
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/admin/messages?cleaner=${c.id}`}
                        className={`block px-1 py-2 ${
                          c.id === selectedId
                            ? "font-semibold text-primary-700"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span>{c.name}</span>
                          {act && act.inbound > 0 && (
                            <span className="rounded-full bg-accent-100 px-1.5 text-[11px] font-semibold text-accent-700">
                              {act.inbound}
                            </span>
                          )}
                        </span>
                        <span className="block text-xs font-normal text-slate-400">
                          {act
                            ? `${act.last_direction === "in" ? "↩ replied" : "sent"} ${ago(act.last_at)}`
                            : c.business_name || c.phone}
                        </span>
                      </Link>
                    </li>
                  );
                })}
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
              {activeJobs.length > 0 && (
                <p className="-mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Holding:</span>
                  {activeJobs.map((job) => (
                    <Link
                      key={job.ref}
                      href={`/admin/jobs/${job.ref}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-semibold text-primary-700 hover:bg-primary-50"
                    >
                      {job.ref} · {job.postcode} · {job.slot_date}{" "}
                      {job.slot_window === "am" ? "AM" : "PM"}
                    </Link>
                  ))}
                </p>
              )}
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

          <Card title="Recent replies — who said what">
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {inbound.map((m) => (
                <li key={m.id} className="py-2">
                  <p className="flex flex-wrap items-center gap-2">
                    {m.cleaner_id ? (
                      <>
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-800">
                          Cleaner
                        </span>
                        <Link
                          href={`/admin/messages?cleaner=${m.cleaner_id}`}
                          className="font-semibold text-primary-700 underline"
                        >
                          {m.cleaner_name}
                        </Link>
                      </>
                    ) : m.job_id ? (
                      <>
                        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-800">
                          Customer
                        </span>
                        <Link
                          href={`/admin/messages?job=${m.job_id}`}
                          className="font-semibold text-primary-700 underline"
                        >
                          {m.customer_name}
                        </Link>
                        {m.job_ref && (
                          <Link
                            href={`/admin/jobs/${m.job_ref}`}
                            className="text-xs font-semibold text-slate-500 underline"
                          >
                            {m.job_ref}
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          Unknown
                        </span>
                        <a
                          href={`tel:${m.recipient}`}
                          className="font-semibold text-slate-700 underline"
                        >
                          {m.recipient}
                        </a>
                      </>
                    )}
                    <span className="ml-auto text-xs text-slate-400">
                      {when(m.created_at)}
                    </span>
                  </p>
                  <p className="mt-1 text-slate-600">{m.body}</p>
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

      <div className="mt-8 space-y-6">
      <Card title="Ask everyone covering an area" className="mt-6">
        <p className="mt-1 text-sm text-slate-500">
          Texts every approved cleaner covering the area(s) at once — handy for
          &ldquo;can anyone do 3 rooms in CH41 on Friday?&rdquo; before booking
          a job in. Replies come back to each cleaner&apos;s own thread below.
        </p>
        <form
          action={textAreaCleanersAction}
          className="mt-3 flex flex-wrap items-end gap-2"
        >
          <label className="flex-none text-sm text-slate-600">
            Area(s)
            <input
              name="areas"
              required
              placeholder="CH41, L4"
              className="mt-1 block w-36 rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase"
            />
          </label>
          <label className="min-w-[240px] flex-1 text-sm text-slate-600">
            Message
            <textarea
              name="body"
              required
              rows={2}
              maxLength={600}
              placeholder="Can anyone take 3 rooms + stairs in CH41 this Friday AM? Reply here if you can."
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Send to all
          </button>
        </form>
      </Card>

      <Card title="Tell every cleaner something" className="mt-6">
        <p className="mt-1 text-sm text-slate-500">
          Texts every approved cleaner on the network, whatever area they
          cover. For announcements — a change to the terms, a price change,
          a shutdown over Christmas. Replies come back to each cleaner&apos;s
          own thread below.
        </p>
        <form action={textAllCleanersAction} className="mt-3 space-y-3">
          <label className="block text-sm text-slate-600">
            Message
            <textarea
              name="body"
              required
              rows={4}
              maxLength={600}
              placeholder="Write it in full — this goes to everybody and there is no undo."
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex-none text-sm text-slate-600">
              Type SEND to confirm
              <input
                name="confirm"
                required
                placeholder="SEND"
                autoComplete="off"
                className="mt-1 block w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
            >
              Text everyone
            </button>
          </div>
        </form>
      </Card>
      </div>
      </div>
    </main>
  );
}
