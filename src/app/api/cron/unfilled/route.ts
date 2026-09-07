import { NextResponse } from "next/server";
import {
  claimUnfilledJobsForAlert,
  notifyAdmin,
  siteUrl,
  UNFILLED_ALERT_DAYS,
} from "@/lib/marketplace/repo";
import { gbpShort } from "@/lib/marketplace/money";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily check for jobs coming up with nobody on them.
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

  const jobs = await claimUnfilledJobsForAlert();
  if (jobs.length === 0) {
    return NextResponse.json({ ok: true, jobs: 0 });
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

  return NextResponse.json({ ok: true, jobs: jobs.length, refs: jobs.map((j) => j.ref) });
}
