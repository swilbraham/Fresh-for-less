import "server-only";
import { query, queryOne } from "./db";
import { buildQuote, type Basket } from "./pricing";
import { gbpShort } from "./money";
import { outwardOf, normalisePostcode } from "./postcode";
import { isMobile, toE164 } from "./phone";
import { bookingUrl } from "./auth";
import type {
  Cleaner,
  Job,
  PriceBundle,
  PriceItem,
  Quote,
  Settings,
  SlotWindow,
} from "./types";

/**
 * Date and timestamp columns are always selected as text via to_char so the two
 * drivers (Neon over HTTP, PGlite locally) hand back the same shapes.
 */
const JOB_COLUMNS = `
  j.id, j.ref, j.customer_name, j.customer_email, j.customer_phone,
  j.address_line, j.town, j.postcode, j.outward,
  to_char(j.slot_date, 'YYYY-MM-DD')            AS slot_date,
  j.slot_window, j.items, j.notes,
  j.subtotal_pence, j.total_pence, j.commission_pct, j.commission_pence,
  j.status, j.cleaner_id,
  j.cancelled_by, j.late_cancellation, j.rescheduled_count,
  to_char(j.created_at,   'YYYY-MM-DD HH24:MI') AS created_at,
  to_char(j.accepted_at,  'YYYY-MM-DD HH24:MI') AS accepted_at,
  to_char(j.completed_at, 'YYYY-MM-DD HH24:MI') AS completed_at,
  -- Hours until the slot opens, in UK local time so BST is handled correctly.
  EXTRACT(EPOCH FROM (
    ((j.slot_date + CASE WHEN j.slot_window = 'am' THEN time '08:00' ELSE time '12:00' END)
       AT TIME ZONE 'Europe/London') - now()
  )) / 3600 AS hours_until_slot
`;

const CLEANER_COLUMNS = `
  c.id, c.name, c.business_name, c.email, c.phone, c.status,
  c.insurance_provider,
  to_char(c.insurance_expiry, 'YYYY-MM-DD') AS insurance_expiry,
  c.years_experience, c.equipment, c.dbs_checked, c.admin_notes,
  c.notify_sms, c.notify_email,
  to_char(c.created_at,  'YYYY-MM-DD HH24:MI') AS created_at,
  to_char(c.reviewed_at, 'YYYY-MM-DD HH24:MI') AS reviewed_at
`;

// ---------------------------------------------------------------- settings --

export async function getSettings(): Promise<Settings> {
  const row = await queryOne<Settings>(
    `SELECT commission_pct, minimum_charge_pence, min_notice_days, booking_email,
            cancellation_notice_hours
       FROM settings WHERE id = 1`
  );
  if (!row) throw new Error("Marketplace settings row is missing.");
  return row;
}

export async function updateSettings(input: {
  commissionPct: number;
  minimumChargePence: number;
  minNoticeDays: number;
  bookingEmail: string;
  cancellationNoticeHours: number;
}): Promise<void> {
  await query(
    `UPDATE settings
        SET commission_pct = $1, minimum_charge_pence = $2,
            min_notice_days = $3, booking_email = $4,
            cancellation_notice_hours = $5, updated_at = now()
      WHERE id = 1`,
    [
      input.commissionPct,
      input.minimumChargePence,
      input.minNoticeDays,
      input.bookingEmail,
      input.cancellationNoticeHours,
    ]
  );
}

// ------------------------------------------------------------- price list --

export async function getPriceItems(activeOnly = false): Promise<PriceItem[]> {
  return query<PriceItem>(
    `SELECT * FROM price_items ${activeOnly ? "WHERE active" : ""} ORDER BY sort, label`
  );
}

export async function getBundles(activeOnly = false): Promise<PriceBundle[]> {
  return query<PriceBundle>(
    `SELECT * FROM price_bundles ${activeOnly ? "WHERE active" : ""} ORDER BY item_code, qty`
  );
}

export async function upsertPriceItem(input: {
  code: string;
  label: string;
  hint: string;
  kind: string;
  unitPricePence: number;
  maxQty: number;
  sort: number;
  active: boolean;
}): Promise<void> {
  await query(
    `INSERT INTO price_items (code, label, hint, kind, unit_price_pence, max_qty, sort, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (code) DO UPDATE SET
       label = EXCLUDED.label, hint = EXCLUDED.hint, kind = EXCLUDED.kind,
       unit_price_pence = EXCLUDED.unit_price_pence, max_qty = EXCLUDED.max_qty,
       sort = EXCLUDED.sort, active = EXCLUDED.active`,
    [
      input.code,
      input.label,
      input.hint,
      input.kind,
      input.unitPricePence,
      input.maxQty,
      input.sort,
      input.active,
    ]
  );
}

export async function deletePriceItem(code: string): Promise<void> {
  await query(`DELETE FROM price_items WHERE code = $1`, [code]);
}

export async function upsertBundle(input: {
  itemCode: string;
  qty: number;
  pricePence: number;
  label: string;
}): Promise<void> {
  await query(
    `INSERT INTO price_bundles (item_code, qty, price_pence, label)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (item_code, qty) DO UPDATE SET
       price_pence = EXCLUDED.price_pence, label = EXCLUDED.label, active = true`,
    [input.itemCode, input.qty, input.pricePence, input.label]
  );
}

export async function deleteBundle(id: number): Promise<void> {
  await query(`DELETE FROM price_bundles WHERE id = $1`, [id]);
}

// ----------------------------------------------------------------- quoting --

