import { NextResponse } from "next/server";
import { listRecentBookings } from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";

/**
 * How far back the notice looks. Deliberately short: the whole claim is that
 * this is current activity, so a quiet couple of days should show nothing
 * rather than reach back for something stale to display.
 */
const RECENT_WINDOW_DAYS = 2;

/**
 * Recent bookings for the activity notice on the marketing site.
 *
 * Public, so it returns the minimum that makes the notice work: a first name,
 * a town, and how long ago. Nothing here identifies a specific person or job.
 *
 * Cached at the edge for a minute. Every visitor to the site hits this, and the
 * answer is the same for all of them — without the cache it would be a database
 * round trip per page view for a decoration.
 *
 * Never fails loudly: if the database is unreachable the notice simply doesn't
 * appear, rather than throwing errors across the marketing site.
 */
export async function GET() {
  try {
    const bookings = await listRecentBookings(RECENT_WINDOW_DAYS, 10);
    return NextResponse.json(
      { ok: true, bookings },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { ok: true, bookings: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
