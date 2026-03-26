import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentType, amount, address } = req.body;

  if (!paymentType || !address?.trim()) {
    return res.status(400).json({ error: 'Payment type and address are required' });
  }

  const amountInPence = paymentType === 'booking_fee' ? 2000 : Math.round(Number(amount) * 100);

  if (amountInPence < 2000) {
    return res.status(400).json({ error: 'Minimum payment is £20.00' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const lineItemName =
    paymentType === 'booking_fee'
      ? 'Booking Fee (deducted from final payment)'
      : 'Carpet Cleaning Payment';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'klarna'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: lineItemName,
              description: `Payment ref: ${address.trim()}`,
            },
            unit_amount: amountInPence,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        address: address.trim(),
        payment_type: paymentType,
      },
      success_url: `${req.headers.origin || 'https://www.freshforless.com'}/pay/success.html?type=${paymentType}`,
      cancel_url: `${req.headers.origin || 'https://www.freshforless.com'}/pay/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