/** The instant fixed price for a basket, always computed from live admin prices. */
export async function quoteBasket(basket: Basket): Promise<Quote> {
  const [settings, items, bundles] = await Promise.all([
    getSettings(),
    getPriceItems(true),
    getBundles(true),
  ]);
  return buildQuote(basket, items, bundles, {
    minimumChargePence: settings.minimum_charge_pence,
    commissionPct: Number(settings.commission_pct),
  });
}

// ---------------------------------------------------------------- cleaners --

export async function findCleanerByEmail(email: string): Promise<
  (Cleaner & { password_hash: string }) | null
> {
  return queryOne<Cleaner & { password_hash: string }>(
    `SELECT ${CLEANER_COLUMNS}, c.password_hash
       FROM cleaners c WHERE lower(c.email) = lower($1)`,
    [email]
  );
}

export async function getCleaner(id: number): Promise<Cleaner | null> {
  return queryOne<Cleaner>(
    `SELECT ${CLEANER_COLUMNS} FROM cleaners c WHERE c.id = $1`,
    [id]
  );
}

export async function createCleaner(input: {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  passwordHash: string;
  insuranceProvider: string;
  insuranceExpiry: string | null;
  yearsExperience: number;
  equipment: string;
}): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO cleaners
       (name, business_name, email, phone, password_hash,
        insurance_provider, insurance_expiry, years_experience, equipment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      input.name,
      input.businessName,
      input.email,
      input.phone,
      input.passwordHash,
      input.insuranceProvider,
      input.insuranceExpiry,
      input.yearsExperience,
      input.equipment,
    ]
  );
  return row!.id;
}

export async function listCleaners(status?: string): Promise<
  (Cleaner & { areas: number; jobs_done: number })[]
> {
  return query(
    `SELECT ${CLEANER_COLUMNS},
            (SELECT count(*)::int FROM cleaner_areas a WHERE a.cleaner_id = c.id) AS areas,
            (SELECT count(*)::int FROM jobs j
               WHERE j.cleaner_id = c.id AND j.status = 'completed')             AS jobs_done
       FROM cleaners c
      ${status ? "WHERE c.status = $1" : ""}
      ORDER BY
        CASE c.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
        c.created_at DESC`,
    status ? [status] : []
  );
}

export async function setCleanerStatus(
  id: number,
  status: string,
  adminNotes?: string
): Promise<void> {
  await query(
    `UPDATE cleaners
        SET status = $2,
            admin_notes = COALESCE($3, admin_notes),
            reviewed_at = now()
      WHERE id = $1`,
    [id, status, adminNotes ?? null]
  );
}

// ------------------------------------------------- coverage & availability --

export async function getCleanerAreas(cleanerId: number): Promise<string[]> {
  const rows = await query<{ outward: string }>(
    `SELECT outward FROM cleaner_areas WHERE cleaner_id = $1 ORDER BY outward`,
    [cleanerId]
  );
  return rows.map((r) => r.outward);
}

