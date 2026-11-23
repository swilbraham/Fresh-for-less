import { NextResponse } from "next/server";
import { releaseExpiredHolds } from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Hourly through the working day — Vercel cron hits this on the hour, 8am to
 * 8pm.
 *
 * A first-refusal hold is only two hours long, so waiting for the next
 * morning's cron to pass a lapsed job on would quietly burn most of a day of
 * the customer's notice. This run clears lapsed holds promptly: the area's
 * backup cleaner gets their own hold, or the job goes out to everyone
 * covering. The daily 8am run still calls the same function, so nothing is
 * missed overnight.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const lapsed = await releaseExpiredHolds();
  return NextResponse.json({ ok: true, lapsed });
}
