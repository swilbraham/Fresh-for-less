import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { getCleanerAreas, listCleaners } from "@/lib/marketplace/repo";
import { setCleanerStatusAction } from "../actions";
import { AdminNav, Alert, Card, StatusPill } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cleaners",
  robots: { index: false, follow: false },
};

export default async function AdminCleanersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { error, saved } = await searchParams;

  const cleaners = await listCleaners();
  const areasByCleaner = new Map(
    await Promise.all(
      cleaners.map(
        async (cleaner) =>
          [cleaner.id, await getCleanerAreas(cleaner.id)] as const
      )
    )
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Cleaner updated.</Alert>}

        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Cleaners ({cleaners.length})
        </h1>

        {cleaners.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">
              No applications yet. Cleaners apply at <code>/pro/register</code>.
            </p>
          </Card>
        )}

        <ul className="space-y-4">
          {cleaners.map((cleaner) => {
            const areas = areasByCleaner.get(cleaner.id) ?? [];
            const insuranceExpired =
              cleaner.insurance_expiry !== null &&
              cleaner.insurance_expiry < new Date().toISOString().slice(0, 10);

            return (
              <li
                key={cleaner.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {cleaner.business_name || cleaner.name}
                      </h2>
                      <StatusPill status={cleaner.status} />
                    </div>
                    <p className="text-sm text-slate-600">
                      {cleaner.name} · {cleaner.email} · {cleaner.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Applied {cleaner.created_at} · {cleaner.jobs_done} job
                      {cleaner.jobs_done === 1 ? "" : "s"} completed
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Insurance
                    </dt>
                    <dd
                      className={
                        insuranceExpired
                          ? "font-semibold text-red-600"
                          : "text-slate-700"
                      }
                    >
                      {cleaner.insurance_provider || "Not supplied"}
                      {cleaner.insurance_expiry
                        ? ` · expires ${cleaner.insurance_expiry}`
                        : ""}
                      {insuranceExpired ? " · EXPIRED" : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Experience
                    </dt>
                    <dd className="text-slate-700">
                      {cleaner.years_experience} year
                      {cleaner.years_experience === 1 ? "" : "s"}
                      {cleaner.equipment ? ` · ${cleaner.equipment}` : ""}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Covers ({areas.length})
                    </dt>
                    <dd className="text-slate-700">
                      {areas.length ? areas.join(", ") : "No areas set"}
                    </dd>
                  </div>
                </dl>

                <form
                  action={setCleanerStatusAction}
                  className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5"
                >
                  <input type="hidden" name="id" value={cleaner.id} />
                  <div className="min-w-[240px] flex-1">
                    <label
                      htmlFor={`notes-${cleaner.id}`}
                      className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Vetting notes
                    </label>
                    <input
                      id={`notes-${cleaner.id}`}
                      name="adminNotes"
                      defaultValue={cleaner.admin_notes}
                      placeholder="Certificate seen, references checked…"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <select
                    name="status"
                    defaultValue={cleaner.status}
                    aria-label={`Status for ${cleaner.name}`}
                    className="rounded-xl border border-slate-300 px-3 py-2.5"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white"
                  >
                    Save
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
