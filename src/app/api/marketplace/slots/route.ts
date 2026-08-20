import { NextResponse } from "next/server";
import { getOpenSlots, getSettings, hasCoverage } from "@/lib/marketplace/repo";
import { outwardOf } from "@/lib/marketplace/postcode";

export const dynamic = "force-dynamic";

const BOOKING_WINDOW_DAYS = 27;

/** Half-days a cleaner is actually free in this postcode. */
export async function GET(request: Request) {
  const postcode = new URL(request.url).searchParams.get("postcode") ?? "";
  const outward = outwardOf(postcode);

  if (!outward) {
    return NextResponse.json(
      { ok: false, error: "Enter a full UK postcode, e.g. CH41 5AB." },
      { status: 400 }
    );
  }

  const [covered, settings] = await Promise.all([
    hasCoverage(outward),
    getSettings(),
  ]);

  if (!covered) {
    return NextResponse.json({
      ok: true,
      outward,
      covered: false,
      slots: [],
    });
  }

  const slots = await getOpenSlots(
    outward,
    settings.min_notice_days,
    settings.min_notice_days + BOOKING_WINDOW_DAYS
  );

  return NextResponse.json({
    ok: true,
    outward,
    covered: true,
    slots: slots.filter((s) => s.am || s.pm),
  });
}
