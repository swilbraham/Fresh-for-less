import { NextResponse } from "next/server";
import { createLead } from "@/lib/marketplace/repo";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";

export const dynamic = "force-dynamic";

function text(value: unknown, max = 200): string {
  return String(value ?? "").trim().slice(0, max);
}

/**
 * Enquiries from the offer pages.
 *
 * Accepts a normal form post rather than JSON: the offer pages are static HTML
 * and submit the form element directly, so there's no script to serialise it.
 *
 * Every enquiry texts the office, so an open endpoint is a way to spend
 * someone else's money — hence the honeypot and the per-phone rate limit.
 */
export async function POST(request: Request) {
  // The offer pages post FormData; accept JSON too so anything else can use it.
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

  const name = text(form.get("first") ?? form.get("name"), 80);
  const phone = text(form.get("phone"), 30);
  const postcode = text(form.get("postcode"), 12);
  const rooms = text(form.get("rooms"), 40);

  if (name.length < 2 || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { ok: false, error: "We need a name and a phone number we can reach you on." },
      { status: 400 }
    );
  }

  const limit = await hitRateLimit("lead", phone, 3, 3600);
  if (!limit.allowed) {
    // Already have their details — say thank you rather than expose the limit.
    return NextResponse.json({ ok: true });
  }

  await createLead({
    name,
    phone,
    postcode,
    rooms,
    source: text(form.get("source"), 120),
    referrer: text(form.get("referrer") ?? request.headers.get("referer"), 200),
    landingPath: text(form.get("landing_path"), 120),
  });

  return NextResponse.json({ ok: true });
}
