import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { listJobs } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { cancelJobAction, rebroadcastJobAction } from "../actions";
import { AdminNav, Alert, Card, StatusPill } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs",
  robots: { index: false, follow: false },
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; offered?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { error, saved, offered } = await searchParams;

  const jobs = await listJobs();

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Job updated.</Alert>}
        {offered !== undefined && (
          <Alert tone="success">
            Re-broadcast to {offered} cleaner{offered === "1" ? "" : "s"}.
          </Alert>
        )}

        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Jobs ({jobs.length})
        </h1>

        {jobs.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              No bookings yet. Customers book at <code>/book</code>.
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ref</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Slot</th>
                  <th className="px-4 py-3 font-semibold">Cleaner</th>
                  <th className="px-4 py-3 text-right font-semibold">Value</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Commission
                  </th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {job.ref}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{job.customer_name}</p>
                      <p className="text-xs text-slate-500">
                        {job.postcode} · {job.customer_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {job.slot_date}
                      <span className="ml-1 uppercase text-xs">
                        {job.slot_window}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.cleaner_name ?? (
                        <span className="text-slate-400">
                          {job.offers} offered
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {gbp(job.total_pence)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                      {gbp(job.commission_pence)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={job.status} />
                      {job.status === "cancelled" && job.cancelled_by && (
                        <p className="mt-1 text-xs text-slate-500">
                          by {job.cancelled_by}
                          {job.late_cancellation && (
                            <span className="ml-1 font-semibold text-red-600">
                              late
                            </span>
                          )}
                        </p>
                      )}
                      {job.rescheduled_count > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                          moved {job.rescheduled_count}×
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {(job.status === "unfilled" ||
                          job.status === "cancelled") && (
                          <form action={rebroadcastJobAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className="text-xs font-semibold text-primary-600 underline"
                            >
                              Re-broadcast
                            </button>
                          </form>
                        )}
                        {["offered", "accepted", "unfilled"].includes(
                          job.status
                        ) && (
                          <form action={cancelJobAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className="text-xs font-semibold text-red-600 underline"
                            >
                              Cancel
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
