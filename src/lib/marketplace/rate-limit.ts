import "server-only";
import { query, queryOne } from "./db";

/**
 * A small fixed-window counter kept in Postgres.
 *
 * In-memory limiting is useless on serverless: each instance would keep its own
 * count and an attacker simply gets one allowance per instance. This trades a
 * round trip for a limit that actually holds.
 */
export async function hitRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; count: number }> {
  const normalised = key.trim().toLowerCase().slice(0, 120) || "unknown";

  const row = await queryOne<{ count: number }>(
    `INSERT INTO rate_limits (bucket, key, window_start, count)
     VALUES ($1, $2, now(), 1)
     ON CONFLICT (bucket, key) DO UPDATE
       SET count = CASE
             WHEN rate_limits.window_start < now() - ($3 || ' seconds')::interval
             THEN 1
             ELSE rate_limits.count + 1
           END,
           window_start = CASE
             WHEN rate_limits.window_start < now() - ($3 || ' seconds')::interval
             THEN now()
             ELSE rate_limits.window_start
           END
     RETURNING count`,
    [bucket, normalised, String(windowSeconds)]
  );

  const count = row?.count ?? 1;
  return { allowed: count <= limit, count };
}

/** Housekeeping — old windows are dead weight. */
export async function pruneRateLimits(): Promise<void> {
  await query(
    `DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`
  );
}
