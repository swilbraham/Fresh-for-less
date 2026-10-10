import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  cleanerReliability,
  DROP_REVIEW_DAYS,
  DROP_REVIEW_LIMIT,
  getAllCleanerAreas,
  getAvailability,
  getPreferredAreas,
  listCleaners,
} from "@/lib/marketplace/repo";
import {
  createCleanerAction,
  issueResetLinkAction,
  setPreferredAreasAction,
  setCleanerPausedAction,
  setCleanerStatusAction,
  updateCleanerAction,
  updateCleanerCoverageAction,
} from "../actions";
import {
  Alert,
  AvailabilityGrid,
  Card,
  Field,
  StatusPill,
} from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cleaners",
  robots: { index: false, follow: false },
};

export default async function AdminCleanersPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    paused?: string;
    saved?: string;
    reset?: string;
    q?: string;
    sort?: string;
    status?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { error, saved, reset, q, sort, status, paused } = await searchParams;

  const [all, areasByCleaner] = await Promise.all([
    listCleaners(),
    getAllCleanerAreas(),
  ]);

  const term = (q ?? "").trim().toLowerCase();
  const sortKey = sort ?? "name";

  // A search that looks like a postcode area ("CH41", or "SA" for the lot)
  // also matches coverage, so you can see who covers a postcode.
  const outwardTerm = /^[a-z]{1,2}\d{0,2}$/.test(term)
    ? term.toUpperCase()
    : null;

  const matches = all.filter((c) => {
    if (status && c.status !== status) return false;
    if (!term) return true;
    if (
      outwardTerm &&
      (areasByCleaner.get(c.id) ?? []).some((area) =>
        area.startsWith(outwardTerm)
      )
    )
      return true;
    return [c.name, c.business_name, c.email, c.phone]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(term));
  });

  const byName = (a: string, b: string) =>
    a.localeCompare(b, "en-GB", { sensitivity: "base" });

  const cleaners = [...matches].sort((a, b) => {
    switch (sortKey) {
      case "business":
        return byName(a.business_name || a.name, b.business_name || b.name);
      case "newest":
        return b.created_at.localeCompare(a.created_at);
      case "oldest":
        return a.created_at.localeCompare(b.created_at);
      case "jobs":
        return b.jobs_done - a.jobs_done || byName(a.name, b.name);
      case "areas":
        return b.areas - a.areas || byName(a.name, b.name);
      case "status":
        return byName(a.status, b.status) || byName(a.name, b.name);
      default:
        return byName(a.name, b.name);
    }
  });

  // Only the cleaners actually on screen need their detail loaded — these are
  // two queries each, so fetching for the whole list would be wasted work.
  const reliabilityByCleaner = new Map(
    await Promise.all(
      cleaners.map(
        async (cleaner) =>
          [cleaner.id, await cleanerReliability(cleaner.id)] as const
      )
    )
  );
  const availabilityByCleaner = new Map(
    await Promise.all(
      cleaners.map(
        async (cleaner) =>
          [cleaner.id, await getAvailability(cleaner.id)] as const
      )
    )
  );
  const preferredByCleaner = new Map(
    await Promise.all(
      cleaners.map(
        async (cleaner) =>
          [cleaner.id, await getPreferredAreas(cleaner.id)] as const
      )
    )
  );

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Cleaner updated.</Alert>}
        {paused === "1" && (
          <Alert tone="info">
            Paused — they&apos;ll get no offers or texts until you resume them.
          </Alert>
        )}
        {paused === "0" && (
          <Alert tone="success">Back on — offers and texts resume now.</Alert>
        )}
        {reset && (
          <Alert tone="info">
            <strong>One-time reset link — text this to them.</strong> It works
            once and expires in 48 hours.
            <span className="mt-2 block break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-700">
              {reset}
            </span>
          </Alert>
        )}

        <h1 className="mb-4 text-2xl font-bold text-slate-900">
          Cleaners{" "}
          <span className="font-normal text-slate-400">
            ({cleaners.length === all.length
              ? cleaners.length
              : `${cleaners.length} of ${all.length}`})
          </span>
        </h1>

        <details className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-primary-700">
            + Add a cleaner
          </summary>
          <p className="mt-2 text-sm text-slate-500">
            They land approved with coverage set, and get a text with a link to
            choose their own password (the link also appears here in case the
            text doesn&apos;t arrive). Availability starts as every half-day —
            they can trim it on their dashboard, or you can on their card.
          </p>
          <form
            action={createCleanerAction}
            className="mt-3 grid gap-3 sm:grid-cols-2"
          >
            <label className="text-sm">
              <span className="block font-semibold text-slate-700">Name</span>
              <input
                name="name"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="block font-semibold text-slate-700">
                Business name <span className="font-normal text-slate-400">(optional)</span>
              </span>
              <input
                name="businessName"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="block font-semibold text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="block font-semibold text-slate-700">Mobile</span>
              <input
                name="phone"
                required
                placeholder="07…"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="block font-semibold text-slate-700">
                Postcode areas they cover
              </span>
              <textarea
                name="coverage"
                required
                rows={2}
                placeholder="CH41 CH42 L1 L2 — commas, spaces or new lines"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 uppercase"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="block font-semibold text-slate-700">
                Insurance provider <span className="font-normal text-slate-400">(optional, can be added later)</span>
              </span>
              <input
                name="insuranceProvider"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Add cleaner &amp; text them their set-up link
              </button>
            </div>
          </form>
        </details>

        {/* A GET form so a filtered view is a shareable, reloadable URL. */}
        <form
          method="GET"
          className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <label className="min-w-[200px] flex-1 text-sm">
            <span className="block font-semibold text-slate-700">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Name, business, email, phone or postcode (e.g. CH41)"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="block font-semibold text-slate-700">Status</span>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="block font-semibold text-slate-700">Sort by</span>
            <select
              name="sort"
              defaultValue={sortKey}
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="name">Name (A–Z)</option>
              <option value="business">Business name (A–Z)</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="jobs">Most jobs done</option>
              <option value="areas">Most areas covered</option>
              <option value="status">Status</option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Apply
          </button>
          {(term || status || (sort && sort !== "name")) && (
            <Link
              href="/admin/cleaners"
              className="py-2 text-sm font-semibold text-slate-600 underline"
            >
              Clear
            </Link>
          )}
        </form>

        {all.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">
              No applications yet. Cleaners apply at <code>/pro/register</code>.
            </p>
          </Card>
        )}

        {all.length > 0 && cleaners.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">
              No cleaner matches that search.{" "}
              <Link href="/admin/cleaners" className="font-semibold text-primary-600 underline">
                Clear it
              </Link>{" "}
              to see all {all.length}.
            </p>
          </Card>
        )}

        <ul className="space-y-4">
          {cleaners.map((cleaner) => {
            const areas = areasByCleaner.get(cleaner.id) ?? [];
            const record = reliabilityByCleaner.get(cleaner.id);
            const underReview =
              (record?.recent_late_drops ?? 0) >= DROP_REVIEW_LIMIT;
            const insuranceExpired =
              cleaner.insurance_expiry !== null &&
              cleaner.insurance_expiry < new Date().toISOString().slice(0, 10);

            return (
              <li
                key={cleaner.id}
                id={`cleaner-${cleaner.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {cleaner.business_name || cleaner.name}
                      </h2>
                      <StatusPill status={cleaner.status} />
                      {cleaner.paused_at && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          Paused since {cleaner.paused_at.slice(0, 10)}
                        </span>
                      )}
                      {underReview && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Review — {record?.recent_late_drops} late drops
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {cleaner.name} · {cleaner.email} · {cleaner.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      <Link
                        href={`/admin/jobs?q=${encodeURIComponent(cleaner.name)}`}
                        className="font-semibold text-primary-600 underline"
                      >
                        View their jobs
                      </Link>{" "}
                      · Applied {cleaner.created_at} · {cleaner.jobs_done} job
                      {cleaner.jobs_done === 1 ? "" : "s"} completed
                    </p>
                    {(preferredByCleaner.get(cleaner.id) ?? []).length > 0 && (
                      <p className="mt-2 text-xs">
                        <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-900">
                          First refusal:{" "}
                          {(preferredByCleaner.get(cleaner.id) ?? []).length}{" "}
                          district
                          {(preferredByCleaner.get(cleaner.id) ?? []).length === 1
                            ? ""
                            : "s"}{" "}
                          · {cleaner.first_refusal_hours || 2}h head start
                        </span>
                        <span className="mt-1 block break-words font-mono text-[11px] text-amber-800">
                          {(preferredByCleaner.get(cleaner.id) ?? []).join(" ")}
                        </span>
                      </p>
                    )}
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
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reliability
                    </dt>
                    <dd
                      className={
                        underReview ? "font-semibold text-red-600" : "text-slate-700"
                      }
                    >
                      {record?.completed ?? 0} completed ·{" "}
                      {record?.drops ?? 0} handed back
                      {(record?.late_drops ?? 0) > 0 &&
                        `, ${record?.late_drops} inside 24h`}
                      {underReview &&
                        ` — ${record?.recent_late_drops} in the last ${DROP_REVIEW_DAYS} days`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Covers ({areas.length})
                    </dt>
                    <dd className="text-slate-700">
                      {areas.length ? areas.join(", ") : "No areas set"}
                    </dd>
                  </div>
                </dl>

                <details className="mt-4 border-t border-slate-100 pt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-primary-600">
                    Edit details, coverage or password
                  </summary>

                  <form action={updateCleanerAction} className="mt-4 space-y-4">
                    <input type="hidden" name="id" value={cleaner.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Name" name="name" required defaultValue={cleaner.name} />
                      <Field
                        label="Trading name"
                        name="businessName"
                        defaultValue={cleaner.business_name}
                      />
                      <Field label="Email" name="email" type="email" required defaultValue={cleaner.email} />
                      <Field label="Mobile" name="phone" type="tel" required defaultValue={cleaner.phone} />
                      <Field
                        label="Insurance provider"
                        name="insuranceProvider"
                        defaultValue={cleaner.insurance_provider}
                      />
                      <Field
                        label="Policy expiry"
                        name="insuranceExpiry"
                        type="date"
                        defaultValue={cleaner.insurance_expiry ?? ""}
                      />
                      <Field
                        label="VAT number"
                        name="vatNumber"
                        defaultValue={cleaner.vat_number}
                        placeholder="GB123456789"
                      />
                      <label className="flex items-start gap-2 text-sm sm:col-span-2">
                        <input
                          type="checkbox"
                          name="vatRegistered"
                          defaultChecked={cleaner.vat_registered}
                          className="mt-1 h-4 w-4 rounded border-slate-300 accent-accent-600"
                        />
                        <span>
                          <span className="font-semibold text-slate-900">
                            VAT registered
                          </span>
                          <span className="block text-xs text-slate-500">
                            Commission is charged on what they keep after VAT,
                            not the customer&apos;s price. Verify their number
                            before ticking this — it lowers what they pay you.
                          </span>
                        </span>
                      </label>
                      <Field
                        label="Years of experience"
                        name="yearsExperience"
                        type="number"
                        defaultValue={cleaner.years_experience}
                      />
                      <Field
                        label="Equipment"
                        name="equipment"
                        defaultValue={cleaner.equipment}
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white"
                    >
                      Save details
                    </button>
                  </form>

                  <form
                    action={updateCleanerCoverageAction}
                    className="mt-6 space-y-4 border-t border-slate-100 pt-6"
                  >
                    <input type="hidden" name="id" value={cleaner.id} />
                    <label
                      htmlFor={`coverage-${cleaner.id}`}
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Postcode areas covered
                    </label>
                    <p className="-mt-2 text-xs text-slate-500">
                      Commas, spaces or new lines. Full postcodes are fine —
                      only the first part is kept.
                    </p>
                    <textarea
                      id={`coverage-${cleaner.id}`}
                      name="coverage"
                      rows={2}
                      defaultValue={areas.join(", ")}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 uppercase tracking-wide"
                    />
                    <AvailabilityGrid
                      availability={availabilityByCleaner.get(cleaner.id) ?? []}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white"
                    >
                      Save coverage &amp; availability
                    </button>
                  </form>

                  <form
                    action={setPreferredAreasAction}
                    className="mt-6 space-y-3 border-t border-slate-100 pt-6"
                  >
                    <input type="hidden" name="id" value={cleaner.id} />
                    <label
                      htmlFor={`preferred-${cleaner.id}`}
                      className="block text-sm font-semibold text-slate-700"
                    >
                      First refusal patch
                    </label>
                    <p className="-mt-1 text-xs text-slate-500">
                      Every new online booking in these districts is held for
                      this company alone before anyone else hears about it.
                      One company per district — a clash is refused by name.
                      Leave empty for none.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name="useCoverage"
                        className="h-4 w-4 rounded border-slate-300 accent-amber-600"
                      />
                      Everything they cover ({areas.length} district
                      {areas.length === 1 ? "" : "s"}) — ignores the box below
                    </label>
                    <textarea
                      id={`preferred-${cleaner.id}`}
                      name="preferredAreas"
                      rows={2}
                      defaultValue={(preferredByCleaner.get(cleaner.id) ?? []).join(", ")}
                      placeholder="CH41 CH42 — or tick the box above to use their coverage"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 uppercase tracking-wide"
                    />
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="text-xs font-semibold text-slate-600">
                        Head start
                        <select
                          name="hours"
                          defaultValue={String(cleaner.first_refusal_hours || 2)}
                          className="mt-1 block rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal"
                        >
                          <option value="1">1 hour</option>
                          <option value="2">2 hours</option>
                          <option value="4">4 hours</option>
                          <option value="8">8 hours</option>
                          <option value="24">24 hours</option>
                        </select>
                      </label>
                      <button
                        type="submit"
                        className="rounded-xl bg-amber-600 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-700"
                      >
                        Save first refusal
                      </button>
                    </div>
                  </form>

                  <form
                    action={issueResetLinkAction}
                    className="mt-6 border-t border-slate-100 pt-6"
                  >
                    <input type="hidden" name="id" value={cleaner.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Issue password reset link
                    </button>
                    <p className="mt-2 text-xs text-slate-500">
                      Generates a one-time link to text them. Their current
                      password keeps working until they use it.
                    </p>
                  </form>
                </details>

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

                {cleaner.status === "approved" && (
                  <form action={setCleanerPausedAction} className="mt-4">
                    <input type="hidden" name="id" value={cleaner.id} />
                    <input
                      type="hidden"
                      name="paused"
                      value={cleaner.paused_at ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      {cleaner.paused_at ? "Resume offers & texts" : "Pause offers & texts"}
                    </button>
                    <p className="mt-2 text-xs text-slate-500">
                      {cleaner.paused_at
                        ? "They're getting nothing at the moment — no job offers, no texts. Jobs they already accepted are unaffected."
                        : "Holiday, van off the road, or just too busy. Stops job offers and the texts that carry them; their account, areas and history stay exactly as they are, and work they've already accepted still goes ahead."}
                    </p>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
