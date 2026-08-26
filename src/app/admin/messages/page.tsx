import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getCleanerThread,
  listCleaners,
  listInboundSms,
} from "@/lib/marketplace/repo";
import { Card } from "@/components/marketplace/shell";
import { textCleanerAction } from "../actions";

export const dynamic = "force-dynamic";

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
  searchParams: Promise<{ cleaner?: string; error?: string; sent?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { cleaner: cleanerParam, error, sent } = await searchParams;

  const [cleaners, inbound] = await Promise.all([
    listCleaners("approved"),
    listInboundSms(30),
  ]);

  const selectedId = Number(cleanerParam) || cleaners[0]?.id || 0;
  const selected = cleaners.find((c) => c.id === selectedId) ?? null;
  const thread = selected ? await getCleanerThread(selected.id) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
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
          <Card title="Cleaners">
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {cleaners.map((c) => (
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
              {cleaners.length === 0 && (
                <li className="py-2 text-slate-500">No approved cleaners yet.</li>
              )}
            </ul>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          {selected ? (
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
            <Card title="No cleaner selected">
              <p className="mt-2 text-sm text-slate-500">
                Approve a cleaner first and they&apos;ll appear here.
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
    </main>
  );
}
