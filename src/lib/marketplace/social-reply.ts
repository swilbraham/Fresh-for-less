import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { appendLeadNote, getPriceItems, quoteBasket, type Lead } from "./repo";
import { gbpShort } from "./money";
import type { Basket } from "./pricing";
import type { PriceItem } from "./types";

const BOOK_URL = "https://www.freshforlesscarpetcleaning.co.uk/book";
const REPLY_MARKER = "↳ auto-reply";

/**
 * Reply to a Facebook/Instagram enquiry that looks like a quote request.
 *
 * Claude only maps the customer's words onto price-list item codes — every
 * figure quoted comes from quoteBasket(), i.e. the same admin-controlled
 * prices /book charges, and the reply says prices are confirmed at booking.
 *
 * One auto-reply per conversation: the office takes over from there. Wholly
 * best-effort — needs ANTHROPIC_API_KEY and the page's access token, and any
 * failure just means no reply is sent (the lead itself is already saved).
 * Set META_AUTO_REPLY=off to switch it off without a code change.
 */
export async function maybeAutoReply(input: {
  lead: Lead;
  senderId: string;
  pageToken?: string;
}): Promise<void> {
  try {
    if (process.env.META_AUTO_REPLY === "off") return;
    if (!process.env.ANTHROPIC_API_KEY || !input.pageToken) return;
    if (input.lead.notes.includes(REPLY_MARKER)) return;

    const items = await getPriceItems(true);
    const request = await extractRequest(input.lead.notes, items);
    if (!request?.quote_request) return;

    const basket: Basket = {};
    for (const [code, qty] of Object.entries(request.basket)) {
      const n = Math.floor(Number(qty));
      if (items.some((i) => i.code === code) && Number.isFinite(n) && n > 0) {
        basket[code] = Math.min(n, 12);
      }
    }

    let text: string;
    if (Object.keys(basket).length > 0) {
      const quote = await quoteBasket(basket);
      if (quote.total_pence <= 0) return;
      const lines = quote.lines
        .map((l) => `• ${l.label} x${l.qty}`)
        .join("\n");
      const offer = quote.savings_pence > 0 ? " with our current offer" : "";
      const minimum = quote.minimum_applied ? " (our minimum charge)" : "";
      text =
        `Thanks for your message! Based on what you've described:\n${lines}\n` +
        `our instant online price is ${gbpShort(quote.total_pence)}${offer}${minimum}.\n\n` +
        `You can confirm the exact price and book a date in about a minute here:\n${BOOK_URL}\n\n` +
        `Prices are confirmed when you book. Any questions, just reply here!`;
    } else {
      text =
        `Thanks for your message! You can get an instant fixed price and book a date ` +
        `online in about a minute here:\n${BOOK_URL}\n\n` +
        `Or tell us which rooms or items you'd like cleaned and we'll get straight back to you.`;
    }

    if (await sendDm(input.pageToken, input.senderId, text)) {
      await appendLeadNote(
        input.lead.id,
        `${REPLY_MARKER} sent: ${text.replace(/\s+/g, " ").slice(0, 400)}`
      );
    }
  } catch {
    // Auto-reply is a bonus on top of an already-saved lead — never let it
    // fail the webhook.
  }
}

/** Claude maps the conversation onto catalogue codes; it never prices anything. */
async function extractRequest(
  conversation: string,
  items: PriceItem[]
): Promise<{ quote_request: boolean; basket: Record<string, number> } | null> {
  const catalogue = items
    .map((i) => `${i.code}: ${i.label}${i.hint ? ` (${i.hint})` : ""}`)
    .join("\n");

  const client = new Anthropic();
  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 300,
    output_config: { effort: "low" },
    system:
      "You read incoming Facebook/Instagram messages to a carpet and upholstery " +
      "cleaning business and decide whether the customer is asking what cleaning " +
      "work would cost (a quote request). Item catalogue (code: meaning):\n" +
      `${catalogue}\n\n` +
      'Respond with ONLY a JSON object, no other text:\n' +
      '{"quote_request": <true if they ask about price, cost, a quote, or what ' +
      "you'd charge for cleaning work>, \"basket\": {\"<code>\": <quantity>}}\n" +
      "Only include catalogue codes you are confident match what the customer " +
      "described, and leave basket empty when unsure. A through lounge counts as " +
      "one room. Use the counts the customer gives (e.g. 3 bedrooms = room: 3).",
    messages: [{ role: "user", content: conversation.slice(0, 6000) }],
  });
  if (response.stop_reason === "refusal") return null;

  const block = response.content.find((b) => b.type === "text");
  const raw = (block?.type === "text" ? block.text : "")
    .replace(/```(json)?/g, "")
    .trim();
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as { quote_request?: unknown; basket?: unknown };
  return {
    quote_request: record.quote_request === true,
    basket:
      typeof record.basket === "object" && record.basket !== null
        ? (record.basket as Record<string, number>)
        : {},
  };
}

/** Messenger Send API — also delivers Instagram DMs via the linked page's token. */
async function sendDm(
  pageToken: string,
  recipientId: string,
  text: string
): Promise<boolean> {
  const res = await fetch(
    `https://graph.facebook.com/v23.0/me/messages?access_token=${encodeURIComponent(pageToken)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message: { text },
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) {
    console.error("meta send failed", res.status, await res.text().catch(() => ""));
  }
  return res.ok;
}
