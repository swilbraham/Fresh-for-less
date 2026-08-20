import { redirect } from "next/navigation";
import { currentCleaner } from "@/lib/marketplace/auth";
import {
  getAvailability,
  getBlackouts,
  getCleanerAreas,
} from "@/lib/marketplace/repo";
import {
  addBlackoutAction,
  removeBlackoutAction,
  saveCoverageAction,
} from "../actions";
import {
  Alert,
  AvailabilityGrid,
  Card,
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
  if (!cleaner) redirect("/pro");

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
          <form action={addBlackoutAction} className="mt-4 flex flex-wrap gap-3">
            <input
              type="date"
              name="day"
              required
              className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Block this date
            </button>
          </form>

          {blackouts.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {blackouts.map((day) => (
                <li key={day}>
                  <form action={removeBlackoutAction}>
                    <input type="hidden" name="day" value={day} />
                    <button
                      type="submit"
                      title="Remove this day off"
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-red-100 hover:text-red-700"
                    >
                      {new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
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
