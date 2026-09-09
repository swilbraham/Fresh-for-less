import { NextResponse } from "next/server";
import {
  claimJobsForReminder,
  claimJobsForWeekReminder,
  sendWeekReminder,
  claimUnfilledJobsForAlert,
  sendBookingReminder,
  notifyAdmin,
  siteUrl,
  UNFILLED_ALERT_DAYS,
} from "@/lib/marketplace/repo";
import { gbpShort } from "@/lib/marketplace/money";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The daily run: remind tomorrow's customers, then warn the office about jobs
 * nobody has taken.
 *
 * Both live on one schedule because Vercel's free tier allows two cron jobs and
 * the Monday invoice run takes the other. They're unrelated jobs sharing a
 * timer, so a failure in one must not stop the other.
 *
 * A job nobody accepts doesn't announce itself — it just quietly arrives, and
 * the first anyone knows is the customer ringing on the day. Three days is
 * enough warning to chase a cleaner, widen coverage, or call the customer and
 * be honest while they can still make other arrangements.
 *
 * Jobs are stamped as they're read, so a retry can't send the same warning
 * twice. One text covers all of them rather than one per job.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  // Tomorrow's confirmed customers, so nobody is surprised by a van, plus a
  // week-ahead nudge on anything booked far enough out to have been forgotten.
  let reminded = 0;
  let weekAhead = 0;
  try {
    for (const job of await claimJobsForReminder()) {
      await sendBookingReminder(job);
      reminded += 1;
    }
    for (const job of await claimJobsForWeekReminder()) {
      await sendWeekReminder(job);
      weekAhead += 1;
    }
  } catch (error) {
    // A reminder failing must not cost the office its unfilled warning.
    console.error("reminders failed", error);
  }

  const jobs = await claimUnfilledJobsForAlert();
  if (jobs.length === 0) {
    return NextResponse.json({ ok: true, reminded, weekAhead, jobs: 0 });
  }

  const line = (j: (typeof jobs)[number]) =>
    `${j.ref} ${j.outward} ${j.slot_date} ${j.slot_window.toUpperCase()} ` +
    `${gbpShort(j.total_pence)}` +
    (j.status === "provisional"
      ? " (no cover)"
      : j.offers === 0
        ? " (nobody offered)"
        : ` (${j.offers} offered, none accepted)`);

  const shown = jobs.slice(0, 5);
  const rest = jobs.length - shown.length;

  await notifyAdmin({
    subject: `${jobs.length} job${jobs.length === 1 ? "" : "s"} within ${UNFILLED_ALERT_DAYS} days with no cleaner`,
    smsBody:
      `UNFILLED — ${jobs.length} job${jobs.length === 1 ? "" : "s"} in the next ` +
      `${UNFILLED_ALERT_DAYS} days with no cleaner:\n` +
      shown.map(line).join("\n") +
      (rest > 0 ? `\n+${rest} more` : "") +
      `\n${siteUrl()}/admin/jobs?status=unfilled`,
  });

  return NextResponse.json({
    ok: true,
    reminded,
    weekAhead,
    jobs: jobs.length,
    refs: jobs.map((j) => j.ref),
  });
}
