import "server-only";
import { query, queryOne } from "./db";

/**
 * Roughly where an outward code is, and roughly how long it takes to drive
 * between two of them.
 *
 * Deliberately coarse. The office is choosing which of eight cleaners to ring
 * about a job, not planning a route: "CH43, about 20 minutes" answers that, and
 * a routing API's precision would cost money and a dependency for an answer
 * nobody reads to the minute.
 *
 * Coordinates come from postcodes.io (free, no key, UK-wide) and are cached in
 * the database the first time an area is seen. Outcodes do not move, so the
 * cache never needs refreshing, and after the first lookup the ranking works
 * even if postcodes.io is down.
 */

export type LatLng = { lat: number; lng: number };

const MILES_PER_DEGREE_LAT = 69.0;

/** Straight-line miles. Good to a few percent at UK latitudes. */
export function distanceMiles(a: LatLng, b: LatLng): number {
  const latMiles = (a.lat - b.lat) * MILES_PER_DEGREE_LAT;
  const meanLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const lngMiles = (a.lng - b.lng) * MILES_PER_DEGREE_LAT * Math.cos(meanLat);
  return Math.sqrt(latMiles * latMiles + lngMiles * lngMiles);
}

/**
 * Minutes behind the wheel, from straight-line miles.
 *
 * Roads are not straight: the 1.3 multiplier is the usual rule of thumb for
 * real road distance against the crow's flight. 28mph averages town driving
 * with a van, and the five minutes on top is parking and finding the door —
 * the part everyone forgets and then runs late because of.
 */
export function driveMinutes(miles: number): number {
  const roadMiles = miles * 1.3;
  const minutes = (roadMiles / 28) * 60 + 5;
  return Math.max(5, Math.round(minutes / 5) * 5);
}

export function describeTravel(miles: number): string {
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi · about ${driveMinutes(miles)} min`;
}

/**
 * Coordinates for a set of outward codes, cache first.
 *
 * A missing area is simply absent from the result: an unknown outcode means
 * "can't rank this one", never a crash on a page the office needs.
 */
export async function outcodeCoords(
  outwards: string[]
): Promise<Map<string, LatLng>> {
  const wanted = [...new Set(outwards.map((o) => o.trim().toUpperCase()).filter(Boolean))];
  const found = new Map<string, LatLng>();
  if (wanted.length === 0) return found;

  const cached = await query<{ outward: string; lat: number; lng: number }>(
    `SELECT outward, lat, lng FROM outcode_geo WHERE outward = ANY($1)`,
    [wanted]
  );
  for (const row of cached) {
    found.set(row.outward, { lat: Number(row.lat), lng: Number(row.lng) });
  }

  const missing = wanted.filter((o) => !found.has(o));
  for (const outward of missing) {
    try {
      const response = await fetch(
        `https://api.postcodes.io/outcodes/${encodeURIComponent(outward)}`,
        { cache: "no-store" }
      );
      if (!response.ok) continue;
      const data = (await response.json()) as {
        result?: { latitude?: number; longitude?: number };
      };
      const lat = Number(data.result?.latitude);
      const lng = Number(data.result?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      await query(
        `INSERT INTO outcode_geo (outward, lat, lng) VALUES ($1,$2,$3)
         ON CONFLICT (outward) DO NOTHING`,
        [outward, lat, lng]
      );
      found.set(outward, { lat, lng });
    } catch {
      // Offline, rate-limited, or an outcode postcodes.io doesn't know: that
      // cleaner simply ranks last rather than taking the page down.
    }
  }

  return found;
}

export async function outcodeCoord(outward: string): Promise<LatLng | null> {
  const map = await outcodeCoords([outward]);
  return map.get(outward.trim().toUpperCase()) ?? null;
}

/** Only used to keep the cache honest in tests and local dev. */
export async function clearOutcodeCache(): Promise<void> {
  await queryOne(`DELETE FROM outcode_geo RETURNING outward`);
}