export async function setCleanerAreas(
  cleanerId: number,
  outwards: string[]
): Promise<void> {
  await query(`DELETE FROM cleaner_areas WHERE cleaner_id = $1`, [cleanerId]);
  for (const outward of outwards) {
    await query(
      `INSERT INTO cleaner_areas (cleaner_id, outward) VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [cleanerId, outward]
    );
  }
}

export type Availability = { weekday: number; am: boolean; pm: boolean };

export async function getAvailability(
  cleanerId: number
): Promise<Availability[]> {
  return query<Availability>(
    `SELECT weekday, am, pm FROM cleaner_availability
      WHERE cleaner_id = $1 ORDER BY weekday`,
    [cleanerId]
  );
}

export async function setAvailability(
  cleanerId: number,
  rows: Availability[]
): Promise<void> {
  await query(`DELETE FROM cleaner_availability WHERE cleaner_id = $1`, [
    cleanerId,
  ]);
  for (const row of rows) {
    if (!row.am && !row.pm) continue;
    await query(
      `INSERT INTO cleaner_availability (cleaner_id, weekday, am, pm)
       VALUES ($1,$2,$3,$4)`,
      [cleanerId, row.weekday, row.am, row.pm]
    );
  }
}

export async function getBlackouts(cleanerId: number): Promise<string[]> {
  const rows = await query<{ day: string }>(
    `SELECT to_char(day, 'YYYY-MM-DD') AS day FROM cleaner_blackouts
      WHERE cleaner_id = $1 AND day >= CURRENT_DATE ORDER BY day`,
    [cleanerId]
  );
  return rows.map((r) => r.day);
}

export async function addBlackout(
  cleanerId: number,
  day: string
): Promise<void> {
  await query(
    `INSERT INTO cleaner_blackouts (cleaner_id, day) VALUES ($1, $2::date)
     ON CONFLICT DO NOTHING`,
    [cleanerId, day]
  );
}

export async function removeBlackout(
  cleanerId: number,
  day: string
): Promise<void> {
  await query(
    `DELETE FROM cleaner_blackouts WHERE cleaner_id = $1 AND day = $2::date`,
    [cleanerId, day]
  );
}

// -------------------------------------------------------------- allocation --

/**
 * Approved cleaners who cover the postcode, work that weekday/half-day, have no
 * blackout on the date and aren't already booked into that same slot.
 */
export async function findMatchingCleaners(
  outward: string,
  slotDate: string,
  slotWindow: SlotWindow
): Promise<Cleaner[]> {
  return query<Cleaner>(
    `SELECT ${CLEANER_COLUMNS}
       FROM cleaners c
       JOIN cleaner_areas a
         ON a.cleaner_id = c.id AND a.outward = $1
       JOIN cleaner_availability av
         ON av.cleaner_id = c.id
        AND av.weekday = EXTRACT(DOW FROM $2::date)
        AND ((av.am AND $3 = 'am') OR (av.pm AND $3 = 'pm'))
      WHERE c.status = 'approved'
        AND NOT EXISTS (
          SELECT 1 FROM cleaner_blackouts b
           WHERE b.cleaner_id = c.id AND b.day = $2::date
        )
        AND NOT EXISTS (
          SELECT 1 FROM jobs j
           WHERE j.cleaner_id = c.id
             AND j.slot_date = $2::date
             AND j.slot_window = $3
             AND j.status IN ('accepted','completed')
        )
      ORDER BY c.id`,
    [outward, slotDate, slotWindow]
  );
}

/** Is anyone at all covering this postcode? Used before taking a booking. */
export async function hasCoverage(outward: string): Promise<boolean> {
  const row = await queryOne<{ n: number }>(
    `SELECT count(*)::int AS n
       FROM cleaner_areas a JOIN cleaners c ON c.id = a.cleaner_id
      WHERE a.outward = $1 AND c.status = 'approved'`,
    [outward]
  );
  return (row?.n ?? 0) > 0;
}

const REF_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479";

function makeRef(prefix: string): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return `${prefix}-${out}`;
}

export type BookingInput = {
  basket: Basket;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine: string;
  town: string;
  postcode: string;
  slotDate: string;
  slotWindow: SlotWindow;
  notes: string;
};

export type BookingResult = {
  job: Job;
  quote: Quote;
  offered: number;
};

/**
 * Create the job at the quoted fixed price and broadcast it to every matching
 * cleaner. The price is recomputed here from the live price list — the browser's
 * figure is only ever a display value.
 */
export async function createBooking(
  input: BookingInput
): Promise<BookingResult> {
  const postcode = normalisePostcode(input.postcode);
  if (!postcode) throw new Error("That postcode doesn't look right.");
  const outward = outwardOf(postcode)!;

  const quote = await quoteBasket(input.basket);
  if (quote.total_pence <= 0) {
    throw new Error("Choose at least one item to clean.");
  }

  let job: Job | null = null;
  for (let attempt = 0; attempt < 5 && !job; attempt++) {
    try {
      job = await queryOne<Job>(
        `INSERT INTO jobs
           (ref, customer_name, customer_email, customer_phone, address_line, town,
            postcode, outward, slot_date, slot_window, items, notes,
            subtotal_pence, total_pence, commission_pct, commission_pence, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::date,$10,$11::jsonb,$12,$13,$14,$15,$16,'offered')
         RETURNING id, ref`,
        [
          makeRef("FFL"),
          input.customerName,
          input.customerEmail,
          input.customerPhone,
          input.addressLine,
          input.town,
          postcode,
          outward,
          input.slotDate,
          input.slotWindow,
          JSON.stringify(quote.lines),
          input.notes,
          quote.subtotal_pence,
          quote.total_pence,
          quote.commission_pct,
          quote.commission_pence,
        ]
      );
    } catch (error) {
      const message = String((error as Error)?.message ?? "");
      if (!message.includes("jobs_ref_key") && !message.includes("duplicate")) {
        throw error;
      }
    }
  }
  if (!job) throw new Error("Could not create the booking. Please try again.");

  const offered = await broadcastJob(job.id, outward, input.slotDate, input.slotWindow);
  const saved = (await getJob(job.id))!;

  const manageLink = bookingUrl(saved.ref, siteUrl());
  await notifyCustomer(saved, {
    subject: `Booking received — ${saved.ref}`,
    body:
      `Thanks ${saved.customer_name}, your carpet clean is booked.\n\n` +
      `Reference: ${saved.ref}\n` +
      `Date: ${saved.slot_date} (${saved.slot_window === "am" ? "Morning 8am-12pm" : "Afternoon 12pm-5pm"})\n` +
      `Address: ${saved.address_line}, ${saved.postcode}\n` +
      `Fixed price: ${gbpShort(saved.total_pence)}, payable to your cleaner on the day.\n\n` +
      `We're matching you with a vetted cleaner now and will confirm their details ` +
      `as soon as the job is claimed.\n\n` +
      `Need to change or cancel? Use this link any time:\n${manageLink}`,
    smsBody:
      `Booking ${saved.ref} confirmed for ${saved.slot_date} ` +
      `${saved.slot_window.toUpperCase()}, ${gbpShort(saved.total_pence)}. ` +
      `Change or cancel: ${manageLink}`,
    jobId: saved.id,
  });

  return { job: saved, quote, offered };
}

/** Offer the job to every matching cleaner at once — first to accept wins. */
export async function broadcastJob(
  jobId: number,
  outward: string,
  slotDate: string,
  slotWindow: SlotWindow
): Promise<number> {
  const matches = await findMatchingCleaners(outward, slotDate, slotWindow);
  const job = await getJob(jobId);
  if (!job) return 0;

  for (const cleaner of matches) {
    await query(
      `INSERT INTO job_offers (job_id, cleaner_id) VALUES ($1,$2)
       ON CONFLICT (job_id, cleaner_id) DO NOTHING`,
      [jobId, cleaner.id]
    );
    const items = job.items.map((line) => `${line.qty}x ${line.label}`).join(", ");
    const youKeep = gbpShort(job.total_pence - job.commission_pence);

    await notifyCleaner(cleaner, {
      subject: `New job available — ${job.postcode} on ${job.slot_date} (${gbpShort(job.total_pence)})`,
      body:
        `${cleaner.name}, a new job is up for grabs in ${job.outward}.\n\n` +
        `Date: ${job.slot_date} (${job.slot_window.toUpperCase()})\n` +
        `Job: ${items}\n` +
        `Job value: ${gbpShort(job.total_pence)}\n` +
        `Commission: ${gbpShort(job.commission_pence)} — you keep ${youKeep}\n\n` +
        `First to accept gets it — open your dashboard at ${siteUrl()}/pro/dashboard.`,
      // Kept short and front-loaded: it has to be readable in a lock-screen preview.
      smsBody:
        `New job ${job.outward}, ${job.slot_date} ${job.slot_window.toUpperCase()}. ` +
        `${gbpShort(job.total_pence)}, you keep ${youKeep}. ` +
        `First to accept wins: ${siteUrl()}/pro/dashboard`,
      jobId,
    });
  }

  if (matches.length === 0) {
    await query(
      `UPDATE jobs SET status = 'unfilled' WHERE id = $1 AND status = 'offered'`,
      [jobId]
    );
  }

  return matches.length;
}

