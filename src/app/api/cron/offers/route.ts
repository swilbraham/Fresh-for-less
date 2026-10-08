import { NextResponse } from "next/server";
import { autoOfferQuotes } from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Mid-morning run — Vercel cron hits this at 10am.
 *
 * Yesterday's quoted-only leads get their one automatic chase-up text, a
 * discount code that lasts 48 hours. 10am because a discount text at 8am
 * reads like spam and one at night gets ignored; mid-morning is when people
 * sort their errands.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const result = await autoOfferQuotes();
  return NextResponse.json({ ok: true, ...result });
}
