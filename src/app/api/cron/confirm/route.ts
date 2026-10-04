import { NextResponse } from "next/server";
import {
  claimJobsForCustomerConfirm,
  sendCustomerConfirmation,
} from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Teatime run — Vercel cron hits this at 5pm.
 *
 * Asks every customer whose clean was today whether the cleaner actually came,
 * three hours before the 8pm run assumes they did and bills for it. Without
 * this, assumed completion would bill on nothing but silence.
 *
 * 5pm is the compromise: the afternoon window closes at 5pm, so an afternoon
 * customer may answer late, but asking any later leaves no room for the reply
 * to arrive before billing.
 */
export async function GET(request: Request) {
  // Vercel signs scheduled requests with CRON_SECRET. Without this anyone
  // could make the platform text every one of today's customers.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  // Claimed as they are read, so a re-fire can't text a household twice.
  const jobs = await claimJobsForCustomerConfirm();

  let asked = 0;
  for (const job of jobs) {
    try {
      await sendCustomerConfirmation(job);
      asked += 1;
    } catch (error) {
      // One bad number must not cost every other customer their text.
      console.error(`confirmation text failed for ${job.ref}`, error);
    }
  }

  return NextResponse.json({
    ok: true,
    claimed: jobs.length,
    asked,
    refs: jobs.map((job) => job.ref),
  });
}
