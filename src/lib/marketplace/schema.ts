/**
 * Marketplace schema. Every statement is idempotent so `ensureSchema()` can run
 * on any cold start without a separate migration step.
 *
 * All money is stored as integer pence — never floats.
 */

/**
 * Bump whenever STATEMENTS or SEED change. Lets a cold start skip the whole
 * migration with a single query instead of replaying every statement.
 */
export const SCHEMA_VERSION = 7;

export const STATEMENTS: string[] = [
  // ---- Platform settings (single row) -------------------------------------
  `CREATE TABLE IF NOT EXISTS settings (
     id                  int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
     commission_pct      numeric(5,2) NOT NULL DEFAULT 17.50,
     minimum_charge_pence int NOT NULL DEFAULT 9000,
     min_notice_days     int NOT NULL DEFAULT 1,
     booking_email       text NOT NULL DEFAULT 'info@freshforlesscarpetcleaning.co.uk',
     updated_at          timestamptz NOT NULL DEFAULT now()
   )`,

  // ---- National price list (admin controlled) -----------------------------
  `CREATE TABLE IF NOT EXISTS price_items (
     code             text PRIMARY KEY,
     label            text NOT NULL,
     hint             text NOT NULL DEFAULT '',
     kind             text NOT NULL DEFAULT 'carpet',
     unit_price_pence int  NOT NULL,
     max_qty          int  NOT NULL DEFAULT 10,
     sort             int  NOT NULL DEFAULT 100,
     active           boolean NOT NULL DEFAULT true
   )`,

  // Fixed-price bundles, e.g. "4 rooms for 99". Applied automatically when the
  // customer's quantity reaches the bundle size and it beats the itemised price.
  `CREATE TABLE IF NOT EXISTS price_bundles (
     id          serial PRIMARY KEY,
     item_code   text NOT NULL REFERENCES price_items(code) ON DELETE CASCADE,
     qty         int  NOT NULL,
     price_pence int  NOT NULL,
     label       text NOT NULL,
     active      boolean NOT NULL DEFAULT true
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS price_bundles_item_qty
     ON price_bundles (item_code, qty)`,

  // ---- Cleaners -----------------------------------------------------------
  `CREATE TABLE IF NOT EXISTS cleaners (
     id                 serial PRIMARY KEY,
     name               text NOT NULL,
     business_name      text NOT NULL DEFAULT '',
     email              text NOT NULL,
     phone              text NOT NULL,
     password_hash      text NOT NULL,
     status             text NOT NULL DEFAULT 'pending',
     insurance_provider text NOT NULL DEFAULT '',
     insurance_expiry   date,
     years_experience   int  NOT NULL DEFAULT 0,
     equipment          text NOT NULL DEFAULT '',
     dbs_checked        boolean NOT NULL DEFAULT false,
     admin_notes        text NOT NULL DEFAULT '',
     created_at         timestamptz NOT NULL DEFAULT now(),
     reviewed_at        timestamptz
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS cleaners_email_lower
     ON cleaners (lower(email))`,

  // Postcode coverage, stored as outward codes (the part before the space).
  `CREATE TABLE IF NOT EXISTS cleaner_areas (
     cleaner_id int  NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
     outward    text NOT NULL,
     PRIMARY KEY (cleaner_id, outward)
   )`,
  `CREATE INDEX IF NOT EXISTS cleaner_areas_outward ON cleaner_areas (outward)`,

  // Weekly availability: one row per weekday the cleaner works (0 = Sunday).
  `CREATE TABLE IF NOT EXISTS cleaner_availability (
     cleaner_id int NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
     weekday    int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
     am         boolean NOT NULL DEFAULT true,
     pm         boolean NOT NULL DEFAULT true,
     PRIMARY KEY (cleaner_id, weekday)
   )`,

  // One-off days off.
  `CREATE TABLE IF NOT EXISTS cleaner_blackouts (
     cleaner_id int  NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
     day        date NOT NULL,
     PRIMARY KEY (cleaner_id, day)
   )`,

  // ---- Jobs ---------------------------------------------------------------
  `CREATE TABLE IF NOT EXISTS jobs (
     id               serial PRIMARY KEY,
     ref              text NOT NULL UNIQUE,
     customer_name    text NOT NULL,
     customer_email   text NOT NULL,
     customer_phone   text NOT NULL,
     address_line     text NOT NULL,
     town             text NOT NULL DEFAULT '',
     postcode         text NOT NULL,
     outward          text NOT NULL,
     slot_date        date NOT NULL,
     slot_window      text NOT NULL,
     items            jsonb NOT NULL DEFAULT '[]'::jsonb,
     notes            text NOT NULL DEFAULT '',
     subtotal_pence   int NOT NULL,
     total_pence      int NOT NULL,
     commission_pct   numeric(5,2) NOT NULL,
     commission_pence int NOT NULL,
     status           text NOT NULL DEFAULT 'offered',
     cleaner_id       int REFERENCES cleaners(id) ON DELETE SET NULL,
     created_at       timestamptz NOT NULL DEFAULT now(),
     accepted_at      timestamptz,
     completed_at     timestamptz,
     cancelled_at     timestamptz,
     cancel_reason    text NOT NULL DEFAULT ''
   )`,
  `CREATE INDEX IF NOT EXISTS jobs_status ON jobs (status)`,
  `CREATE INDEX IF NOT EXISTS jobs_cleaner ON jobs (cleaner_id)`,
  `CREATE INDEX IF NOT EXISTS jobs_outward ON jobs (outward)`,

  // Broadcast record: one row per cleaner the job was offered to.
  `CREATE TABLE IF NOT EXISTS job_offers (
     id           serial PRIMARY KEY,
     job_id       int NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
     cleaner_id   int NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
     sent_at      timestamptz NOT NULL DEFAULT now(),
     response     text,
     responded_at timestamptz
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS job_offers_job_cleaner
     ON job_offers (job_id, cleaner_id)`,

  // ---- Commission invoicing ----------------------------------------------
  `CREATE TABLE IF NOT EXISTS commission_invoices (
     id           serial PRIMARY KEY,
     ref          text NOT NULL UNIQUE,
     cleaner_id   int  NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
     period_start date NOT NULL,
     period_end   date NOT NULL,
     total_pence  int  NOT NULL,
     status       text NOT NULL DEFAULT 'issued',
     issued_at    timestamptz NOT NULL DEFAULT now(),
     paid_at      timestamptz
   )`,
  `CREATE TABLE IF NOT EXISTS commission_invoice_lines (
     invoice_id   int NOT NULL REFERENCES commission_invoices(id) ON DELETE CASCADE,
     job_id       int NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
     amount_pence int NOT NULL,
     PRIMARY KEY (invoice_id, job_id)
   )`,
  // A completed job can only ever appear on one commission invoice.
  `CREATE UNIQUE INDEX IF NOT EXISTS commission_invoice_lines_job
     ON commission_invoice_lines (job_id)`,

  // Customer self-service, added after launch — idempotent ALTERs.
  `ALTER TABLE settings ADD COLUMN IF NOT EXISTS cancellation_notice_hours int NOT NULL DEFAULT 24`,
  `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cancelled_by       text    NOT NULL DEFAULT ''`,
  `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS late_cancellation  boolean NOT NULL DEFAULT false`,
  `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rescheduled_count  int     NOT NULL DEFAULT 0`,

  // Per-cleaner notification preferences. Added after launch, so these run as
  // idempotent ALTERs rather than changing the CREATE TABLE above.
  `ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS notify_sms   boolean NOT NULL DEFAULT true`,
  `ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS notify_email boolean NOT NULL DEFAULT true`,

  // Repair bundle labels seeded before the pound sign was used.
  `UPDATE price_bundles SET label = replace(label, 'GBP', '£')
     WHERE label LIKE '%GBP%'`,

  // ---- Demand in uncovered areas ------------------------------------------
  // A postcode with no cleaner is a lost customer AND the best possible signal
  // of where to recruit next, so capture it rather than showing a dead end.
  `CREATE TABLE IF NOT EXISTS coverage_requests (
     id         serial PRIMARY KEY,
     name       text NOT NULL DEFAULT '',
     email      text NOT NULL,
     phone      text NOT NULL DEFAULT '',
     postcode   text NOT NULL,
     outward    text NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS coverage_requests_outward
     ON coverage_requests (outward)`,

  // ---- One-off settings change, 2026-08-20 (commission rate) --------------
  // Requested directly: commission set to 17.5%. Runs once, on the version bump
  // above. Jobs already booked keep the rate they were quoted at, so this only
  // affects new bookings. Ongoing changes belong in /admin/prices.
  `UPDATE settings SET commission_pct = 17.50 WHERE id = 1`,

  // ---- Dropped jobs --------------------------------------------------------
  // A cleaner walking away from an accepted job is the thing most likely to
  // cost a customer, so it gets its own record rather than being inferred from
  // a status change. Notice period is stored at the moment of the drop, since
  // it can't be reconstructed afterwards.
  `CREATE TABLE IF NOT EXISTS job_drops (
     id           serial PRIMARY KEY,
     job_id       int NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
     cleaner_id   int NOT NULL REFERENCES cleaners(id) ON DELETE CASCADE,
     dropped_by   text NOT NULL DEFAULT 'cleaner',
     hours_notice numeric(8,2) NOT NULL DEFAULT 0,
     reason       text NOT NULL DEFAULT '',
     dropped_at   timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS job_drops_cleaner ON job_drops (cleaner_id)`,

  // ---- Notification outbox ------------------------------------------------
  // Written on every broadcast/allocation event. A sender picks these up; with
  // no mail provider configured they still give admin a full audit trail.
  `CREATE TABLE IF NOT EXISTS notifications (
     id         serial PRIMARY KEY,
     channel    text NOT NULL DEFAULT 'email',
     recipient  text NOT NULL,
     subject    text NOT NULL,
     body       text NOT NULL,
     job_id     int REFERENCES jobs(id) ON DELETE CASCADE,
     created_at timestamptz NOT NULL DEFAULT now(),
     sent_at    timestamptz,
     error      text
   )`,
];

