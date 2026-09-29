import { NextResponse } from "next/server";
import { createTrainingEnquiry } from "@/lib/marketplace/repo";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";

export const dynamic = "force-dynamic";

function text(value: unknown, max = 200): string {
  return String(value ?? "").trim().slice(0, max);
}

/**
 * Enquiries from the /training page form.
 *
 * Same shape as /api/leads: honeypot plus a per-contact rate limit, because
 * every enquiry texts the office and an open endpoint is a way to spend
 * someone else's money.
 */
export async function POST(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  const form = type.includes("application/json")
    ? new Map(Object.entries(await request.json().catch(() => ({})))) as unknown as FormData
    : await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  // Bots fill every field they can see; people never see this one.
  if (text(form.get("_honey"), 50)) {
    return NextResponse.json({ ok: true });
  }

  const name = text(form.get("name"), 80);
  const phone = text(form.get("phone"), 30);
  const email = text(form.get("email"), 120);
  const message = text(form.get("message"), 2000);

  if (name.length < 2 || (phone.replace(/\D/g, "").length < 10 && !email.includes("@"))) {
    return NextResponse.json(
      { ok: false, error: "We need a name and a phone number or email we can reach you on." },
      { status: 400 }
    );
  }

  const limit = await hitRateLimit("training", phone || email, 3, 3600);
  if (!limit.allowed) {
    // Already have their details — say thank you rather than expose the limit.
    return NextResponse.json({ ok: true });
  }

  await createTrainingEnquiry({
    name,
    phone,
    email,
    message,
    source: text(form.get("source"), 120) || "training-page",
  });

  return NextResponse.json({ ok: true });
}
