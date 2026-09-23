import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyBookingToken } from "@/lib/marketplace/auth";
import {
  getCleaner,
  getJobByRef,
  getOpenSlots,
  getSettings,
} from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { firstName } from "@/lib/marketplace/names";
import { Alert, Card, StatusPill } from "@/components/marketplace/shell";
import SlotPicker from "@/components/marketplace/SlotPicker";
import { cancelBookingAction, rescheduleBookingAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage your booking",
  robots: { index: false, follow: false },
};

const BOOKING_WINDOW_DAYS = 27;

function longDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function shortDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const WINDOW_LABEL = {
  am: "Morning 8am–12pm",
  pm: "Afternoon 12pm–5pm",
} as const;

export default async function ManageBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{
    t?: string;
    error?: string;
    moved?: string;
    cancelled?: string;
  }>;
}) {
  const { ref } = await params;
  const { t, error, moved, cancelled } = await searchParams;
  const reference = ref.toUpperCase();

  // The link is the credential — a wrong or missing token reveals nothing,
  // not even whether the reference exists.
  if (!t || !verifyBookingToken(reference, t)) notFound();

  const job = await getJobByRef(reference);
  if (!job) notFound();

  const settings = await getSettings();
  const hoursUntil = Number(job.hours_until_slot);
  const isLate = hoursUntil < settings.cancellation_notice_hours;
  const isOver = job.status === "completed" || job.status === "cancelled";
  const cleaner = job.cleaner_id ? await getCleaner(job.cleaner_id) : null;

  // The minimum charge can lift the total above the sum of the lines; show it
  // rather than leaving the customer to wonder why the figures don't add up.
  const itemsTotal = job.items.reduce((sum, line) => sum + line.amount_pence, 0);
  const minimumTopUp = Math.max(0, job.total_pence - itemsTotal);

  // A price agreed on the phone covers the whole job, so the per-item prices no
  // longer add up to it. Show what is being cleaned and the one price that was
  // agreed, rather than a breakdown that invites the customer to do arithmetic
  // that will not work.
  const pricedByAgreement = job.list_total_pence > 0;

  const slots = isOver
    ? []
    : (
        await getOpenSlots(
          job.outward,
          settings.min_notice_days,
          settings.min_notice_days + BOOKING_WINDOW_DAYS,
          job.id
        )
      ).filter((s) => s.am || s.pm);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 pt-10 pb-20">
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
          Booking {job.ref}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Manage your booking
        </h1>

        <div className="mt-6">
          {error && <Alert>{error}</Alert>}
          {moved === "kept" && (
            <Alert tone="success">
              Moved. {cleaner?.name ?? "Your cleaner"} was free at the new time,
              so you&apos;ve still got the same cleaner.
            </Alert>
          )}
          {moved === "rebroadcast" && (
            <Alert tone="info">
              Moved. Your previous cleaner wasn&apos;t free then, so we&apos;ve
              sent the job back out — we&apos;ll confirm your new cleaner shortly.
            </Alert>
          )}
          {cancelled && (
            <Alert tone="success">
              Your booking is cancelled. There&apos;s nothing to pay.
            </Alert>
          )}
        </div>

        {/* Current state */}
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {longDate(job.slot_date)}
              </p>
              <p className="text-slate-600">{WINDOW_LABEL[job.slot_window]}</p>
            </div>
            <StatusPill status={job.status} />
          </div>

          <dl className="mt-5 divide-y divide-slate-100 border-y border-slate-100 text-sm">
            <Row
              label="Address"
              value={`${job.address_line}${job.town ? `, ${job.town}` : ""}, ${job.postcode}`}
            />
            <Row
              label="Price"
              value={`${gbp(job.total_pence)} — pay your cleaner on the day`}
            />
            <Row
              label="Your cleaner"
              value={
                cleaner
                  ? `${firstName(cleaner.name)} · ${cleaner.phone}`
                  : job.status === "cancelled"
                    ? "—"
                    : "Being matched — we'll confirm shortly"
              }
            />
          </dl>

          <ul className="mt-4 space-y-1 text-sm text-slate-700">
            {job.items.map((line) => (
              <li key={line.code} className="flex justify-between">
                <span>
                  {line.qty} × {line.label}
                </span>
                {!pricedByAgreement && (
                  <span className="font-semibold tabular-nums">
                    {gbp(line.amount_pence)}
                  </span>
                )}
              </li>
            ))}
            {!pricedByAgreement && minimumTopUp > 0 && (
              <li className="flex justify-between text-slate-500">
                <span>Minimum charge applied</span>
                <span className="tabular-nums">+{gbp(minimumTopUp)}</span>
              </li>
            )}
            <li className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-900">
              <span>{pricedByAgreement ? "Agreed price" : "Total"}</span>
              <span className="tabular-nums">{gbp(job.total_pence)}</span>
            </li>
            {pricedByAgreement && (
              <li className="pt-1 text-xs text-slate-500">
                The price we agreed on the phone, covering everything listed
                above. Nothing is added on the day.
              </li>
            )}
          </ul>
        </Card>

        {isOver ? (
          <Card className="mt-6">
            <p className="text-slate-600">
              {job.status === "completed"
                ? "This job has been completed — thanks for booking with us."
                : "This booking was cancelled."}{" "}
              <Link
                href="/book"
                className="font-semibold text-primary-600 underline"
              >
                Book another clean
              </Link>
              .
            </p>
          </Card>
        ) : (
          <>
            {/* Reschedule */}
            <Card
              title="Move to another day"
              description="Only times with a cleaner free in your area are shown. We'll keep your current cleaner whenever they can make the new slot."
              className="mt-6"
            >
              {slots.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No alternative slots are free in {job.outward} at the moment.
                  Please call 0330 043 4811 and we&apos;ll sort it.
                </p>
              ) : (
                <form action={rescheduleBookingAction} className="mt-4">
                  <input type="hidden" name="ref" value={job.ref} />
                  <input type="hidden" name="token" value={t} />

                  <SlotPicker slots={slots} />

                  <button
                    type="submit"
                    className="mt-5 w-full rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                  >
                    Move my booking
                  </button>
                </form>
              )}
            </Card>

            {/* Cancel */}
            <Card
              title="Cancel this booking"
              description="There's nothing to pay — you haven't been charged."
              className="mt-6"
            >
              {isLate && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Your clean is in under {settings.cancellation_notice_hours}{" "}
                  hours. You can still cancel, but your cleaner has set the time
                  aside — please let us know as early as you can.
                </p>
              )}
              <form action={cancelBookingAction} className="mt-4">
                <input type="hidden" name="ref" value={job.ref} />
                <input type="hidden" name="token" value={t} />
                <label
                  htmlFor="reason"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Reason (optional)
                </label>
                <input
                  id="reason"
                  name="reason"
                  placeholder="Change of plan, no longer needed…"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="mt-4 w-full rounded-xl border border-red-300 px-6 py-3 font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Cancel my booking
                </button>
              </form>
            </Card>
          </>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Need a hand? Call{" "}
          <a href="tel:03300434811" className="font-semibold underline">
            0330 043 4811
          </a>
        </p>
      </div>
    </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900 sm:text-right">{value}</dd>
    </div>
  );
}