/** Default national price list — admin can change every figure from /admin. */
export const SEED: [string, unknown[]][] = [
  ["INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING", []],

  ...([
    ["room", "Carpeted room", "Bedroom, lounge, dining room", "carpet", 3500, 12, 10],
    ["stairs", "Staircase", "One flight, up to 14 steps", "carpet", 3000, 3, 20],
    ["landing", "Landing", "Upstairs landing area", "carpet", 1500, 3, 30],
    ["hall", "Hallway", "Entrance hall or corridor", "carpet", 1500, 3, 40],
    ["rug", "Rug", "Any size up to 2m x 3m", "carpet", 3000, 8, 50],
    ["sofa2", "2-seater sofa", "Fabric upholstery clean", "upholstery", 6000, 4, 60],
    ["sofa3", "3-seater sofa", "Fabric upholstery clean", "upholstery", 9000, 4, 70],
    ["armchair", "Armchair", "Single fabric chair", "upholstery", 3000, 8, 80],
    ["mattress", "Mattress", "Single or double, both sides", "upholstery", 3500, 6, 90],
    ["stain", "Heavy stain treatment", "Per affected area", "extra", 1500, 10, 100],
    ["pet", "Pet odour treatment", "Per room treated", "extra", 2000, 10, 110],
  ] as const).map(
    ([code, label, hint, kind, price, maxQty, sort]) =>
      [
        `INSERT INTO price_items (code, label, hint, kind, unit_price_pence, max_qty, sort)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (code) DO NOTHING`,
        [code, label, hint, kind, price, maxQty, sort],
      ] as [string, unknown[]]
  ),

  ...([
    ["room", 3, 9900, "3 rooms for £99"],
  ] as const).map(
    ([itemCode, qty, price, label]) =>
      [
        `INSERT INTO price_bundles (item_code, qty, price_pence, label)
         VALUES ($1,$2,$3,$4) ON CONFLICT (item_code, qty) DO NOTHING`,
        [itemCode, qty, price, label],
      ] as [string, unknown[]]
  ),
];