/**
 * First-to-accept-wins. The conditional UPDATE is the whole race: only one
 * concurrent request can move the job out of 'offered', so a second acceptance
 * updates zero rows and is told the job has gone.
 */
export async function acceptJob(
  jobId: number,
  cleanerId: number
): Promise<{ ok: boolean; reason?: string }> {
  const offer = await queryOne<{ id: number }>(
    `SELECT id FROM job_offers WHERE job_id = $1 AND cleaner_id = $2`,
    [jobId, cleanerId]
  );
  if (!offer) return { ok: false, reason: "This job wasn't offered to you." };

  const won = await query<{ id: number }>(
    `UPDATE jobs
        SET status = 'accepted', cleaner_id = $2, accepted_at = now()
      WHERE id = $1 AND status = 'offered' AND cleaner_id IS NULL
      RETURNING id`,
    [jobId, cleanerId]
  );

  if (won.length === 0) {
    // The update lost the race — but not necessarily to someone else. A double
    // click, or a retry after the dashboard refreshed, lands here too, so work
    // out what actually happened before blaming another cleaner.
    const current = await getJob(jobId);
    if (current?.cleaner_id === cleanerId) {
      return { ok: true };
    }
    if (current?.status === "cancelled") {
      return { ok: false, reason: "That booking has been cancelled." };
    }
    return { ok: false, reason: "Another cleaner accepted this job first." };
  }

  await query(
    `UPDATE job_offers SET response = 'accepted', responded_at = now()
      WHERE job_id = $1 AND cleaner_id = $2`,
    [jobId, cleanerId]
  );

  const job = await getJob(jobId);
  const cleaner = await getCleaner(cleanerId);
  if (job && cleaner) {
    await notify({
      recipient: job.customer_email,
      subject: `Your carpet clean is confirmed — ${job.ref}`,
      body:
        `Good news ${job.customer_name}, ${cleaner.business_name || cleaner.name} ` +
        `has accepted your booking for ${job.slot_date} (${job.slot_window.toUpperCase()}).\n\n` +
        `Fixed price: ${gbpShort(job.total_pence)}, payable to your cleaner on the day.\n` +
        `Any questions, quote reference ${job.ref}.`,
      jobId,
    });
  }

  return { ok: true };
}

export async function declineJob(
  jobId: number,
  cleanerId: number
): Promise<void> {
  await query(
    `UPDATE job_offers SET response = 'declined', responded_at = now()
      WHERE job_id = $1 AND cleaner_id = $2 AND response IS NULL`,
    [jobId, cleanerId]
  );

  // If every cleaner it went to has now declined, flag it for admin.
  const outstanding = await queryOne<{ n: number }>(
    `SELECT count(*)::int AS n FROM job_offers
      WHERE job_id = $1 AND response IS NULL`,
    [jobId]
  );
  if ((outstanding?.n ?? 0) === 0) {
    await query(
      `UPDATE jobs SET status = 'unfilled' WHERE id = $1 AND status = 'offered'`,
      [jobId]
    );
  }
}

export async function completeJob(
  jobId: number,
  cleanerId: number
): Promise<{ ok: boolean; reason?: string }> {
  const done = await query<{ id: number }>(
    `UPDATE jobs
        SET status = 'completed', completed_at = now()
      WHERE id = $1 AND cleaner_id = $2 AND status = 'accepted'
      RETURNING id`,
    [jobId, cleanerId]
  );
  if (done.length === 0) {
    const current = await getJob(jobId);
    // Already completed by this cleaner — treat a repeat click as success.
    if (current?.cleaner_id === cleanerId && current.status === "completed") {
      return { ok: true };
    }
    return { ok: false, reason: "That job isn't yours to complete." };
  }
  return { ok: true };
}

export async function cancelJob(
  jobId: number,
  reason: string
): Promise<void> {
  await query(
    `UPDATE jobs
        SET status = 'cancelled', cancelled_at = now(), cancel_reason = $2
      WHERE id = $1 AND status IN ('offered','accepted','unfilled')`,
    [jobId, reason]
  );
}

/** Put an unfilled or cancelled job back out to the market. */
export async function rebroadcastJob(jobId: number): Promise<number> {
  const job = await getJob(jobId);
  if (!job) return 0;
  await query(
    `UPDATE jobs
        SET status = 'offered', cleaner_id = NULL, accepted_at = NULL,
            cancelled_at = NULL, cancel_reason = ''
      WHERE id = $1`,
    [jobId]
  );
  await query(`DELETE FROM job_offers WHERE job_id = $1`, [jobId]);
  return broadcastJob(jobId, job.outward, job.slot_date, job.slot_window);
}

// -------------------------------------------------------------------- jobs --

export async function getJob(id: number): Promise<Job | null> {
  return queryOne<Job>(`SELECT ${JOB_COLUMNS} FROM jobs j WHERE j.id = $1`, [id]);
}

