import { createHmac, timingSafeEqual } from "node:crypto";
import {
  recordInboundSms,
  notifyAdmin,
  siteUrl,
} from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";

/**
 * Twilio signs every webhook with the full URL plus the POST body sorted by
 * key. Without checking it, anyone who guesses this path could post fake
 * replies into the admin inbox.
 */
function signatureValid(
  url: string,
  params: Record<string, string>,
  signature: string | null
): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token || !signature) return false;

  const payload =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join("");
  const expected = createHmac("sha1", token).update(payload).digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Twilio expects TwiML; an empty response means "no auto-reply". */
const EMPTY_TWIML =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

function twiml(status = 200) {
  return new Response(EMPTY_TWIML, {
    status,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);

  // Twilio signs the URL it was configured with. Behind Vercel's proxy the
  // request URL can differ, so rebuild it from the public base.
  const path = new URL(request.url).pathname;
  const url = `${siteUrl()}${path}`;

  if (!signatureValid(url, params, request.headers.get("x-twilio-signature"))) {
    return new Response("Invalid signature", { status: 403 });
  }

  const from = params.From ?? "";
  const body = (params.Body ?? "").trim();
  const providerId = params.MessageSid ?? "";
  if (!from || !providerId) return twiml();

  const { cleanerId, duplicate } = await recordInboundSms({
    from,
    body,
    providerId,
  });

  // Twilio retries on any non-2xx, so a redelivery must not text again.
  if (!duplicate) {
    await notifyAdmin({
      subject: "Reply from a cleaner",
      smsBody:
        `${from} replied:\n\n${body.slice(0, 300)}\n\n` +
        (cleanerId
          ? `${siteUrl()}/admin/messages?cleaner=${cleanerId}`
          : `Not matched to a cleaner. ${siteUrl()}/admin/messages`),
    });
  }

  return twiml();
}
