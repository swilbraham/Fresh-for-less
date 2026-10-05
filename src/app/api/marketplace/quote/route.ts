import { NextResponse } from "next/server";
import { recordQuote } from "@/lib/marketplace/repo";
import { normalisePostcode, outwardOf } from "@/lib/marketplace/postcode";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";
import type { QuoteLine } from "@/lib/marketplace/types";

export const dynamic = "force-dynamic";

/**
 * Record a priced basket from the booking form.
 *
 * Fire-and-forget from the browser: nothing the customer sees depends on it, so
 * every failure here answers 200 and keeps quiet rather than putting an error in
 * front of someone halfway through booking. The price is whatever the form had
 * on screen — this is a record of what was quoted, not an authority on what the
 * job costs, which is recalculated server-side at the point of booking.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const sessionKey = String(payload.sessionKey ?? "").trim().slice(0, 60);
  if (sessionKey.length < 8) return NextResponse.json({ ok: true });

  const postcode = normalisePostcode(String(payload.postcode ?? "").slice(0, 12));
  const totalPence = Math.max(0, Math.floor(Number(payload.totalPence) || 0));
  if (!postcode || totalPence <= 0) return NextResponse.json({ ok: true });

  // A basket changes a dozen times while somebody makes their mind up, and the
  // form already debounces. This is the backstop against a loop or a script.
  const limit = await hitRateLimit("quote", sessionKey, 60, 60 * 60);
  if (!limit.allowed) return NextResponse.json({ ok: true });

  const items: QuoteLine[] = Array.isArray(payload.items)
    ? (payload.items as unknown[]).slice(0, 40).map((raw) => {
        const line = (raw ?? {}) as Record<string, unknown>;
        return {
          code: String(line.code ?? "").slice(0, 40),
          label: String(line.label ?? "").slice(0, 120),
          qty: Math.max(0, Math.floor(Number(line.qty) || 0)),
          amount_pence: Math.max(0, Math.floor(Number(line.amount_pence) || 0)),
          note: String(line.note ?? "").slice(0, 160),
        };
      })
    : [];

  try {
    await recordQuote({
      sessionKey,
      postcode,
      outward: outwardOf(postcode) ?? "",
      covered: payload.covered === true,
      items,
      subtotalPence: Math.max(0, Math.floor(Number(payload.subtotalPence) || 0)),
      totalPence,
      source: String(payload.source ?? "").slice(0, 40),
    });
  } catch {
    // Deliberately silent: a quote we failed to log is a reporting gap, not a
    // reason to interrupt a booking.
  }

  return NextResponse.json({ ok: true });
}