export async function getJobByRef(ref: string): Promise<Job | null> {
  return queryOne<Job>(`SELECT ${JOB_COLUMNS} FROM jobs j WHERE j.ref = $1`, [
    ref,
  ]);
}

/** Live offers a cleaner can still accept. */
export async function listOffersForCleaner(cleanerId: number): Promise<Job[]> {
  return query<Job>(
    `SELECT ${JOB_COLUMNS}
       FROM jobs j
       JOIN job_offers o ON o.job_id = j.id AND o.cleaner_id = $1
      WHERE j.status = 'offered'
        AND o.response IS NULL
        AND j.slot_date >= CURRENT_DATE
      ORDER BY j.slot_date, j.slot_window`,
    [cleanerId]
  );
}

export async function listJobsForCleaner(
  cleanerId: number,
  statuses: string[]
): Promise<Job[]> {
  return query<Job>(
    `SELECT ${JOB_COLUMNS}
       FROM jobs j
      WHERE j.cleaner_id = $1 AND j.status = ANY($2)
      ORDER BY j.slot_date DESC, j.slot_window`,
    [cleanerId, statuses]
  );
}

export async function listJobs(status?: string): Promise<
  (Job & { cleaner_name: string | null; offers: number })[]
> {
  return query(
    `SELECT ${JOB_COLUMNS},
            c.name AS cleaner_name,
            (SELECT count(*)::int FROM job_offers o WHERE o.job_id = j.id) AS offers
       FROM jobs j
       LEFT JOIN cleaners c ON c.id = j.cleaner_id
      ${status ? "WHERE j.status = $1" : ""}
      ORDER BY j.created_at DESC
      LIMIT 300`,
    status ? [status] : []
  );
}

// ------------------------------------------------------------- commissions --

/** Completed jobs not yet on any commission invoice. */
export async function listUninvoicedCommission(): Promise<
  { cleaner_id: number; cleaner_name: string; jobs: number; total_pence: number }[]
> {
  return query(
    `SELECT j.cleaner_id,
            c.name AS cleaner_name,
            count(*)::int AS jobs,
            sum(j.commission_pence)::int AS total_pence
       FROM jobs j
       JOIN cleaners c ON c.id = j.cleaner_id
      WHERE j.status = 'completed'
        AND NOT EXISTS (
          SELECT 1 FROM commission_invoice_lines l WHERE l.job_id = j.id
        )
      GROUP BY j.cleaner_id, c.name
      ORDER BY sum(j.commission_pence) DESC`
  );
}

/**
 * Raise one commission invoice per cleaner covering every completed job that
 * isn't already invoiced. The unique index on lines.job_id makes double-billing
 * impossible even if this is run twice.
 */
export async function generateCommissionInvoices(
  periodStart: string,
  periodEnd: string
): Promise<number> {
  const pending = await listUninvoicedCommission();
  let created = 0;

  for (const group of pending) {
    const jobs = await query<{ id: number; commission_pence: number }>(
      `SELECT j.id, j.commission_pence
         FROM jobs j
        WHERE j.status = 'completed' AND j.cleaner_id = $1
          AND NOT EXISTS (
            SELECT 1 FROM commission_invoice_lines l WHERE l.job_id = j.id
          )`,
      [group.cleaner_id]
    );
    if (jobs.length === 0) continue;

    const total = jobs.reduce((sum, j) => sum + j.commission_pence, 0);
    const invoice = await queryOne<{ id: number }>(
      `INSERT INTO commission_invoices
         (ref, cleaner_id, period_start, period_end, total_pence)
       VALUES ($1,$2,$3::date,$4::date,$5) RETURNING id`,
      [makeRef("CI"), group.cleaner_id, periodStart, periodEnd, total]
    );

    for (const job of jobs) {
      await query(
        `INSERT INTO commission_invoice_lines (invoice_id, job_id, amount_pence)
         VALUES ($1,$2,$3) ON CONFLICT (job_id) DO NOTHING`,
        [invoice!.id, job.id, job.commission_pence]
      );
    }
    created += 1;
  }

  return created;
}

export type InvoiceRow = {
  id: number;
  ref: string;
  cleaner_id: number;
  cleaner_name: string;
  period_start: string;
  period_end: string;
  total_pence: number;
  status: string;
  issued_at: string;
  paid_at: string | null;
  jobs: number;
};

export async function listInvoices(cleanerId?: number): Promise<InvoiceRow[]> {
  return query<InvoiceRow>(
    `SELECT i.id, i.ref, i.cleaner_id, c.name AS cleaner_name,
            to_char(i.period_start, 'YYYY-MM-DD') AS period_start,
            to_char(i.period_end,   'YYYY-MM-DD') AS period_end,
            i.total_pence, i.status,
            to_char(i.issued_at, 'YYYY-MM-DD') AS issued_at,
            to_char(i.paid_at,   'YYYY-MM-DD') AS paid_at,
            (SELECT count(*)::int FROM commission_invoice_lines l
              WHERE l.invoice_id = i.id) AS jobs
       FROM commission_invoices i
       JOIN cleaners c ON c.id = i.cleaner_id
      ${cleanerId ? "WHERE i.cleaner_id = $1" : ""}
      ORDER BY i.issued_at DESC`,
    cleanerId ? [cleanerId] : []
  );
}

export async function setInvoiceStatus(
  id: number,
  status: "issued" | "paid"
): Promise<void> {
  await query(
    `UPDATE commission_invoices
        SET status = $2, paid_at = CASE WHEN $2 = 'paid' THEN now() ELSE NULL END
      WHERE id = $1`,
    [id, status]
  );
}

