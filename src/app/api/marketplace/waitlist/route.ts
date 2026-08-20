import { NextResponse } from "next/server";
import { recordCoverageRequest } from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";

function text(value: unknown, max = 200): string {
  return String(value ?? "").trim().slice(0, max);
}

/** Captures a lead when nobody covers the customer's postcode. */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const name = text(payload.name, 80);
  const email = text(payload.email, 120);
  const phone = text(payload.phone, 30);
  const postcode = text(payload.postcode, 12);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    await recordCoverageRequest({ name, email, phone, postcode });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String((error as Error)?.message ?? "Couldn't save that.") },
      { status: 400 }
    );
  }
}
