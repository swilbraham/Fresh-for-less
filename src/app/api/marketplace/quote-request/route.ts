import { NextResponse } from "next/server";
import { createQuoteRequest } from "@/lib/marketplace/repo";
import { normalisePostcode } from "@/lib/marketplace/postcode";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";

export const dynamic = "force-dynamic";

// A request texts every covering cleaner before responding, same as a booking.
export const maxDuration = 60;

function text(value: unknown, max = 200): string {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request." },
      { status: 400 }
    );
  }

  const customerName = text(payload.customerName, 80);
  const customerEmail = text(payload.customerEmail, 120);
  const customerPhone = text(payload.customerPhone, 30);
  const postcode = normalisePostcode(text(payload.postcode, 12));
  const notes = text(payload.notes, 600);

  const problems: string[] = [];
  if (customerName.length < 2) problems.push("your name");
  if (customerPhone.replace(/\D/g, "").length < 10) problems.push("a mobile number");
  if (customerEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
    problems.push("a valid email");
  }
  if (!postcode) problems.push("a valid postcode");
  if (problems.length) {
    return NextResponse.json(
      { ok: false, error: `Please add ${problems.join(", ")}.` },
      { status: 400 }
    );
  }

  const rawBasket = (payload.basket ?? {}) as Record<string, unknown>;
  const basket: Record<string, number> = {};
  for (const [code, qty] of Object.entries(rawBasket)) {
    const n = Math.floor(Number(qty));
    if (Number.isFinite(n) && n > 0) basket[text(code, 40)] = n;
  }

  // Each request texts every covering cleaner, so an unthrottled endpoint is
  // a way to spend someone else's SMS budget and spam their network.
  const perContact = await hitRateLimit(
    "quote-request:contact",
    customerPhone.replace(/\D/g, "") || customerName.toLowerCase(),
    3,
    3600
  );
  const overall = await hitRateLimit("quote-request:all", "all", 40, 3600);
  if (!perContact.allowed || !overall.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Too many requests just now — please try again in a little while, or call us.",
      },
      { status: 429 }
    );
  }

  try {
    const result = await createQuoteRequest({
      postcode: postcode!,
      basket,
      notes,
      customerName,
      customerEmail,
      customerPhone,
      source: text(payload.source, 40),
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.reason },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, token: result.token });
  } catch (error) {
    console.error("quote-request failed", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong — please try again." },
      { status: 500 }
    );
  }
}