// ----------------------------------------------------------- notifications --

/** Public base URL, used to build tappable links inside SMS. */
function siteUrl(): string {
  const explicit = process.env.MARKETPLACE_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // On a Vercel preview build there's no custom domain, so links must point at
  // the deployment itself or they'd send testers to the live site.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://www.freshforlesscarpetcleaning.co.uk";
}

/**
 * Every message the platform sends is written here first, then delivered if the
 * relevant provider is configured. With no provider it's still a complete audit
 * trail in /admin, so nothing is silently lost.
 */
export async function notify(input: {
  recipient: string;
  subject: string;
  body: string;
  jobId?: number;
  channel?: "email" | "sms";
}): Promise<void> {
  const channel = input.channel ?? "email";
  const row = await queryOne<{ id: number }>(
    `INSERT INTO notifications (channel, recipient, subject, body, job_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [channel, input.recipient, input.subject, input.body, input.jobId ?? null]
  );
  if (!row) return;

  try {
    const delivered =
      channel === "sms"
        ? await sendSms(input.recipient, input.body)
        : await sendEmail(input.recipient, input.subject, input.body);
    if (delivered) {
      await query(`UPDATE notifications SET sent_at = now() WHERE id = $1`, [
        row.id,
      ]);
    }
  } catch (error) {
    await query(`UPDATE notifications SET error = $2 WHERE id = $1`, [
      row.id,
      String((error as Error)?.message ?? error).slice(0, 500),
    ]);
  }
}

/** Returns false (not an error) when no mail provider is configured. */
async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  // RESEND_FROM is the name used elsewhere in Simon's projects — accept either
  // so existing credentials can be copied across without renaming.
  const from = process.env.MARKETPLACE_FROM_EMAIL ?? process.env.RESEND_FROM;
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text: body }),
  });
  if (!response.ok) throw new Error(await response.text());
  return true;
}

/** Returns false (not an error) when Twilio isn't configured. */
async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  // TWILIO_SMS_FROM / TWILIO_PHONE_NUMBER are the names used elsewhere in
  // Simon's projects — accept any of them.
  const from =
    process.env.TWILIO_FROM_NUMBER ??
    process.env.TWILIO_SMS_FROM ??
    process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) return false;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }),
    }
  );
  if (!response.ok) throw new Error(await response.text());
  return true;
}

/**
 * Send to one cleaner across whichever channels they've opted into. SMS is the
 * channel that matters for job offers — first-to-accept means delivery speed
 * decides who gets the work — so it goes first and email backs it up.
 */
export async function notifyCleaner(
  cleaner: Pick<Cleaner, "id" | "email" | "phone" | "notify_sms" | "notify_email">,
  input: { subject: string; body: string; smsBody?: string; jobId?: number }
): Promise<void> {
  const mobile = toE164(cleaner.phone);
  if (cleaner.notify_sms && mobile && isMobile(cleaner.phone)) {
    await notify({
      channel: "sms",
      recipient: mobile,
      subject: input.subject,
      body: input.smsBody ?? input.body,
      jobId: input.jobId,
    });
  }
  if (cleaner.notify_email) {
    await notify({
      channel: "email",
      recipient: cleaner.email,
      subject: input.subject,
      body: input.body,
      jobId: input.jobId,
    });
  }
}

/**
 * Transactional messages to a customer about their own booking. Always sent —
 * these are the receipt and the manage link, not marketing.
 */
export async function notifyCustomer(
  job: Pick<Job, "customer_email" | "customer_phone">,
  input: { subject: string; body: string; smsBody?: string; jobId?: number }
): Promise<void> {
  const mobile = toE164(job.customer_phone);
  if (mobile && isMobile(job.customer_phone) && input.smsBody) {
    await notify({
      channel: "sms",
      recipient: mobile,
      subject: input.subject,
      body: input.smsBody,
      jobId: input.jobId,
    });
  }
  await notify({
    channel: "email",
    recipient: job.customer_email,
    subject: input.subject,
    body: input.body,
    jobId: input.jobId,
  });
}

export async function setNotificationPrefs(
  cleanerId: number,
  prefs: { sms: boolean; email: boolean }
): Promise<void> {
  await query(
    `UPDATE cleaners SET notify_sms = $2, notify_email = $3 WHERE id = $1`,
    [cleanerId, prefs.sms, prefs.email]
  );
}

export async function listNotifications(limit = 50) {
  return query<{
    id: number;
    channel: string;
    recipient: string;
    subject: string;
    created_at: string;
    sent_at: string | null;
    error: string | null;
  }>(
    `SELECT id, channel, recipient, subject,
            to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
            to_char(sent_at,    'YYYY-MM-DD HH24:MI') AS sent_at,
            error
       FROM notifications ORDER BY id DESC LIMIT $1`,
    [limit]
  );
}

// -------------------------------------------------------------- open slots --

export type OpenSlot = { day: string; am: boolean; pm: boolean };

/**
 * Which half-days in the booking window actually have a cleaner free in this
 * postcode. One query over generate_series rather than a request per date, so
 * the customer is never offered a slot nobody can fill.
 */
export async function getOpenSlots(
  outward: string,
  fromDays: number,
  toDays: number,
  excludeJobId?: number
): Promise<OpenSlot[]> {
  const available = (window: "am" | "pm") => `
    EXISTS (
      SELECT 1
        FROM cleaners c
        JOIN cleaner_areas a  ON a.cleaner_id = c.id AND a.outward = $1
        JOIN cleaner_availability av
          ON av.cleaner_id = c.id
         AND av.weekday = EXTRACT(DOW FROM d.day)
         AND av.${window}
       WHERE c.status = 'approved'
         AND NOT EXISTS (
           SELECT 1 FROM cleaner_blackouts b
            WHERE b.cleaner_id = c.id AND b.day = d.day
         )
         AND NOT EXISTS (
           SELECT 1 FROM jobs j
            WHERE j.cleaner_id = c.id AND j.slot_date = d.day
              AND j.slot_window = '${window}'
              AND j.status IN ('accepted','completed')
              AND ($4::int IS NULL OR j.id <> $4::int)
         )
    ) AS ${window}`;

  return query<OpenSlot>(
    `WITH days AS (
       SELECT generate_series(
         CURRENT_DATE + ($2::int),
         CURRENT_DATE + ($3::int),
         interval '1 day'
       )::date AS day
     )
     SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
            ${available("am")},
            ${available("pm")}
       FROM days d
      ORDER BY d.day`,
    [outward, fromDays, toDays, excludeJobId ?? null]
  );
}

// ------------------------------------------------------------ admin stats --

export type AdminStats = {
  cleaners_pending: number;
  cleaners_approved: number;
  jobs_live: number;
  jobs_unfilled: number;
  jobs_completed: number;
  gmv_pence: number;
  commission_pence: number;
  commission_unpaid_pence: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const row = await queryOne<AdminStats>(
    `SELECT
       (SELECT count(*)::int FROM cleaners WHERE status = 'pending')   AS cleaners_pending,
       (SELECT count(*)::int FROM cleaners WHERE status = 'approved')  AS cleaners_approved,
       (SELECT count(*)::int FROM jobs WHERE status IN ('offered','accepted')) AS jobs_live,
       (SELECT count(*)::int FROM jobs WHERE status = 'unfilled')      AS jobs_unfilled,
       (SELECT count(*)::int FROM jobs WHERE status = 'completed')     AS jobs_completed,
       (SELECT COALESCE(sum(total_pence),0)::int      FROM jobs WHERE status = 'completed') AS gmv_pence,
       (SELECT COALESCE(sum(commission_pence),0)::int FROM jobs WHERE status = 'completed') AS commission_pence,
       (SELECT COALESCE(sum(total_pence),0)::int      FROM commission_invoices WHERE status = 'issued') AS commission_unpaid_pence`
  );
  return row!;
}

// -------------------------------------------- customer self-service --------

/** Is this cleaner free to take that half-day, ignoring one job if given? */
export async function isCleanerFreeAt(
  cleanerId: number,
  slotDate: string,
  slotWindow: SlotWindow,
  excludeJobId?: number
): Promise<boolean> {
  const row = await queryOne<{ free: boolean }>(
    `SELECT EXISTS (
       SELECT 1
         FROM cleaners c
         JOIN cleaner_availability av
           ON av.cleaner_id = c.id
          AND av.weekday = EXTRACT(DOW FROM $2::date)
          AND ((av.am AND $3 = 'am') OR (av.pm AND $3 = 'pm'))
        WHERE c.id = $1
          AND c.status = 'approved'
          AND NOT EXISTS (
            SELECT 1 FROM cleaner_blackouts b
             WHERE b.cleaner_id = c.id AND b.day = $2::date
          )
          AND NOT EXISTS (
            SELECT 1 FROM jobs j
             WHERE j.cleaner_id = c.id
               AND j.slot_date = $2::date
               AND j.slot_window = $3
               AND j.status IN ('accepted','completed')
               AND ($4::int IS NULL OR j.id <> $4::int)
          )
     ) AS free`,
    [cleanerId, slotDate, slotWindow, excludeJobId ?? null]
  );
  return row?.free ?? false;
}

export type RescheduleResult = {
  ok: boolean;
  reason?: string;
  keptCleaner: boolean;
  offered: number;
};

/**
 * Move a booking to a new half-day.
 *
 * The assigned cleaner keeps the job when they're free at the new time —
 * continuity is better for both sides. If they can't make it, the job is
 * released back to the market and re-broadcast rather than silently dropped.
 */
export async function rescheduleJob(
  jobId: number,
  slotDate: string,
  slotWindow: SlotWindow
): Promise<RescheduleResult> {
  const job = await getJob(jobId);
  if (!job) return { ok: false, reason: "Booking not found.", keptCleaner: false, offered: 0 };
  if (job.status === "completed" || job.status === "cancelled") {
    return {
      ok: false,
      reason: "This booking can no longer be changed.",
      keptCleaner: false,
      offered: 0,
    };
  }
  if (job.slot_date === slotDate && job.slot_window === slotWindow) {
    return { ok: false, reason: "That's already your slot.", keptCleaner: false, offered: 0 };
  }

  const previousCleanerId = job.cleaner_id;
  const keepCleaner =
    previousCleanerId !== null &&
    (await isCleanerFreeAt(previousCleanerId, slotDate, slotWindow, jobId));

  await query(
    `UPDATE jobs
        SET slot_date = $2::date,
            slot_window = $3,
            rescheduled_count = rescheduled_count + 1
      WHERE id = $1`,
    [jobId, slotDate, slotWindow]
  );

  const moved = (await getJob(jobId))!;
  const when = `${moved.slot_date} (${slotWindow.toUpperCase()})`;

  if (keepCleaner && previousCleanerId !== null) {
    const cleaner = await getCleaner(previousCleanerId);
    if (cleaner) {
      await notifyCleaner(cleaner, {
        subject: `Job moved — ${moved.ref} is now ${when}`,
        body:
          `${cleaner.name}, ${moved.customer_name} has moved booking ${moved.ref}.\n\n` +
          `New date: ${when}\n` +
          `Address: ${moved.address_line}, ${moved.postcode}\n` +
          `Value: ${gbpShort(moved.total_pence)}\n\n` +
          `You were free, so the job is still yours. Your diary is already updated.`,
        smsBody: `Job ${moved.ref} moved to ${when}. Still yours — diary updated.`,
        jobId,
      });
    }
    return { ok: true, keptCleaner: true, offered: 0 };
  }

  // The assigned cleaner can't make the new slot — release and re-broadcast.
  if (previousCleanerId !== null) {
    const cleaner = await getCleaner(previousCleanerId);
    if (cleaner) {
      await notifyCleaner(cleaner, {
        subject: `Job released — ${moved.ref} moved to a time you're not free`,
        body:
          `${cleaner.name}, ${moved.customer_name} has moved booking ${moved.ref} to ${when}.\n\n` +
          `You're not available then, so the job has gone back out to other cleaners ` +
          `and has been removed from your diary.`,
        smsBody: `Job ${moved.ref} moved to ${when} — you're not free, so it's back out to other cleaners.`,
        jobId,
      });
    }
  }

  await query(
    `UPDATE jobs
        SET status = 'offered', cleaner_id = NULL, accepted_at = NULL
      WHERE id = $1`,
    [jobId]
  );
  await query(`DELETE FROM job_offers WHERE job_id = $1`, [jobId]);

  const offered = await broadcastJob(jobId, moved.outward, slotDate, slotWindow);
  return { ok: true, keptCleaner: false, offered };
}

