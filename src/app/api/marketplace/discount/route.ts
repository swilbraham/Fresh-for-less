import { NextResponse } from "next/server";
import { checkDiscountCode, issueDiscountCode } from "@/lib/marketplace/repo";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Hand out the leaving-the-page discount.
 *
 * Keyed to the basket session the browser generated, so the same visitor gets
 * the same code and the same deadline however many times the modal fires.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Someone typing a code they were given earlier — possibly in another tab or
  // yesterday, which is the whole point of printing it.
  const typed = String(payload.code ?? "").trim().toUpperCase().slice(0, 20);
  if (typed) {
    const limit = await hitRateLimit("discount-check", typed, 20, 60 * 60);
    if (!limit.allowed) return NextResponse.json({ ok: false }, { status: 429 });

    const pct = await checkDiscountCode(typed);
    if (pct === null) {
      return NextResponse.json({
        ok: false,
        error: "That code has expired or has already been used.",
      });
    }
    return NextResponse.json({ ok: true, code: typed, pct, expiresAt: "" });
  }

  const sessionKey = String(payload.sessionKey ?? "").trim().slice(0, 60);
  if (sessionKey.length < 8) return NextResponse.json({ ok: false }, { status: 400 });

  const limit = await hitRateLimit("discount", sessionKey, 10, 60 * 60);
  if (!limit.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const offer = await issueDiscountCode(sessionKey);
  if (!offer) return NextResponse.json({ ok: false }, { status: 400 });

  return NextResponse.json({ ok: true, ...offer });
}
