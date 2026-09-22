import crypto from "crypto";
import { NextResponse } from "next/server";
import { createSocialLead, markSocialMessageSeen } from "@/lib/marketplace/repo";
import { maybeAutoReply } from "@/lib/marketplace/social-reply";

export const dynamic = "force-dynamic";

/**
 * Meta (Facebook Page + Instagram) messaging webhook.
 *
 * New DMs to the business pages land here and become leads in /admin/leads,
 * texting the office like any other enquiry. Replies still happen in the
 * Facebook/Instagram inbox — this only captures, it doesn't send.
 *
 * Env: META_VERIFY_TOKEN (handshake), META_APP_SECRET (signature check),
 * META_PAGE_ACCESS_TOKEN (optional — looks up the sender's display name).
 */

type MessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: { type?: string }[];
  };
};

/** Meta calls this once when the webhook URL is saved in the app dashboard. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = process.env.META_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const secret = process.env.META_APP_SECRET;
  const raw = await request.text();

  // Without the app secret anyone could invent enquiries, so refuse loudly
  // rather than accept quietly.
  if (!secret) {
    return NextResponse.json({ error: "META_APP_SECRET not set" }, { status: 503 });
  }
  const header = request.headers.get("x-hub-signature-256") ?? "";
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 403 });
  }

  let body: {
    object?: string;
    entry?: { id?: string; messaging?: MessagingEvent[] }[];
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const platform =
    body.object === "page" ? "facebook" :
    body.object === "instagram" ? "instagram" : null;
  // Subscribed to something we don't handle — acknowledge so Meta doesn't retry.
  if (!platform) return NextResponse.json({ ok: true });

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      try {
        await handleMessage(platform, entry.id ?? "", event);
      } catch (err) {
        // Log and move on: a 200 with one bad event beats Meta retrying the
        // whole batch forever and eventually disabling the webhook.
        console.error("meta webhook event failed", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleMessage(
  platform: "facebook" | "instagram",
  pageId: string,
  event: MessagingEvent
): Promise<void> {
  const message = event.message;
  const senderId = event.sender?.id ?? "";
  const mid = message?.mid ?? "";

  // Delivery/read receipts, reactions, and echoes of our own replies.
  if (!message || !senderId || !mid || message.is_echo) return;
  if (senderId === pageId) return;

  const text =
    message.text?.trim() ||
    (message.attachments?.length
      ? `[sent ${message.attachments.map((a) => a.type || "attachment").join(", ")}]`
      : "");
  if (!text) return;

  if (!(await markSocialMessageSeen(mid))) return;

  const lead = await createSocialLead({
    platform,
    senderId,
    senderName: await senderName(platform, senderId, pageId),
    pageLabel: await pageLabel(pageId),
    text: text.slice(0, 1500),
  });

  // Quote-request DMs get one automatic reply with the instant price and the
  // /book link; everything else waits for a human.
  await maybeAutoReply({ lead, senderId, pageToken: pageToken(pageId) });
}

/**
 * The app can be connected to several pages (Wirral Carpet Cleaning and Fresh
 * For Less), each with its own page access token. `META_PAGE_ACCESS_TOKEN_<id>`
 * wins for that page; `META_PAGE_ACCESS_TOKEN` is the fallback for a
 * single-page setup.
 */
function pageToken(pageId: string): string | undefined {
  return (
    (pageId && process.env[`META_PAGE_ACCESS_TOKEN_${pageId}`]) ||
    process.env.META_PAGE_ACCESS_TOKEN
  );
}

/**
 * Which business was messaged, so the lead says more than "facebook-dm" when
 * several pages feed the same inbox. Page names never change mid-deploy, so
 * one Graph lookup per page per cold start is enough.
 */
const pageNames = new Map<string, string>();
async function pageLabel(pageId: string): Promise<string> {
  if (!pageId) return "";
  const cached = pageNames.get(pageId);
  if (cached !== undefined) return cached;

  const token = pageToken(pageId);
  let name = "";
  if (token) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v23.0/${encodeURIComponent(pageId)}` +
          `?fields=name&access_token=${encodeURIComponent(token)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        name = ((await res.json()) as { name?: string }).name ?? "";
      }
    } catch {
      // Label is cosmetic — never fail the lead over it.
    }
  }
  pageNames.set(pageId, name);
  return name;
}

/**
 * Best-effort display-name lookup via the Graph API. DMs identify people by a
 * platform-scoped id, which is useless to a human scanning the leads page.
 */
async function senderName(
  platform: "facebook" | "instagram",
  senderId: string,
  pageId: string
): Promise<string> {
  const fallback = platform === "facebook" ? "Facebook enquiry" : "Instagram enquiry";
  const token = pageToken(pageId);
  if (!token) return fallback;

  try {
    const fields = platform === "facebook" ? "name" : "name,username";
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${encodeURIComponent(senderId)}` +
        `?fields=${fields}&access_token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return fallback;
    const profile = (await res.json()) as { name?: string; username?: string };
    return (
      profile.name ||
      (profile.username ? `@${profile.username}` : "") ||
      fallback
    );
  } catch {
    return fallback;
  }
}
