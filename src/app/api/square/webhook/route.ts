import { NextResponse } from "next/server";
import {
  markInvoicePaidBySquare,
  notifyAdmin,
  recordSquareEvent,
  releaseSquareEvent,
  siteUrl,
} from "@/lib/marketplace/repo";
import { squareConfig, verifyWebhookSignature } from "@/lib/marketplace/square";
import { gbpShort } from "@/lib/marketplace/money";

export const dynamic = "force-dynamic";

type SquareWebhook = {
  type?: string;
  event_id?: string;
  data?: {
    object?: {
      payment?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
};

/**
 * Square payment webhook — the only thing that marks a commission invoice
 * paid by card.
 *
 * Nothing is read out of the body until the signature is checked, and nothing
 * at all is written when the check fails: unverified, this endpoint would be a
 * public button for clearing anybody's commission.
 */
export async function POST(request: Request) {
  // Reject before touching the body when Square isn't configured, so a stray
  // or probing request can never be treated as genuine.
  if (!squareConfig()) {
    return NextResponse.json({ error: "Square is not configured." }, { status: 503 });
  }

  // The raw text, not a parsed-and-reserialised copy: the signature covers the
  // exact bytes Square sent, and JSON.stringify would not reproduce them.
  const raw = await request.text();

  // Square signs the notification URL as registered in its dashboard. Behind
  // Vercel's proxy request.url can differ, so rebuild it from the public base
  // — the same approach the Twilio webhook uses.
  const notificationUrl = `${siteUrl()}${new URL(request.url).pathname}`;

  if (
    !verifyWebhookSignature(
      notificationUrl,
      raw,
      request.headers.get("x-square-hmacsha256-signature")
    )
  ) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let body: SquareWebhook;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const type = body.type ?? "";
  if (type !== "payment.updated" && type !== "payment.created") {
    // A 200 stops Square retrying something we will never act on.
    return NextResponse.json({ ok: true, ignored: type });
  }

  // Square retries until it gets a 2xx, and a payment moves through several
  // states, so claim the event id before writing anything.
  const eventId = body.event_id ?? "";
  if (!eventId) {
    return NextResponse.json({ error: "No event_id" }, { status: 400 });
  }
  if (!(await recordSquareEvent(eventId))) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Past this point the event id is claimed, so any failure has to hand it
  // back: otherwise Square's retry is dismissed as a duplicate and a real
  // payment stays unrecorded for good.
  try {
    const payment = body.data?.object?.payment;
    const orderId = payment?.order_id ?? "";
    // Only money actually taken counts. An APPROVED-but-not-captured payment
    // can still fail, and marking the invoice paid on it would clear a debt
    // that was never settled.
    if (!orderId || payment?.status !== "COMPLETED") {
      return NextResponse.json({ ok: true, pending: payment?.status ?? null });
    }

    const result = await markInvoicePaidBySquare({
      orderId,
      paymentId: payment?.id ?? "",
    });

    if (!result.found) {
      // A payment taken on this Square account that isn't one of our invoices
      // — worth seeing, never worth guessing at.
      await notifyAdmin({
        subject: "Square payment with no matching invoice",
        smsBody:
          `Square payment ${payment?.id ?? "?"} (order ${orderId}) doesn't match ` +
          `any commission invoice. Check it in Square.`,
      });
      return NextResponse.json({ ok: true, matched: false });
    }

    if (!result.alreadyPaid) {
      await notifyAdmin({
        subject: `Commission ${result.ref} paid by card`,
        smsBody:
          `PAID: ${result.ref}, ${gbpShort(result.totalPence ?? 0)} by card. ` +
          `${siteUrl()}/admin/invoices`,
      });
    }

    return NextResponse.json({
      ok: true,
      ref: result.ref,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (error) {
    await releaseSquareEvent(eventId).catch(() => {
      // Nothing more can be done here; the 500 still asks Square to retry.
    });
    console.error("Square webhook failed", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