/**
 * Customer-initiated cancellation. Always allowed — refusing to let someone
 * cancel online just moves the call to the office — but anything inside the
 * admin-set notice period is flagged as late so it can be seen and dealt with.
 */
export async function cancelJobByCustomer(
  jobId: number,
  reason: string
): Promise<{ ok: boolean; reason?: string; late: boolean }> {
  const job = await getJob(jobId);
  if (!job) return { ok: false, reason: "Booking not found.", late: false };
  if (job.status === "completed") {
    return { ok: false, reason: "This job has already been done.", late: false };
  }
  if (job.status === "cancelled") {
    return { ok: false, reason: "This booking is already cancelled.", late: false };
  }

  const settings = await getSettings();
  const late = Number(job.hours_until_slot) < settings.cancellation_notice_hours;

  await query(
    `UPDATE jobs
        SET status = 'cancelled', cancelled_at = now(),
            cancel_reason = $2, cancelled_by = 'customer',
            late_cancellation = $3
      WHERE id = $1`,
    [jobId, reason.slice(0, 200) || "Cancelled by customer", late]
  );

  if (job.cleaner_id) {
    const cleaner = await getCleaner(job.cleaner_id);
    if (cleaner) {
      const notice = late
        ? `This is short notice — under ${settings.cancellation_notice_hours} hours before the slot.`
        : `You have the slot back with plenty of notice.`;
      await notifyCleaner(cleaner, {
        subject: `Cancelled — ${job.ref} on ${job.slot_date} (${job.slot_window.toUpperCase()})`,
        body:
          `${cleaner.name}, ${job.customer_name} has cancelled booking ${job.ref} ` +
          `for ${job.slot_date} (${job.slot_window.toUpperCase()}).\n\n` +
          `${notice}\n` +
          `${reason ? `Reason given: ${reason}\n` : ""}` +
          `\nNo commission is due on a cancelled job. Your diary is already updated.`,
        smsBody:
          `CANCELLED: ${job.ref}, ${job.slot_date} ${job.slot_window.toUpperCase()}. ` +
          `${late ? "Short notice. " : ""}Slot is free again.`,
        jobId,
      });
    }
  }

  return { ok: true, late };
}

