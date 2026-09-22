import { NextResponse } from "next/server";
import { activatePaidBooking } from "@/lib/marketplace/repo";
import { verifyWebhook } from "@/lib/marketplace/stripe";

export const dynamic = "force-dynamic";
// Activation broadcasts to every covering cleaner before responding.
export const maxDuration = 60;

/**
 * Stripe backstop: normally the success redirect activates a paid booking,
 * but a customer who pays and closes the tab never comes back — this webhook
 * catches those. Requires STRIPE_WEBHOOK_SECRET (Stripe dashboard →
 * Developers → Webhooks → checkout.session.completed → this URL); without it
 * every post is rejected and the redirect path carries everything.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const event = verifyWebhook(raw, request.headers.get("stripe-signature") ?? "");
  if (!event) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const ref = session.metadata?.job_ref;
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? "";
    if (ref && session.payment_status === "paid") {
      // Idempotent — the success redirect may already have activated it.
      await activatePaidBooking(ref.toUpperCase(), session.id, paymentIntent);
    }
  }

  return NextResponse.json({ received: true });
}
