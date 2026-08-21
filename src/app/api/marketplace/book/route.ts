import { NextResponse } from "next/server";
import { createBooking } from "@/lib/marketplace/repo";
import { normalisePostcode } from "@/lib/marketplace/postcode";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";

export const dynamic = "force-dynamic";

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
  const addressLine = text(payload.addressLine, 160);
  const town = text(payload.town, 80);
  const postcode = normalisePostcode(text(payload.postcode, 12));
  const slotDate = text(payload.slotDate, 10);
  const slotWindow = text(payload.slotWindow, 2) === "pm" ? "pm" : "am";
  const notes = text(payload.notes, 600);

  const problems: string[] = [];
  if (customerName.length < 2) problems.push("your name");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) problems.push("a valid email");
  if (customerPhone.replace(/\D/g, "").length < 10) problems.push("a valid phone number");
  if (addressLine.length < 4) problems.push("your address");
  if (!postcode) problems.push("a valid postcode");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) problems.push("a date");
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

  // Each booking texts every covering cleaner, so an unthrottled endpoint is a
  // way to spend someone else's SMS budget and spam their network.
  const perContact = await hitRateLimit(
    "book:contact",
    customerPhone.replace(/\D/g, "") || customerEmail,
    5,
    60 * 60
  );
  const overall = await hitRateLimit("book:global", "all", 60, 60 * 60);
  if (!perContact.allowed || !overall.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We've had a lot of booking attempts just now. Please call 0330 043 4811 and we'll book you in.",
      },
      { status: 429 }
    );
  }

  try {
    // The price is recalculated server-side here — the browser's total is only
    // ever a display value.
    const { job, offered } = await createBooking({
      basket,
      customerName,
      customerEmail,
      customerPhone,
      addressLine,
      town,
      postcode: postcode!,
      slotDate,
      slotWindow,
      notes,
      protection: payload.protection === true,
    });

    return NextResponse.json({
      ok: true,
      ref: job.ref,
      total_pence: job.total_pence,
      offered,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String((error as Error)?.message ?? "Booking failed.") },
      { status: 400 }
    );
  }
}