// -------------------------------------------------- demand in dead zones --

/**
 * Someone wanted a clean somewhere we don't cover. Keep the lead and the
 * postcode: it's a customer to call back and a recruitment target.
 */
export async function recordCoverageRequest(input: {
  name: string;
  email: string;
  phone: string;
  postcode: string;
}): Promise<void> {
  const postcode = normalisePostcode(input.postcode) ?? input.postcode.toUpperCase();
  const outward = outwardOf(postcode);
  if (!outward) throw new Error("That postcode doesn't look right.");

  await query(
    `INSERT INTO coverage_requests (name, email, phone, postcode, outward)
     VALUES ($1,$2,$3,$4,$5)`,
    [input.name, input.email, input.phone, postcode, outward]
  );

  const settings = await getSettings();
  await notify({
    recipient: settings.booking_email,
    subject: `Wanted: a cleaner in ${outward}`,
    body:
      `${input.name || "Someone"} tried to book in ${postcode} but no cleaner ` +
      `covers ${outward}.\n\n` +
      `Email: ${input.email}\nPhone: ${input.phone || "not given"}\n\n` +
      `Either recruit in ${outward} or call them back and cover it yourself.`,
  });
}

export type CoverageDemand = {
  outward: string;
  requests: number;
  latest: string;
};

/** Uncovered postcode areas ranked by how many customers asked for them. */
export async function listCoverageDemand(limit = 20): Promise<CoverageDemand[]> {
  return query<CoverageDemand>(
    `SELECT r.outward,
            count(*)::int AS requests,
            to_char(max(r.created_at), 'YYYY-MM-DD') AS latest
       FROM coverage_requests r
      WHERE NOT EXISTS (
        SELECT 1 FROM cleaner_areas a
          JOIN cleaners c ON c.id = a.cleaner_id
         WHERE a.outward = r.outward AND c.status = 'approved'
      )
      GROUP BY r.outward
      ORDER BY count(*) DESC, max(r.created_at) DESC
      LIMIT $1`,
    [limit]
  );
}
