/**
 * Marketplace data layer.
 *
 * Production (Vercel) talks to Neon serverless Postgres over HTTP.
 * Local development falls back to PGlite — embedded Postgres in WASM writing to
 * `.data/marketplace` — so `npm run dev` works with no external database and
 * without a second SQL dialect to maintain.
 *
 * Both drivers speak the same Postgres SQL with $1 placeholders, so every query
 * in the app is written once.
 */

export type Row = Record<string, unknown>;

type Driver = {
  kind: "neon" | "pglite";
  run: (text: string, params: unknown[]) => Promise<Row[]>;
};

// Cached on globalThis so Next's dev-mode module reloading doesn't open a
// second PGlite instance against the same locked data directory.
const globalCache = globalThis as unknown as {
  __fflDriver?: Promise<Driver>;
  __fflSchema?: Promise<void>;
};

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    return {
      kind: "neon",
      run: async (text, params) =>
        (await sql.query(text, params)) as unknown as Row[],
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to the Vercel project environment."
    );
  }

  // Loaded through createRequire rather than a bundled import: Next's compiler
  // picks the browser build of PGlite, whose in-memory filesystem can't create
  // a real data directory. Going straight to node_modules gets the Node build.
  const { createRequire } = await import("node:module");
  const nodeRequire = createRequire(`${process.cwd()}/package.json`);
  const { mkdirSync } = nodeRequire("node:fs") as typeof import("node:fs");
  // The specifier is assembled at runtime so the bundler can't statically
  // rewrite this require back into a bundled (browser-build) import.
  const pgliteSpecifier = ["@electric-sql", "pglite"].join("/");
  const { PGlite } = nodeRequire(pgliteSpecifier) as {
    PGlite: new (dataDir: string) => {
      waitReady: Promise<void>;
      query: (text: string, params?: unknown[]) => Promise<{ rows: Row[] }>;
    };
  };

  const dataDir = `${process.cwd()}/.data/marketplace`;
  // PGlite won't create its own data directory. `npm run dev` creates it via the
  // predev script; this is a best-effort fallback for other entry points.
  try {
    mkdirSync(dataDir, { recursive: true });
  } catch {
    // Ignore — if the directory genuinely can't be made, PGlite reports it next.
  }
  const db = new PGlite(dataDir);
  await db.waitReady;
  return {
    kind: "pglite",
    run: async (text, params) => {
      const result = await db.query(text, params);
      return (result.rows ?? []) as Row[];
    },
  };
}

function getDriver(): Promise<Driver> {
  if (!globalCache.__fflDriver) {
    globalCache.__fflDriver = createDriver().catch((error) => {
      // Never cache a failed connection — the next request should retry.
      globalCache.__fflDriver = undefined;
      throw error;
    });
  }
  return globalCache.__fflDriver;
}

/** Run a parameterised query and get the rows back. */
export async function query<T = Row>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  await ensureSchema();
  const driver = await getDriver();
  return (await driver.run(text, params)) as T[];
}

/** Run a query expected to return at most one row. */
export async function queryOne<T = Row>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Raw query that skips the schema check — used by the migration itself. */
async function raw(text: string, params: unknown[] = []): Promise<Row[]> {
  const driver = await getDriver();
  return driver.run(text, params);
}

export function ensureSchema(): Promise<void> {
  if (!globalCache.__fflSchema) {
    globalCache.__fflSchema = migrate().catch((error) => {
      globalCache.__fflSchema = undefined;
      throw error;
    });
  }
  return globalCache.__fflSchema;
}

async function migrate(): Promise<void> {
  const { STATEMENTS, SEED } = await import("./schema");
  for (const statement of STATEMENTS) {
    await raw(statement);
  }
  for (const [text, params] of SEED) {
    await raw(text, params);
  }
}
