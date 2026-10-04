import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Square card payments for commission invoices.
 *
 * Off unless all three credentials are present (SQUARE_ENV only picks which
 * Square to talk to and defaults to sandbox). The all-or-nothing check is
 * deliberate: a half-configured integration would create payment links no
 * webhook can be verified for, which means a cleaner paying and the invoice
 * staying unpaid.
 */

const API_VERSION = "2026-09-16";

type SquareConfig = {
  accessToken: string;
  locationId: string;
  webhookKey: string;
  baseUrl: string;
};

/** Log the reason Square is off once per process rather than on every call. */
const warnedAbout = new Set<string>();

function warnOnce(message: string): void {
  if (warnedAbout.has(message)) return;
  warnedAbout.add(message);
  console.warn(`Square disabled: ${message}`);
}

/**
 * The whole feature flag. Returns null — Square off, behave exactly as before
 * — unless every variable is set.
 *
 * Defaults to sandbox when SQUARE_ENV is unset or unrecognised: a mistake that
 * sends test traffic to sandbox is an afternoon of confusion, and one that
 * sends live traffic to production is somebody else's money.
 */
export function squareConfig(): SquareConfig | null {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim() ?? "";
  const locationId = process.env.SQUARE_LOCATION_ID?.trim() ?? "";
  const webhookKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() ?? "";

  const missing = [
    accessToken ? "" : "SQUARE_ACCESS_TOKEN",
    locationId ? "" : "SQUARE_LOCATION_ID",
    webhookKey ? "" : "SQUARE_WEBHOOK_SIGNATURE_KEY",
  ].filter(Boolean);

  // Some but not all set is the dangerous state, so say which ones are short
  // rather than failing silently on the one that matters later. Nothing is
  // logged when no SQUARE_* variable exists at all: that is just a site
  // running without card payments, which is the normal state.
  if (missing.length > 0) {
    const anySquareVar =
      missing.length < 3 || Boolean(process.env.SQUARE_ENV?.trim());
    if (anySquareVar) {
      warnOnce(`${missing.join(", ")} not set, so card payments stay off.`);
    }
    return null;
  }

  const env = (process.env.SQUARE_ENV ?? "").trim().toLowerCase();
  const production = env === "production";
  if (env && env !== "production" && env !== "sandbox") {
    warnOnce(`SQUARE_ENV="${env}" is not recognised — treating it as sandbox.`);
  }

  return {
    accessToken,
    locationId,
    webhookKey,
    baseUrl: production
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com",
  };
}

export function squareEnabled(): boolean {
  return squareConfig() !== null;
}

/**
 * What the running deploy actually believes, for the admin diagnostics page.
 * Reports which variables are short and which Square it would call, never a
 * secret's value: a token on a screen is a token in a screenshot.
 */
export function squareStatus(): {
  env: string;
  host: string | null;
  locationId: string;
  missing: string[];
} {
  const env = (process.env.SQUARE_ENV ?? "").trim().toLowerCase() || "(unset)";
  const missing = [
    process.env.SQUARE_ACCESS_TOKEN?.trim() ? "" : "SQUARE_ACCESS_TOKEN",
    process.env.SQUARE_LOCATION_ID?.trim() ? "" : "SQUARE_LOCATION_ID",
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim()
      ? ""
      : "SQUARE_WEBHOOK_SIGNATURE_KEY",
  ].filter(Boolean);
  const config = squareConfig();
  return {
    env,
    host: config ? new URL(config.baseUrl).host : null,
    locationId: process.env.SQUARE_LOCATION_ID?.trim() ?? "",
    missing,
  };
}

export type SquareLocation = {
  id: string;
  name: string;
  status: string;
  currency: string;
  country: string;
};

/**
 * The locations this token can actually see. A location id is only valid in
 * the environment it came from, and "Invalid location id" is indistinguishable
 * from a typo, so the fix is to read the real list rather than retype it.
 */
export async function listLocations(): Promise<SquareLocation[]> {
  const config = squareConfig();
  if (!config) throw new Error("Square is not configured.");

  const response = await fetch(`${config.baseUrl}/v2/locations`, {
    headers: {
      "Square-Version": API_VERSION,
      Authorization: `Bearer ${config.accessToken}`,
    },
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    const host = new URL(config.baseUrl).host;
    throw new Error(`Square ${response.status} at ${host}: ${text.slice(0, 260)}`);
  }

  const parsed = JSON.parse(text) as {
    locations?: Array<{
      id?: string;
      name?: string;
      status?: string;
      currency?: string;
      country?: string;
    }>;
  };

  return (parsed.locations ?? []).map((location) => ({
    id: location.id ?? "",
    name: location.name ?? "(unnamed)",
    status: location.status ?? "",
    currency: location.currency ?? "",
    country: location.country ?? "",
  }));
}

export type PaymentLink = {
  url: string;
  orderId: string;
  paymentLinkId: string;
};

/**
 * Create a hosted checkout link for one commission invoice.
 *
 * The invoice reference is the idempotency key, so a cron that fires twice
 * gets the same link back from Square instead of creating a second one and
 * leaving two orders able to pay the same bill.
 *
 * `amountPence` is passed through untouched — Square's `amount` is already the
 * smallest currency unit, which is how money is stored here.
 */
export async function createPaymentLink(input: {
  invoiceRef: string;
  amountPence: number;
  description: string;
}): Promise<PaymentLink> {
  const config = squareConfig();
  if (!config) throw new Error("Square is not configured.");

  const response = await fetch(
    `${config.baseUrl}/v2/online-checkout/payment-links`,
    {
      method: "POST",
      headers: {
        "Square-Version": API_VERSION,
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: input.invoiceRef,
        quick_pay: {
          name: `Commission ${input.invoiceRef}`,
          price_money: { amount: input.amountPence, currency: "GBP" },
          location_id: config.locationId,
        },
        payment_note: `${input.invoiceRef} — ${input.description}`,
      }),
    }
  );

  const text = await response.text();
  if (!response.ok) {
    // Name the Square we actually called. A 401 reads identically whether the
    // token is wrong or whether a live token was sent to sandbox, and that
    // distinction is the whole difference between a bad secret and a missing
    // SQUARE_ENV.
    const host = new URL(config.baseUrl).host;
    throw new Error(
      `Square ${response.status} at ${host}: ${text.slice(0, 260)}`
    );
  }

  let parsed: {
    payment_link?: {
      id?: string;
      url?: string;
      long_url?: string;
      order_id?: string;
    };
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Square returned something that isn't JSON: ${text.slice(0, 200)}`);
  }

  const link = parsed.payment_link;
  const url = link?.url ?? link?.long_url ?? "";
  const orderId = link?.order_id ?? "";

  // Without the order id a payment can never be matched back, so a link
  // without one is useless and must not be stored as if it worked.
  if (!url || !orderId) {
    throw new Error("Square returned a payment link with no url or order_id.");
  }

  return { url, orderId, paymentLinkId: link?.id ?? "" };
}

/**
 * Verify a Square webhook.
 *
 * Square signs the notification URL concatenated with the raw request body,
 * HMAC-SHA256 under the webhook signature key, base64. This must run on the
 * bytes as they arrived: re-serialising parsed JSON changes them, and a
 * failed check has to reject rather than fall through, because the endpoint
 * marks invoices paid.
 */
export function verifyWebhookSignature(
  notificationUrl: string,
  rawBody: string,
  signature: string | null
): boolean {
  const config = squareConfig();
  if (!config || !signature) return false;

  const expected = createHmac("sha256", config.webhookKey)
    .update(notificationUrl + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
