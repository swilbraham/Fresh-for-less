import { NextResponse } from "next/server";
import { issueDiscountCode } from "@/lib/marketplace/repo";
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

  const sessionKey = String(payload.sessionKey ?? "").trim().slice(0, 60);
  if (sessionKey.length < 8) return NextResponse.json({ ok: false }, { status: 400 });

  const limit = await hitRateLimit("discount", sessionKey, 10, 60 * 60);
  if (!limit.allowed) return NextResponse.json({ ok: false }, { status: 429 });

  const offer = await issueDiscountCode(sessionKey);
  if (!offer) return NextResponse.json({ ok: false }, { status: 400 });

  return NextResponse.json({ ok: true, ...offer });
}
