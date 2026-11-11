import { NextResponse } from "next/server";
import { chaseQuoteBookings } from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Chases customers who chose a quote and never picked a date.
 *
 * That gap is the most expensive one in the system: the cleaner has won the
 * work and the customer has decided, but no date means no clean, and no
 * clean means no commission. Runs late morning and early evening — two
 * nudges per customer, then it stops and leaves it to a phone call.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const result = await chaseQuoteBookings();
  return NextResponse.json({ ok: true, ...result });
}
