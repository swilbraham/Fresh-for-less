import { redirect } from "next/navigation";
import { currentCleaner } from "@/lib/marketplace/auth";
import {
  getAvailability,
  getBlackouts,
  getCleanerAreas,
} from "@/lib/marketplace/repo";
import {
  addBlackoutAction,
  changePasswordAction,
  removeBlackoutAction,
  saveCoverageAction,
  updateProfileAction,
} from "../actions";
import {
  Alert,
  AvailabilityGrid,
  Card,
  Field,
  ProNav,
} from "@/components/marketplace/shell";
import { isMobile } from "@/lib/marketplace/phone";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Coverage & diary",
  robots: { index: false },
};

export default async function CoveragePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const cleaner = await currentCleaner();
  if (!cleaner) redirect("/pro?next=/pro/coverage");

  const { error, saved } = await searchParams;
  const mobileOk = isMobile(cleaner.phone);
  const [areas, availability, blackouts] = await Promise.all([
    getCleanerAreas(cleaner.id),
    getAvailability(cleaner.id),
    getBlackouts(cleaner.id),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <ProNav name={cleaner.name} />

      <div className="mx-auto max-w-3xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Saved.</Alert>}

        <Card
          title="Your details"
          description="Keep your mobile up to date — it's where job offers are texted."
          className="mb-6"
        >
          <form action={updateProfileAction} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" name="name" required defaultValue={cleaner.name} />
              <Field
                label="Trading name"
                name="businessName"
                defaultValue={cleaner.business_name}
              />
              <Field label="Email" name="email" type="email" required defaultValue={cleaner.email} />
              <Field label="Mobile" name="phone" type="tel" required defaultValue={cleaner.phone} />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-6 py-2.5 font-semibold text-white transition hover:bg-primary-700"
            >
              Save my details
            </button>
          </form>
        </Card>

        <Card title="Change your password" className="mb-6">
          <form action={changePasswordAction} className="mt-4 space-y-4">
            <Field
              label="Current password"
              name="currentPassword"
              type="password"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="New password"
                name="newPassword"
                type="password"
                required
                hint="At least 8 characters."
              />
              <Field
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Change password
            </button>
          </form>
        </Card>

        <form action={saveCoverageAction} className="space-y-6">
          <Card
            title="Postcode areas you cover"
            description="Just the first part of the postcode — separate them with spaces or commas. Jobs outside these areas will never reach you."
          >
            <textarea
              name="coverage"
              rows={4}
              defaultValue={areas.join(" ")}
              placeholder="CH41 CH42 CH43 L1 L2"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase placeholder:normal-case tracking-wide outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              Currently covering {areas.length} area
              {areas.length === 1 ? "" : "s"}.
            </p>
          </Card>

          <Card
            title="How we reach you"
            description="Job offers go to the email and mobile you registered with. Texts arrive fastest — jobs are first-to-accept, so turning them off will cost you work."
          >
            <div className="mt-4 space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="notifySms"
                  defaultChecked={cleaner.notify_sms}
                  className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-primary-600"
                />
                <span>
                  <span className="block font-semibold text-slate-800">
                    Text me new jobs
                  </span>
                  <span className="block text-sm text-slate-500">
                    Sent to {cleaner.phone}
                    {mobileOk ? "" : " — this doesn't look like a UK mobile, so texts can't be delivered"}
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="notifyEmail"
                  defaultChecked={cleaner.notify_email}
                  className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-primary-600"
                />
                <span>
                  <span className="block font-semibold text-slate-800">
                    Email me new jobs
                  </span>
                  <span className="block text-sm text-slate-500">
                    Sent to {cleaner.email}
                  </span>
                </span>
              </label>
            </div>
          </Card>

          <Card
            title="Your working week"
            description="Untick a half-day and you'll stop being offered jobs in that slot."
          >
            <AvailabilityGrid availability={availability} />
          </Card>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Save coverage &amp; availability
          </button>
        </form>

        <Card
          title="Days off"
          description="Block out individual dates — holidays, other work, anything. You won't be offered jobs on these days."
          className="mt-6"
        >
          <form action={addBlackoutAction} className="mt-4 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="day" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From
                </label>
                <input
                  id="day"
                  type="date"
                  name="day"
                  required
                  className="mt-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="toDay" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To (optional)
                </label>
                <input
                  id="toDay"
                  type="date"
                  name="toDay"
                  className="mt-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Block time off
              </button>
            </div>

            <fieldset className="flex flex-wrap items-center gap-4">
              <legend className="sr-only">Which half of the day</legend>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="blockAm"
                  className="h-4 w-4 rounded border-slate-300 accent-primary-600"
                />
                Morning only
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="blockPm"
                  className="h-4 w-4 rounded border-slate-300 accent-primary-600"
                />
                Afternoon only
              </label>
              <span className="text-xs text-slate-500">
                Leave both unticked for the whole day. Tick one to keep working
                the other half — useful when you have your own job booked in.
              </span>
            </fieldset>
          </form>

          {blackouts.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {blackouts.map((blackout) => (
                <li key={blackout.day}>
                  <form action={removeBlackoutAction}>
                    <input type="hidden" name="day" value={blackout.day} />
                    <button
                      type="submit"
                      title="Remove this time off"
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-700"
                    >
                      {new Date(`${blackout.day}T12:00:00`).toLocaleDateString(
                        "en-GB",
                        { weekday: "short", day: "numeric", month: "short" }
                      )}
                      {blackout.am && blackout.pm
                        ? ""
                        : blackout.am
                          ? " (morning)"
                          : " (afternoon)"}{" "}
                      ×
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}
