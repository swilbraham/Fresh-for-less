import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { paymentType, amount, address } = await req.json();

  if (!paymentType || !address?.trim()) {
    return NextResponse.json(
      { error: "Payment type and address are required" },
      { status: 400 }
    );
  }

  const amountInPence =
    paymentType === "booking_fee" ? 2000 : Math.round(Number(amount) * 100);

  if (amountInPence < 2000) {
    return NextResponse.json(
      { error: "Minimum payment is £20.00" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const lineItemName =
    paymentType === "booking_fee"
      ? "Booking Fee (deducted from final payment)"
      : "Carpet Cleaning Payment";

  const origin =
    req.headers.get("origin") ||
    "https://www.freshforlesscarpetcleaning.co.uk";

  try {
    // Stripe auto-enables available payment methods (card, Klarna, etc.)
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: lineItemName,
              description: `Payment ref: ${address.trim()}`,
            },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        address: address.trim(),
        payment_type: paymentType,
      },
      success_url: `${origin}/pay/success.html?type=${paymentType}`,
      cancel_url: `${origin}/pay/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
