import { NextResponse } from "next/server";
import { notify, recordQuote } from "@/lib/marketplace/repo";
import { normalisePostcode, outwardOf } from "@/lib/marketplace/postcode";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";
import { isMobile, toE164 } from "@/lib/marketplace/phone";
import { gbp } from "@/lib/marketplace/money";
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

  // Contact details are optional: most baskets stay anonymous, but a customer
  // who asks for their price by text becomes a lead the office can follow up.
  const customerName = String(payload.customerName ?? "").trim().slice(0, 80);
  const rawPhone = String(payload.customerPhone ?? "").trim().slice(0, 30);
  const mobile = rawPhone && isMobile(rawPhone) ? toE164(rawPhone) : null;

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
      customerName,
      customerPhone: mobile ?? "",
    });
  } catch {
    // Deliberately silent: a quote we failed to log is a reporting gap, not a
    // reason to interrupt a booking.
  }

  // "Text me this price": one SMS with the figure and the way back in. Capped
  // per session so a retry-happy browser can't burn the SMS budget.
  if (payload.textMe === true && mobile) {
    const smsLimit = await hitRateLimit("quote-sms", sessionKey, 2, 24 * 60 * 60);
    if (smsLimit.allowed) {
      const picks = items
        .filter((line) => line.qty > 0)
        .slice(0, 4)
        .map((line) => (line.qty > 1 ? `${line.qty} x ${line.label}` : line.label))
        .join(", ");
      const bookUrl = `https://www.freshforlesscarpetcleaning.co.uk/book?postcode=${encodeURIComponent(postcode)}`;
      try {
        await notify({
          channel: "sms",
          recipient: mobile,
          subject: `Quote by text (${postcode})`,
          body:
            `${customerName ? `Hi ${customerName.split(" ")[0]}, your` : "Your"} ` +
            `Fresh For Less price for ${postcode}: ${gbp(totalPence)}` +
            `${picks ? ` — ${picks}` : ""}. Nothing to pay upfront. ` +
            `Book online: ${bookUrl} or call 0330 043 4811.`,
        });
        return NextResponse.json({ ok: true, texted: true });
      } catch {
        // The quote is saved either way; the office can still follow up.
      }
    }
  }

  return NextResponse.json({ ok: true, texted: false });
}
