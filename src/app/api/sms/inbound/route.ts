import { createHmac, timingSafeEqual } from "node:crypto";
import {
  parseConfirmationReply,
  recordCustomerConfirmation,
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

  // Recorded first and unconditionally. Whatever a customer actually wrote
  // belongs in the thread whether or not it fits the Y/N parser — a reply the
  // parser can't read is still the office's to answer.
  const { cleanerId, jobId, duplicate } = await recordInboundSms({
    from,
    body,
    providerId,
  });

  // Twilio retries on any non-2xx, so a redelivery must not text again.
  if (duplicate) return twiml();

  // Y/N is only read as an answer about a job when the sender isn't a cleaner:
  // a cleaner's "no" is a reply in their own thread, not a customer's verdict.
  const answer = cleanerId ? null : parseConfirmationReply(body);
  const confirmation = answer
    ? await recordCustomerConfirmation({ from, answer })
    : null;

  if (confirmation?.matched && !confirmation.alreadyAnswered && answer === "no") {
    // Loud, and its own message rather than a line inside the generic one: a
    // customer saying nobody came is the single worst thing the office can
    // find out late.
    await notifyAdmin({
      subject: `NOBODY CAME — ${confirmation.ref}`,
      smsBody:
        `CUSTOMER SAYS NO: ${confirmation.ref} (${confirmation.slotDate}) — ` +
        `${confirmation.cleanerName ?? "cleaner"} did not turn up, per the ` +
        `customer at ${from}.\n` +
        (confirmation.invoiceRef
          ? `Taken off invoice ${confirmation.invoiceRef}.\n`
          : "Not invoiced.\n") +
        (confirmation.reopened ? "Put back to accepted.\n" : "") +
        `Ring them: ${siteUrl()}/admin/messages?job=${confirmation.jobId}`,
      jobId: confirmation.jobId,
    });
    return twiml();
  }

  const link = cleanerId
    ? `${siteUrl()}/admin/messages?cleaner=${cleanerId}`
    : jobId
      ? `${siteUrl()}/admin/messages?job=${jobId}`
      : `${siteUrl()}/admin/messages`;
  await notifyAdmin({
    subject: "Reply received",
    smsBody:
      `${from} replied:\n\n${body.slice(0, 300)}\n\n` +
      (confirmation?.matched && answer === "yes"
        ? `Logged as "cleaner turned up" for ${confirmation.ref}.\n`
        : "") +
      (cleanerId || jobId ? link : `Not matched to anyone. ${link}`),
    jobId: jobId ?? undefined,
  });

  return twiml();
}
