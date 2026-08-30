import Link from "next/link";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  getAdminStats,
  getSettings,
  listCoverageDemand,
  listNotifications,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { adminLoginAction, adminLogoutAction } from "./actions";
import { Alert, Card } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (!(await isAdmin())) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
        <div className="w-full max-w-sm">
          {error && <Alert>{error}</Alert>}
          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <h1 className="text-xl font-bold text-slate-900">
              Marketplace admin
            </h1>
            <form action={adminLoginAction} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoFocus
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const [stats, settings, notifications, demand] = await Promise.all([
    getAdminStats(),
    getSettings(),
    listNotifications(12),
    listCoverageDemand(12),
  ]);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Awaiting vetting"
            value={String(stats.cleaners_pending)}
            href="/admin/cleaners"
            highlight={stats.cleaners_pending > 0}
          />
          <Stat
            label="Active cleaners"
            value={String(stats.cleaners_approved)}
            href="/admin/cleaners"
          />
          <Stat
            label="Live jobs"
            value={String(stats.jobs_live)}
            href="/admin/jobs"
          />
          <Stat
            label="Unfilled jobs"
            value={String(stats.jobs_unfilled)}
            href="/admin/jobs"
            highlight={stats.jobs_unfilled > 0}
          />
          <Stat
            label="Jobs completed"
            value={String(stats.jobs_completed)}
          />
          <Stat
            label="Customer spend"
            value={gbp(stats.gmv_pence)}
            href="/admin/finances"
          />
          <Stat
            label={`Commission earned (${Number(settings.commission_pct)}%)`}
            value={gbp(stats.commission_pence)}
            href="/admin/finances"
          />
          <Stat
            label="Invoiced, unpaid"
            value={gbp(stats.commission_unpaid_pence)}
            href="/admin/invoices"
          />
        </div>

        {demand.length > 0 && (
          <Card
            title="Where to recruit next"
            description="Customers who tried to book somewhere you have no cleaner. Ranked by demand — each one is also a lead worth calling back."
            className="mt-8"
          >
            <ul className="mt-4 flex flex-wrap gap-2">
              {demand.map((area) => (
                <li
                  key={area.outward}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
                >
                  <span className="font-bold text-amber-900">{area.outward}</span>
                  <span className="ml-2 text-amber-800">
                    {area.requests} request{area.requests === 1 ? "" : "s"}
                  </span>
                  <span className="ml-2 text-xs text-amber-700">
                    latest {area.latest}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card
          title="Notification log"
          description="Every message the platform generated, to cleaners and customers. Texts need the TWILIO_* variables set; emails need RESEND_API_KEY and MARKETPLACE_FROM_EMAIL. Anything marked as logged only was recorded but not delivered."
          className="mt-8"
        >
          {notifications.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nothing sent yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">When</th>
                    <th className="py-2 font-semibold">Channel</th>
                    <th className="py-2 font-semibold">To</th>
                    <th className="py-2 font-semibold">Subject</th>
                    <th className="py-2 font-semibold">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((note) => (
                    <tr key={note.id}>
                      <td className="py-2 whitespace-nowrap text-slate-500">
                        {note.created_at}
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">
                          {note.channel}
                        </span>
                      </td>
                      <td className="py-2 text-slate-700">{note.recipient}</td>
                      <td className="py-2 text-slate-700">{note.subject}</td>
                      <td className="py-2 text-slate-500">
                        {note.sent_at
                          ? "sent"
                          : note.error
                            ? `failed: ${note.error.slice(0, 60)}`
                            : "logged only"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Download your data"
          description="Your own copy, in a format a spreadsheet or accountant can read. Worth doing monthly — these files contain customer names, addresses and phone numbers, so keep them somewhere private."
          className="mt-8"
        >
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { type: "finance", label: "Finance by month" },
              { type: "jobs", label: "Jobs" },
              { type: "cleaners", label: "Cleaners" },
              { type: "invoices", label: "Commission invoices" },
            ].map((item) => (
              <a
                key={item.type}
                href={`/admin/export?type=${item.type}`}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {item.label} (CSV)
              </a>
            ))}
          </div>
        </Card>

        <form action={adminLogoutAction} className="mt-8">
          <button
            type="submit"
            className="text-sm font-semibold text-slate-500 underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string;
  href?: string;
  highlight?: boolean;
}) {
  const body = (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        highlight
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white hover:border-primary-300"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
