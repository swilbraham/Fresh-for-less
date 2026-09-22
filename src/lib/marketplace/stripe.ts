import "server-only";
import Stripe from "stripe";

/**
 * Booking deposits: the customer pays the platform's commission by card at
 * booking, and the cleaner collects the balance on the day. This module is
 * deliberately free of repo imports (repo imports it for refunds) and deals
 * only in primitives.
 *
 * Enabled whenever STRIPE_SECRET_KEY is set; BOOKING_DEPOSIT=off turns the
 * deposit step off without touching anything else (bookings then work exactly
 * as before — pay the cleaner in full on the day, commission invoiced).
 */
export function depositsEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY) && process.env.BOOKING_DEPOSIT !== "off";
}

function stripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * Checkout session for a booking deposit. Returns the id and redirect URL,
 * or null on any Stripe failure — the caller shows a friendly message rather
 * than a raw Stripe error.
 */
export async function createDepositCheckout(input: {
  ref: string;
  amountPence: number;
  customerEmail: string;
  siteUrl: string;
}): Promise<{ id: string; url: string } | null> {
  try {
    const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.customerEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Booking deposit — ${input.ref}`,
            description:
              "Deducted from your fixed price. The balance is payable to your cleaner on the day.",
          },
          unit_amount: input.amountPence,
        },
        quantity: 1,
      },
    ],
    metadata: { job_ref: input.ref },
      success_url: `${input.siteUrl}/book/confirmed/${input.ref}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.siteUrl}/book?cancelled=${input.ref}`,
    });
    return session.url ? { id: session.id, url: session.url } : null;
  } catch (error) {
    console.error("stripe checkout create failed", input.ref, error);
    return null;
  }
}

/**
 * Is this session a completed payment for this booking? Returns the payment
 * intent id when it is, null otherwise. Used by the success redirect and as a
 * belt-and-braces check anywhere else a session id turns up.
 */
export async function verifyPaidSession(
  sessionId: string,
  ref: string
): Promise<string | null> {
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;
    if (session.metadata?.job_ref !== ref) return null;
    return typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  } catch {
    return null;
  }
}

/** Full refund of a deposit. True on success. */
export async function refundPaymentIntent(paymentIntent: string): Promise<boolean> {
  try {
    await stripe().refunds.create({ payment_intent: paymentIntent });
    return true;
  } catch (error) {
    console.error("stripe refund failed", paymentIntent, error);
    return false;
  }
}

/** Verify a Stripe webhook signature and return the event, or null. */
export function verifyWebhook(rawBody: string, signature: string): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return null;
  try {
    return stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return null;
  }
}
