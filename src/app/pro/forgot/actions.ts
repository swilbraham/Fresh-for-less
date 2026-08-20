"use server";

import { redirect } from "next/navigation";
import { makeResetToken } from "@/lib/marketplace/auth";
import {
  countRecentNotifications,
  findCleanerByEmail,
  notify,
} from "@/lib/marketplace/repo";
import { isMobile, toE164 } from "@/lib/marketplace/phone";

const RESET_SUBJECT = "Reset your Fresh For Less password";

function baseUrl(): string {
  const explicit = process.env.MARKETPLACE_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://www.freshforlesscarpetcleaning.co.uk";
}

/**
 * Self-service password reset.
 *
 * The response is identical whether or not the email matches an account, so
 * this can't be used to discover who's registered. The link is texted as well
 * as emailed, because SMS is the channel that actually works right now.
 */
export async function requestResetAction(data: FormData) {
  const email = String(data.get("email") ?? "").trim().slice(0, 120);
  const done = () => redirect("/pro/forgot?sent=1");

  const cleaner = await findCleanerByEmail(email);
  if (!cleaner) done();

  // Don't let repeated submissions burn through SMS credit.
  const alreadySent = await countRecentNotifications(
    cleaner!.email,
    15,
    `${RESET_SUBJECT}%`
  );
  if (alreadySent >= 3) done();

  const link = `${baseUrl()}/pro/reset/${makeResetToken(cleaner!.id, cleaner!.password_hash)}`;
  const body =
    `${cleaner!.name}, use this link within 48 hours to set a new password:\n\n` +
    `${link}\n\n` +
    `Didn't ask for this? Ignore it — your current password still works.`;

  const mobile = toE164(cleaner!.phone);
  if (mobile && isMobile(cleaner!.phone)) {
    await notify({
      channel: "sms",
      recipient: mobile,
      subject: RESET_SUBJECT,
      body: `Reset your Fresh For Less password (valid 48h): ${link}`,
    });
  }
  await notify({
    channel: "email",
    recipient: cleaner!.email,
    subject: RESET_SUBJECT,
    body,
  });

  done();
}
