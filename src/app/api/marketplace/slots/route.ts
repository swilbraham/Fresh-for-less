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
    // Nobody covers this postcode, so there's no real availability to offer.
    // Still give the customer the whole booking flow with generic dates: a
    // provisional booking with a date and a basket is worth far more than a
    // dead end, both to them and as something to recruit against.
    const slots = [];
    for (
      let day = settings.min_notice_days;
      day <= settings.min_notice_days + BOOKING_WINDOW_DAYS;
      day++
    ) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + day);
      slots.push({
        day: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
        am: true,
        pm: true,
      });
    }

    return NextResponse.json({
      ok: true,
      outward,
      covered: false,
      provisional: true,
      slots,
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
