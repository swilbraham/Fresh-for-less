import "server-only";
import { query, queryOne } from "./db";
import { buildQuote, type Basket } from "./pricing";
import { gbpShort } from "./money";
import { outwardOf, normalisePostcode } from "./postcode";
import { isMobile, toE164 } from "./phone";
import { bookingUrl } from "./auth";
import { COMMISSION_TERMS_SHORT } from "./terms";
import { firstName } from "./names";
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
  j.slot_window, j.items, j.notes, j.parking,
  j.subtotal_pence, j.total_pence, j.commission_pct, j.commission_pence,
  j.commission_on_net,
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

/**
 * What a cleaner may see about a job they have NOT accepted.
 *
 * Deliberately excludes the customer's name, phone, email and street address —
 * a job is broadcast to everyone covering the postcode, so before someone
 * commits, those details would be handed to cleaners who never take the work.
 * Enforced in the query rather than the template: hiding a field in JSX leaves
 * it one careless edit from being rendered, whereas never selecting it makes
 * that edit a compile error.
 */
const OFFER_COLUMNS = `
  j.id, j.ref, j.outward, j.town,
  to_char(j.slot_date, 'YYYY-MM-DD') AS slot_date,
  j.slot_window, j.items, j.notes,
  j.total_pence, j.commission_pct, j.commission_pence, j.status
`;

const CLEANER_COLUMNS = `
  c.id, c.name, c.business_name, c.email, c.phone, c.status,
  c.insurance_provider,
  to_char(c.insurance_expiry, 'YYYY-MM-DD') AS insurance_expiry,
  c.years_experience, c.equipment, c.dbs_checked, c.admin_notes,
  c.vat_registered, c.vat_number,
  c.notify_sms, c.notify_email,
  to_char(c.created_at,  'YYYY-MM-DD HH24:MI') AS created_at,
  to_char(c.reviewed_at, 'YYYY-MM-DD HH24:MI') AS reviewed_at
`;

// ---------------------------------------------------------------- settings --

export async function getSettings(): Promise<Settings> {
  const row = await queryOne<Settings>(
    `SELECT commission_pct, minimum_charge_pence, min_notice_days, booking_email,
            cancellation_notice_hours, protection_pct, protection_enabled,
            payee_name, payee_account, payee_sort_code, payee_address,
            payment_terms_days, legal_footer,
            admin_mobile, admin_sms_enabled
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
  protectionPct: number;
  protectionEnabled: boolean;
  payeeName: string;
  payeeAccount: string;
  payeeSortCode: string;
  payeeAddress: string;
  paymentTermsDays: number;
  legalFooter: string;
  adminMobile: string;
  adminSmsEnabled: boolean;
}): Promise<void> {
  await query(
    `UPDATE settings
        SET commission_pct = $1, minimum_charge_pence = $2,
            min_notice_days = $3, booking_email = $4,
            cancellation_notice_hours = $5,
            protection_pct = $6, protection_enabled = $7,
            payee_name = $8, payee_account = $9, payee_sort_code = $10,
            payee_address = $11, payment_terms_days = $12,
            legal_footer = $13,
            admin_mobile = $14, admin_sms_enabled = $15,
            updated_at = now()
      WHERE id = 1`,
    [
      input.commissionPct,
      input.minimumChargePence,
      input.minNoticeDays,
      input.bookingEmail,
      input.cancellationNoticeHours,
      input.protectionPct,
      input.protectionEnabled,
      input.payeeName,
      input.payeeAccount,
      input.payeeSortCode,
      input.payeeAddress,
      input.paymentTermsDays,
      input.legalFooter,
      input.adminMobile,
      input.adminSmsEnabled,
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
export async function quoteBasket(
  basket: Basket,
  protection = false
): Promise<Quote> {
  const [settings, items, bundles] = await Promise.all([
    getSettings(),
    getPriceItems(true),
    getBundles(true),
  ]);
  return buildQuote(basket, items, bundles, {
    minimumChargePence: settings.minimum_charge_pence,
    commissionPct: Number(settings.commission_pct),
    protectionPct: Number(settings.protection_pct),
    protection: protection && settings.protection_enabled,
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

/**
 * Replace a cleaner's coverage in two round trips rather than one per postcode.
 *
 * The previous version deleted then inserted row by row: 136 sequential HTTP
 * queries for a realistic patch, which is instant against the embedded local
 * database and slow enough on Neon to hit the serverless timeout. Insert first,
 * then prune, so a failure mid-way can never leave a cleaner covering nothing.
 */
export async function setCleanerAreas(
  cleanerId: number,
  outwards: string[]
): Promise<void> {
  if (outwards.length > 0) {
    await query(
      `INSERT INTO cleaner_areas (cleaner_id, outward)
       SELECT $1, unnest($2::text[])
       ON CONFLICT DO NOTHING`,
      [cleanerId, outwards]
    );
  }
  await query(
    `DELETE FROM cleaner_areas
      WHERE cleaner_id = $1 AND NOT (outward = ANY($2::text[]))`,
    [cleanerId, outwards]
  );
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
  const working = rows.filter((row) => row.am || row.pm);

  // Same batching as coverage — one query per operation, not one per weekday.
  if (working.length > 0) {
    await query(
      `INSERT INTO cleaner_availability (cleaner_id, weekday, am, pm)
       SELECT $1, w.weekday, w.am, w.pm
         FROM unnest($2::int[], $3::boolean[], $4::boolean[])
              AS w(weekday, am, pm)
       ON CONFLICT (cleaner_id, weekday) DO UPDATE
         SET am = EXCLUDED.am, pm = EXCLUDED.pm`,
      [
        cleanerId,
        working.map((row) => row.weekday),
        working.map((row) => row.am),
        working.map((row) => row.pm),
      ]
    );
  }
  await query(
    `DELETE FROM cleaner_availability
      WHERE cleaner_id = $1 AND NOT (weekday = ANY($2::int[]))`,
    [cleanerId, working.map((row) => row.weekday)]
  );
}

export type Blackout = { day: string; am: boolean; pm: boolean };

export async function getBlackouts(cleanerId: number): Promise<Blackout[]> {
  return query<Blackout>(
    `SELECT to_char(day, 'YYYY-MM-DD') AS day, am, pm
       FROM cleaner_blackouts
      WHERE cleaner_id = $1 AND day >= CURRENT_DATE
      ORDER BY day`,
    [cleanerId]
  );
}

/** Block a half-day, a whole day, or a run of days in one go. */
export async function addBlackout(
  cleanerId: number,
  from: string,
  to: string,
  am: boolean,
  pm: boolean
): Promise<number> {
  if (!am && !pm) return 0;

  const rows = await query<{ day: string }>(
    `INSERT INTO cleaner_blackouts (cleaner_id, day, am, pm)
     SELECT $1, d::date, $4, $5
       FROM generate_series($2::date, $3::date, interval '1 day') AS d
     ON CONFLICT (cleaner_id, day) DO UPDATE
       SET am = cleaner_blackouts.am OR EXCLUDED.am,
           pm = cleaner_blackouts.pm OR EXCLUDED.pm
     RETURNING to_char(day, 'YYYY-MM-DD') AS day`,
    [cleanerId, from, to, am, pm]
  );
  return rows.length;
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
             AND ((b.am AND $3 = 'am') OR (b.pm AND $3 = 'pm'))
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
  parking: string;
  protection?: boolean;
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

  const quote = await quoteBasket(input.basket, input.protection ?? false);
  if (quote.total_pence <= 0) {
    throw new Error("Choose at least one item to clean.");
  }

  // No cleaner covers this postcode yet. Take the booking anyway — a job with
  // a date, an address and a price is far better than a name on a list, both
  // for the customer and as something to recruit against — but hold it as
  // provisional rather than confirming a slot nobody can work.
  const covered = await hasCoverage(outward);
  const initialStatus = covered ? "offered" : "provisional";

  let job: Job | null = null;
  for (let attempt = 0; attempt < 5 && !job; attempt++) {
    try {
      job = await queryOne<Job>(
        `INSERT INTO jobs
           (ref, customer_name, customer_email, customer_phone, address_line, town,
            postcode, outward, slot_date, slot_window, items, notes, parking,
            subtotal_pence, total_pence, commission_pct, commission_pence, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::date,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,$18)
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
          input.parking,
          quote.subtotal_pence,
          quote.total_pence,
          quote.commission_pct,
          quote.commission_pence,
          initialStatus,
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

  const offered = covered
    ? await broadcastJob(job.id, outward, input.slotDate, input.slotWindow)
    : 0;
  const saved = (await getJob(job.id))!;

  if (!covered) {
    const settings = await getSettings();
    await notify({
      recipient: settings.booking_email,
      subject: `Provisional booking in ${outward} — ${gbpShort(saved.total_pence)} on ${saved.slot_date}`,
      body:
        `${saved.customer_name} has booked provisionally in ${saved.postcode}, ` +
        `where nobody covers.\n\n` +
        `Wanted: ${saved.slot_date} (${saved.slot_window.toUpperCase()})\n` +
        `Value: ${gbpShort(saved.total_pence)}\n` +
        `Phone: ${saved.customer_phone}\n\n` +
        `They were promised confirmation within 24 hours. Find a cleaner for ` +
        `${outward} or call them back — ${siteUrl()}/admin/jobs?status=provisional`,
      jobId: saved.id,
    });
  }

  await notifyAdmin({
    subject: `New booking ${saved.ref} — ${saved.postcode}`,
    smsBody: covered
      ? `NEW BOOKING ${saved.ref}: ${saved.postcode}, ${saved.slot_date} ` +
        `${saved.slot_window.toUpperCase()}, ${gbpShort(saved.total_pence)}. ` +
        `Offered to ${offered} cleaner${offered === 1 ? "" : "s"}.`
      : `NEW REQUEST ${saved.ref}: ${saved.postcode}, ${saved.slot_date} ` +
        `${saved.slot_window.toUpperCase()}, ${gbpShort(saved.total_pence)}. ` +
        `NO COVER — promised confirmation within 24h.`,
    jobId: saved.id,
  });

  const manageLink = bookingUrl(saved.ref, siteUrl());
  await notifyCustomer(saved, {
    subject: covered
      ? `Booking received — ${saved.ref}`
      : `Booking requested — ${saved.ref}`,
    body:
      `Thanks ${saved.customer_name}, your carpet clean is booked.\n\n` +
      `Reference: ${saved.ref}\n` +
      `Date: ${saved.slot_date} (${saved.slot_window === "am" ? "Morning 8am-12pm" : "Afternoon 12pm-5pm"})\n` +
      `Address: ${saved.address_line}, ${saved.postcode}\n` +
      `Fixed price: ${gbpShort(saved.total_pence)}, payable to your cleaner on the day.\n\n` +
      (covered
        ? `We're matching you with a vetted cleaner now and will confirm their ` +
          `details as soon as the job is claimed.\n\n`
        : `We don't have a cleaner in ${outward} yet, so this is a request ` +
          `rather than a confirmed booking. We'll confirm within 24 hours, or ` +
          `call you to sort something out. You owe nothing either way.\n\n`) +
      `Need to change or cancel? Use this link any time:\n${manageLink}`,
    smsBody: covered
      ? `Booking ${saved.ref} confirmed for ${saved.slot_date} ` +
        `${saved.slot_window.toUpperCase()}, ${gbpShort(saved.total_pence)}. ` +
        `Change or cancel: ${manageLink}`
      : `Request ${saved.ref} received for ${saved.slot_date} ` +
        `${saved.slot_window.toUpperCase()}, ${gbpShort(saved.total_pence)}. ` +
        `We'll confirm within 24h — nothing to pay. ${manageLink}`,
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
        `Commission: ${gbpShort(job.commission_pence)} — you keep ${youKeep}\n` +
        `${COMMISSION_TERMS_SHORT}\n\n` +
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

  await applyCommissionBasis(jobId, cleanerId);

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
  if (job && cleaner) await confirmCleanerToCustomer(job, cleaner);

  return { ok: true };
}

/** Tell the customer who is coming. Shared by acceptance and assignment. */
async function confirmCleanerToCustomer(
  job: Job,
  cleaner: Cleaner
): Promise<void> {
  // First name only: to the customer this is Fresh For Less sending someone.
  const who = firstName(cleaner.name);
  await notifyCustomer(job, {
    subject: `Your carpet clean is confirmed — ${job.ref}`,
    body:
      `Good news ${job.customer_name}, ${who} will be cleaning for you ` +
      `on ${job.slot_date} (${job.slot_window.toUpperCase()}).\n\n` +
      `Your cleaner: ${who}\n` +
      `Their number: ${cleaner.phone}\n` +
      `Fixed price: ${gbpShort(job.total_pence)}, payable to them on the day.\n\n` +
      `Need to change or cancel? ${bookingUrl(job.ref, siteUrl())}`,
    smsBody:
      `${job.ref} confirmed: ${who} (${cleaner.phone}) will clean on ` +
      `${job.slot_date} ${job.slot_window.toUpperCase()}. ` +
      `${gbpShort(job.total_pence)} on the day. Changes: ${bookingUrl(job.ref, siteUrl())}`,
    jobId: job.id,
  });
}

/**
 * Give a job straight to a named cleaner — the "I've just got off the phone
 * with someone who'll take it" case, and how a provisional booking becomes a
 * real one. Deliberately skips the coverage and availability checks: the office
 * has spoken to them and knows better than the rota does.
 */
/**
 * Drop the commission on one job — a free first job for a new cleaner, or
 * making good after something went wrong.
 *
 * Refused once the job is on an invoice: the invoice total is already fixed and
 * the cleaner may have paid it, so zeroing the job behind it would leave the
 * books disagreeing with themselves.
 */
/** UK standard rate. A constant, not a setting — a wrong VAT rate is worse
 *  than an inconvenient one, and it has moved once in twenty years. */
export const VAT_RATE_PCT = 20;

/** The part of a VAT-inclusive price the cleaner actually keeps. */
export function netOfVatPence(grossPence: number): number {
  return Math.round(grossPence / (1 + VAT_RATE_PCT / 100));
}

/**
 * Re-base a job's commission once its cleaner is known.
 *
 * A VAT-registered cleaner hands 1/6 of the customer's payment straight to
 * HMRC, so charging commission on the gross taxes money they never keep. The
 * rate is unchanged — it's the base that moves — so commission_pct stays
 * honest and commission_on_net records which basis was used.
 *
 * Never touches a job whose commission was set by hand, and never one already
 * invoiced.
 */
export async function applyCommissionBasis(
  jobId: number,
  cleanerId: number
): Promise<void> {
  const [job, cleaner] = await Promise.all([getJob(jobId), getCleaner(cleanerId)]);
  if (!job || !cleaner) return;
  if (job.commission_pence === 0) return; // waived — leave it alone

  const invoiced = await queryOne<{ id: number }>(
    `SELECT invoice_id AS id FROM commission_invoice_lines WHERE job_id = $1`,
    [jobId]
  );
  if (invoiced) return;

  const base = cleaner.vat_registered
    ? netOfVatPence(job.total_pence)
    : job.total_pence;
  const pence = Math.round((base * Number(job.commission_pct)) / 100);

  await query(
    `UPDATE jobs SET commission_pence = $2, commission_on_net = $3 WHERE id = $1`,
    [jobId, pence, cleaner.vat_registered]
  );
}

/**
 * Override the commission rate on a single job.
 *
 * Jobs carry their own rate rather than reading the global setting, so a
 * one-off deal never moves when the national rate changes. Recomputed from
 * total_pence with the same rounding as the original quote, so the figure on
 * the invoice always matches the rate shown.
 *
 * Refuses once the job is invoiced — the cleaner has been billed by then.
 */
export async function setJobCommission(
  jobId: number,
  pct: number
): Promise<{ ok: boolean; reason?: string; changed?: boolean }> {
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
    return { ok: false, reason: "Commission has to be between 0% and 100%." };
  }
  // numeric(5,2) — anything finer is silently rounded by the column anyway.
  const rate = Math.round(pct * 100) / 100;

  const invoiced = await queryOne<{ id: number }>(
    `SELECT invoice_id AS id FROM commission_invoice_lines WHERE job_id = $1`,
    [jobId]
  );
  if (invoiced) {
    return {
      ok: false,
      reason: "That job is already on an invoice, so its commission can't be changed.",
    };
  }

  const before = await queryOne<{ commission_pence: number }>(
    `SELECT commission_pence FROM jobs WHERE id = $1`,
    [jobId]
  );

  const done = await query<{ id: number; commission_pence: number }>(
    `UPDATE jobs
        SET commission_pct = $2::numeric,
            commission_pence = round(total_pence * $2::numeric / 100.0)
      WHERE id = $1 AND status <> 'cancelled'
      RETURNING id, commission_pence`,
    [jobId, rate]
  );
  if (done.length === 0) {
    return { ok: false, reason: "That job can't be changed." };
  }
  return {
    ok: true,
    changed: before ? before.commission_pence !== done[0].commission_pence : true,
  };
}

/** The invoice a job has landed on, if any — commission is fixed from then on. */
export async function getJobInvoiceRef(jobId: number): Promise<string | null> {
  const row = await queryOne<{ ref: string }>(
    `SELECT i.ref FROM commission_invoice_lines l
       JOIN commission_invoices i ON i.id = l.invoice_id
      WHERE l.job_id = $1`,
    [jobId]
  );
  return row?.ref ?? null;
}

/** Shorthand for the common case: this one's on us. */
export async function waiveCommission(
  jobId: number
): Promise<{ ok: boolean; reason?: string }> {
  return setJobCommission(jobId, 0);
}

export async function assignJob(
  jobId: number,
  cleanerId: number,
  waive = false
): Promise<{ ok: boolean; reason?: string }> {
  const job = await getJob(jobId);
  const cleaner = await getCleaner(cleanerId);
  if (!job) return { ok: false, reason: "Job not found." };
  if (!cleaner) return { ok: false, reason: "Cleaner not found." };
  if (cleaner.status !== "approved") {
    return { ok: false, reason: `${cleaner.name} isn't approved yet.` };
  }
  if (job.status === "completed" || job.status === "cancelled") {
    return { ok: false, reason: "That job is already closed." };
  }

  await query(
    `UPDATE jobs
        SET status = 'accepted', cleaner_id = $2, accepted_at = now()
      WHERE id = $1`,
    [jobId, cleanerId]
  );
  // Logged as an offer they took, so job history reads consistently.
  await query(
    `INSERT INTO job_offers (job_id, cleaner_id, response, responded_at)
     VALUES ($1,$2,'accepted', now())
     ON CONFLICT (job_id, cleaner_id)
     DO UPDATE SET response = 'accepted', responded_at = now()`,
    [jobId, cleanerId]
  );

  await applyCommissionBasis(jobId, cleanerId);
  if (waive) await waiveCommission(jobId);

  const assigned = (await getJob(jobId))!;
  await confirmCleanerToCustomer(assigned, cleaner);

  await notifyCleaner(cleaner, {
    subject: `Job assigned to you — ${job.ref} on ${job.slot_date}`,
    body:
      `${cleaner.name}, we've put ${job.ref} in your diary as agreed.\n\n` +
      `Date: ${job.slot_date} (${job.slot_window.toUpperCase()})\n` +
      `Address: ${job.address_line}${job.town ? `, ${job.town}` : ""}, ${job.postcode}\n` +
      `Customer: ${job.customer_name}, ${job.customer_phone}\n` +
      `${job.parking ? `Parking: ${job.parking}\n` : ""}` +
      `Collect: ${gbpShort(assigned.total_pence)} — you keep ` +
      `${gbpShort(assigned.total_pence - assigned.commission_pence)}\n\n` +
      `${assigned.commission_pence === 0
        ? "No commission on this one — the full amount is yours."
        : COMMISSION_TERMS_SHORT}`,
    smsBody:
      `Job ${assigned.ref} is in your diary: ${assigned.slot_date} ` +
      `${assigned.slot_window.toUpperCase()}, ${assigned.postcode}. Collect ` +
      `${gbpShort(assigned.total_pence)}, you keep ` +
      `${gbpShort(assigned.total_pence - assigned.commission_pence)}` +
      `${assigned.commission_pence === 0 ? " (no commission)" : ""}. ` +
      `${siteUrl()}/pro/dashboard`,
    jobId,
  });

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

/**
 * Cancel from the office. Both sides are told — a customer who hears nothing
 * still expects a cleaner at their door, and a cleaner who hears nothing turns
 * up to one that isn't expecting them.
 */
export async function cancelJob(
  jobId: number,
  reason: string
): Promise<void> {
  const job = await getJob(jobId);
  const cancelled = await query<{ id: number }>(
    `UPDATE jobs
        SET status = 'cancelled', cancelled_at = now(), cancel_reason = $2,
            cancelled_by = 'admin'
      WHERE id = $1 AND status IN ('offered','accepted','unfilled')
      RETURNING id`,
    [jobId, reason]
  );
  if (!job || cancelled.length === 0) return;

  const when = `${job.slot_date} (${job.slot_window.toUpperCase()})`;

  await notifyCustomer(job, {
    subject: `Your booking ${job.ref} has been cancelled`,
    body:
      `${job.customer_name}, we've cancelled your carpet clean for ${when}.\n\n` +
      `${reason ? `Reason: ${reason}\n\n` : ""}` +
      `There's nothing to pay. Call 0330 043 4811 and we'll rebook you, or ` +
      `book again at ${siteUrl()}/book.`,
    smsBody:
      `Your Fresh For Less booking ${job.ref} for ${when} has been cancelled. ` +
      `Nothing to pay. Call 0330 043 4811 to rebook.`,
    jobId,
  });

  if (job.cleaner_id) {
    const cleaner = await getCleaner(job.cleaner_id);
    if (cleaner) {
      await notifyCleaner(cleaner, {
        subject: `Cancelled by the office — ${job.ref} on ${job.slot_date}`,
        body:
          `${cleaner.name}, the office has cancelled ${job.ref} for ${when}.\n\n` +
          `${reason ? `Reason: ${reason}\n\n` : ""}` +
          `No commission is due. Your diary has been freed up.`,
        smsBody: `CANCELLED by office: ${job.ref}, ${when}. Slot is free again.`,
        jobId,
      });
    }
  }
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
/** A job as it appears to a cleaner deciding whether to accept it. */
export type JobOffer = Pick<
  Job,
  | "id"
  | "ref"
  | "outward"
  | "town"
  | "slot_date"
  | "slot_window"
  | "items"
  | "notes"
  | "total_pence"
  | "commission_pct"
  | "commission_pence"
  | "status"
>;

export async function listOffersForCleaner(
  cleanerId: number
): Promise<JobOffer[]> {
  return query<JobOffer>(
    `SELECT ${OFFER_COLUMNS}
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

export type JobFilters = {
  status?: string;
  /** Inclusive slot-date bounds, YYYY-MM-DD. */
  from?: string;
  to?: string;
  /** Matches reference, customer name, postcode, town or cleaner name. */
  q?: string;
  /** Restrict to one cleaner. Always forced server-side, never from input. */
  cleanerId?: number;
  /**
   * Coarser than status: "outstanding" is anything not finished, "attention"
   * is anything whose slot has passed without being completed or cancelled —
   * the jobs that quietly go wrong because nobody marked them done.
   */
  group?: "outstanding" | "attention";
  /**
   * "soonest"/"latest" order by the slot; "newest" orders by when the booking
   * was taken, which is a different question and the one you ask when
   * something has just come in.
   */
  sort?: "soonest" | "latest" | "newest";
  limit?: number;
};

export type JobRow = Job & { cleaner_name: string | null; offers: number };

/** Build the WHERE clause shared by the list and its totals. */
function jobFilterClause(filters: JobFilters): {
  where: string;
  params: unknown[];
} {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`j.status = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    clauses.push(`j.slot_date >= $${params.length}::date`);
  }
  if (filters.to) {
    params.push(filters.to);
    clauses.push(`j.slot_date <= $${params.length}::date`);
  }
  if (filters.group === "outstanding") {
    clauses.push(`j.status NOT IN ('completed', 'cancelled')`);
  }
  if (filters.group === "attention") {
    clauses.push(
      `j.status NOT IN ('completed', 'cancelled') AND j.slot_date < CURRENT_DATE`
    );
  }
  if (filters.cleanerId) {
    params.push(filters.cleanerId);
    clauses.push(`j.cleaner_id = $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q.toLowerCase()}%`);
    const n = params.length;
    clauses.push(
      `(lower(j.ref) LIKE $${n} OR lower(j.customer_name) LIKE $${n}
        OR lower(j.postcode) LIKE $${n} OR lower(j.town) LIKE $${n}
        OR EXISTS (SELECT 1 FROM cleaners cf
                    WHERE cf.id = j.cleaner_id
                      AND (lower(cf.name) LIKE $${n}
                        OR lower(cf.business_name) LIKE $${n})))`
    );
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function listJobs(filters: JobFilters = {}): Promise<JobRow[]> {
  const { where, params } = jobFilterClause(filters);
  params.push(Math.min(filters.limit ?? 300, 1000));

  return query<JobRow>(
    `SELECT ${JOB_COLUMNS},
            c.name AS cleaner_name,
            (SELECT count(*)::int FROM job_offers o WHERE o.job_id = j.id) AS offers
       FROM jobs j
       LEFT JOIN cleaners c ON c.id = j.cleaner_id
      ${where}
      ORDER BY ${
        filters.sort === "newest"
          ? "j.created_at DESC"
          : `j.slot_date ${filters.sort === "soonest" ? "ASC" : "DESC"}, j.created_at DESC`
      }
      LIMIT $${params.length}`,
    params
  );
}

/** Totals for whatever the current filter selects. */
export async function jobTotals(
  filters: JobFilters = {}
): Promise<{ jobs: number; value_pence: number; commission_pence: number }> {
  const { where, params } = jobFilterClause(filters);
  const row = await queryOne<{
    jobs: number;
    value_pence: number;
    commission_pence: number;
  }>(
    // Cancelled and unfilled jobs are real history but not real money, and
    // commission is only ever earned on completed work — summing everything
    // showed income that will never arrive.
    `SELECT count(*)::int AS jobs,
            COALESCE(sum(j.total_pence)
              FILTER (WHERE j.status NOT IN ('cancelled', 'unfilled')), 0)::int
              AS value_pence,
            COALESCE(sum(j.commission_pence)
              FILTER (WHERE j.status = 'completed'), 0)::int
              AS commission_pence
       FROM jobs j ${where}`,
    params
  );
  return row ?? { jobs: 0, value_pence: 0, commission_pence: 0 };
}

/** Counts per status for the filter tabs, respecting date and search. */
export async function jobStatusCounts(
  filters: JobFilters = {}
): Promise<Record<string, number>> {
  // Counts ignore status and group so the tabs always show what's behind them,
  // not what's left after the tab you're already on.
  const { where, params } = jobFilterClause({
    ...filters,
    status: undefined,
    group: undefined,
  });
  const rows = await query<{
    status: string;
    n: number;
    overdue: number;
  }>(
    `SELECT j.status, count(*)::int AS n,
            count(*) FILTER (
              WHERE j.status NOT IN ('completed','cancelled')
                AND j.slot_date < CURRENT_DATE
            )::int AS overdue
       FROM jobs j ${where} GROUP BY j.status`,
    params
  );

  const counts = Object.fromEntries(rows.map((r) => [r.status, r.n]));
  counts.__outstanding = rows
    .filter((r) => !["completed", "cancelled"].includes(r.status))
    .reduce((sum, r) => sum + r.n, 0);
  counts.__attention = rows.reduce((sum, r) => sum + r.overdue, 0);
  counts.__all = rows.reduce((sum, r) => sum + r.n, 0);
  return counts;
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
        AND j.commission_pence > 0
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
export type RaisedInvoice = {
  id: number;
  ref: string;
  cleanerId: number;
  totalPence: number;
  jobs: number;
};

export async function generateCommissionInvoices(
  periodStart: string,
  periodEnd: string
): Promise<RaisedInvoice[]> {
  const pending = await listUninvoicedCommission();
  const created: RaisedInvoice[] = [];

  for (const group of pending) {
    // Three queries per cleaner regardless of how many jobs they completed.
    // This previously inserted one line at a time, so a busy week meant a
    // query per job and the weekly run grew with volume until it would
    // eventually outlast the serverless timeout.
    const invoice = await queryOne<{ id: number }>(
      `INSERT INTO commission_invoices
         (ref, cleaner_id, period_start, period_end, total_pence)
       VALUES ($1,$2,$3::date,$4::date,0) RETURNING id`,
      [makeRef("CI"), group.cleaner_id, periodStart, periodEnd]
    );
    if (!invoice) continue;

    // Selected straight from jobs rather than round-tripped through the app.
    // The unique index on job_id means a job can never land on two invoices,
    // even if this runs twice.
    const lines = await query<{ amount_pence: number }>(
      `INSERT INTO commission_invoice_lines (invoice_id, job_id, amount_pence)
       SELECT $1, j.id, j.commission_pence
         FROM jobs j
        WHERE j.status = 'completed'
          AND j.cleaner_id = $2
          AND j.commission_pence > 0
          AND NOT EXISTS (
            SELECT 1 FROM commission_invoice_lines l WHERE l.job_id = j.id
          )
       ON CONFLICT (job_id) DO NOTHING
       RETURNING amount_pence`,
      [invoice.id, group.cleaner_id]
    );

    // Another run may have claimed the jobs in between — don't leave an empty
    // invoice behind.
    if (lines.length === 0) {
      await query(`DELETE FROM commission_invoices WHERE id = $1`, [invoice.id]);
      continue;
    }

    const total = lines.reduce((sum, line) => sum + line.amount_pence, 0);
    const saved = await queryOne<{ ref: string }>(
      `UPDATE commission_invoices SET total_pence = $2 WHERE id = $1
       RETURNING ref`,
      [invoice.id, total]
    );

    created.push({
      id: invoice.id,
      ref: saved!.ref,
      cleanerId: group.cleaner_id,
      totalPence: total,
      jobs: lines.length,
    });
  }

  return created;
}

/** Tell a cleaner their commission invoice has been raised. */
export async function notifyInvoiceRaised(
  invoice: RaisedInvoice,
  dueBy: string
): Promise<void> {
  const cleaner = await getCleaner(invoice.cleanerId);
  if (!cleaner) return;

  await notifyCleaner(cleaner, {
    subject: `Commission invoice ${invoice.ref} — ${gbpShort(invoice.totalPence)}`,
    body:
      `${cleaner.name}, here's your commission invoice for last week.\n\n` +
      `Invoice: ${invoice.ref}\n` +
      `Jobs completed: ${invoice.jobs}\n` +
      `Commission due: ${gbpShort(invoice.totalPence)}\n` +
      `Payable by: ${dueBy}\n\n` +
      `View, print or pay it here:\n${siteUrl()}/pro/invoices/${invoice.ref}`,
    smsBody:
      `Commission invoice ${invoice.ref}: ${gbpShort(invoice.totalPence)} for ` +
      `${invoice.jobs} job${invoice.jobs === 1 ? "" : "s"}, due ${dueBy}. ` +
      `${siteUrl()}/pro/invoices/${invoice.ref}`,
  });
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

/**
 * Send a free-text message to one cleaner and record it in the thread.
 *
 * Deliberately ignores the cleaner's notify_sms preference: that flag governs
 * automated job broadcasts, not a direct reply from a human who is mid-
 * conversation with them.
 */
export async function textCleaner(
  cleanerId: number,
  body: string
): Promise<{ ok: boolean; reason?: string }> {
  const cleaner = await getCleaner(cleanerId);
  if (!cleaner) return { ok: false, reason: "That cleaner no longer exists." };

  const mobile = toE164(cleaner.phone);
  if (!mobile || !isMobile(cleaner.phone)) {
    return {
      ok: false,
      reason: `${cleaner.name} has no mobile number on file, so they can't be texted.`,
    };
  }

  await notify({
    channel: "sms",
    recipient: mobile,
    subject: `Message to ${cleaner.name}`,
    body,
  });
  return { ok: true };
}

/**
 * Text the customer on a job.
 *
 * Keyed on the job rather than the person: there is no customer account, and
 * the same household booking twice is two separate jobs with their own detail.
 */
export async function textCustomer(
  jobId: number,
  body: string
): Promise<{ ok: boolean; reason?: string }> {
  const job = await getJob(jobId);
  if (!job) return { ok: false, reason: "That job no longer exists." };

  const mobile = toE164(job.customer_phone);
  if (!mobile || !isMobile(job.customer_phone)) {
    return {
      ok: false,
      reason: `${job.customer_name} has a landline on file, so they can't be texted.`,
    };
  }

  await notify({
    channel: "sms",
    recipient: mobile,
    subject: `Message to ${job.customer_name} (${job.ref})`,
    body,
    jobId,
  });
  return { ok: true };
}

/** Every message to or from one job's customer, oldest first. */
export async function getCustomerThread(jobId: number): Promise<
  {
    id: number;
    direction: string;
    body: string;
    created_at: string;
    sent_at: string | null;
    error: string | null;
  }[]
> {
  const job = await getJob(jobId);
  if (!job) return [];
  const digits = job.customer_phone.replace(/[^0-9]/g, "").slice(-9);
  if (!digits) return [];
  return query(
    `SELECT id, direction, body, created_at, sent_at, error
       FROM notifications
      WHERE channel = 'sms'
        AND regexp_replace(recipient, '[^0-9]', '', 'g') LIKE $1
      ORDER BY created_at ASC
      LIMIT 200`,
    [`%${digits}`]
  );
}

/** Customers worth showing in the message list — most recent booking first. */
export async function listCustomerThreads(limit = 40): Promise<
  { job_id: number; ref: string; customer_name: string; customer_phone: string;
    slot_date: string; status: string; replies: number }[]
> {
  return query(
    `SELECT DISTINCT ON (regexp_replace(j.customer_phone, '[^0-9]', '', 'g'))
            j.id AS job_id, j.ref, j.customer_name, j.customer_phone,
            to_char(j.slot_date, 'YYYY-MM-DD') AS slot_date, j.status,
            (SELECT count(*)::int FROM notifications n
              WHERE n.direction = 'in'
                AND regexp_replace(n.recipient, '[^0-9]', '', 'g')
                    LIKE '%' || right(regexp_replace(j.customer_phone, '[^0-9]', '', 'g'), 9)
            ) AS replies
       FROM jobs j
      WHERE j.status <> 'cancelled'
      ORDER BY regexp_replace(j.customer_phone, '[^0-9]', '', 'g'), j.created_at DESC
      LIMIT $1`,
    [limit]
  );
}

/** Record a reply that arrived from a cleaner's handset. */
export async function recordInboundSms(input: {
  from: string;
  body: string;
  providerId: string;
}): Promise<{ cleanerId: number | null; jobId: number | null; duplicate: boolean }> {
  const from = toE164(input.from) ?? input.from;
  const cleaner = await queryOne<{ id: number; name: string }>(
    `SELECT id, name FROM cleaners
      WHERE regexp_replace(phone, '[^0-9]', '', 'g') LIKE $1
      ORDER BY id LIMIT 1`,
    // Match on the last 9 digits: stored numbers vary between 07…, +447… and
    // spaced formats, but the trailing digits are the same either way.
    [`%${from.replace(/[^0-9]/g, "").slice(-9)}`]
  );

  // Not a cleaner? It may be a customer replying about their booking.
  const job = cleaner
    ? null
    : await queryOne<{ id: number; ref: string; customer_name: string }>(
        `SELECT id, ref, customer_name FROM jobs
          WHERE regexp_replace(customer_phone, '[^0-9]', '', 'g') LIKE $1
          ORDER BY created_at DESC LIMIT 1`,
        [`%${from.replace(/[^0-9]/g, "").slice(-9)}`]
      );

  const subject = cleaner
    ? `Reply from ${cleaner.name}`
    : job
      ? `Reply from ${job.customer_name} (${job.ref})`
      : "Reply from an unknown number";

  const row = await queryOne<{ id: number }>(
    `INSERT INTO notifications
       (channel, direction, recipient, subject, body, provider_id, job_id)
     VALUES ('sms', 'in', $1, $2, $3, $4, $5)
     ON CONFLICT (provider_id) WHERE provider_id IS NOT NULL DO NOTHING
     RETURNING id`,
    [from, subject, input.body, input.providerId, job?.id ?? null]
  );

  return {
    cleanerId: cleaner?.id ?? null,
    jobId: job?.id ?? null,
    duplicate: row === null,
  };
}

/** One cleaner's full message history, oldest first. */
export async function getCleanerThread(cleanerId: number): Promise<
  {
    id: number;
    direction: string;
    body: string;
    created_at: string;
    sent_at: string | null;
    error: string | null;
  }[]
> {
  const cleaner = await getCleaner(cleanerId);
  if (!cleaner) return [];
  const digits = cleaner.phone.replace(/[^0-9]/g, "").slice(-9);
  if (!digits) return [];
  return query(
    `SELECT id, direction, body, created_at, sent_at, error
       FROM notifications
      WHERE channel = 'sms'
        AND regexp_replace(recipient, '[^0-9]', '', 'g') LIKE $1
      ORDER BY created_at ASC
      LIMIT 200`,
    [`%${digits}`]
  );
}

/** Replies waiting to be read, newest first — the admin inbox. */
export async function listInboundSms(limit = 50): Promise<
  { id: number; recipient: string; subject: string; body: string; created_at: string }[]
> {
  return query(
    `SELECT id, recipient, subject, body, created_at
       FROM notifications
      WHERE direction = 'in'
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit]
  );
}

/** Public base URL, used to build tappable links inside SMS. */
export function siteUrl(): string {
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
  // A phone booking may have no email at all; don't queue a message to nowhere.
  if (job.customer_email.trim()) {
    await notify({
      channel: "email",
      recipient: job.customer_email,
      subject: input.subject,
      body: input.body,
      jobId: input.jobId,
    });
  }
}

/**
 * Text the office. Separate from the cleaner broadcast on purpose: the office
 * wants to know a booking landed and whether anyone can take it, which is a
 * different question from "do you want this job".
 */
export async function notifyAdmin(input: {
  subject: string;
  smsBody: string;
  jobId?: number;
}): Promise<void> {
  const settings = await getSettings();
  const mobile = toE164(settings.admin_mobile);
  if (!settings.admin_sms_enabled || !mobile) return;

  await notify({
    channel: "sms",
    recipient: mobile,
    subject: input.subject,
    body: input.smsBody,
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
            WHERE b.cleaner_id = c.id AND b.day = d.day AND b.${window}
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
               AND ((b.am AND $3 = 'am') OR (b.pm AND $3 = 'pm'))
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

// ------------------------------------------------- cleaner profile edits --

/** The stored password hash — needed to sign and verify reset links. */
export async function getCleanerPasswordHash(
  id: number
): Promise<string | null> {
  const row = await queryOne<{ password_hash: string }>(
    `SELECT password_hash FROM cleaners WHERE id = $1`,
    [id]
  );
  return row?.password_hash ?? null;
}

export async function setCleanerPassword(
  id: number,
  passwordHash: string
): Promise<void> {
  await query(`UPDATE cleaners SET password_hash = $2 WHERE id = $1`, [
    id,
    passwordHash,
  ]);
}

export type CleanerProfileInput = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  insuranceProvider?: string;
  insuranceExpiry?: string | null;
  yearsExperience?: number;
  equipment?: string;
  /** Admin-only: it changes what the cleaner pays, so it can't be self-declared. */
  vatRegistered?: boolean;
  vatNumber?: string;
};

/**
 * Update a cleaner's own details. Vetting fields are optional so the cleaner
 * can edit their contact details without being able to rewrite their own
 * insurance record — only admin passes those.
 */
export async function updateCleanerProfile(
  id: number,
  input: CleanerProfileInput
): Promise<{ ok: boolean; reason?: string }> {
  const clash = await queryOne<{ id: number }>(
    `SELECT id FROM cleaners WHERE lower(email) = lower($1) AND id <> $2`,
    [input.email, id]
  );
  if (clash) {
    return { ok: false, reason: "Another cleaner already uses that email." };
  }

  await query(
    `UPDATE cleaners
        SET name = $2, business_name = $3, email = $4, phone = $5,
            insurance_provider = COALESCE($6, insurance_provider),
            insurance_expiry   = COALESCE($7::date, insurance_expiry),
            years_experience   = COALESCE($8, years_experience),
            equipment          = COALESCE($9, equipment),
            vat_registered     = COALESCE($10, vat_registered),
            vat_number         = COALESCE($11, vat_number)
      WHERE id = $1`,
    [
      id,
      input.name,
      input.businessName,
      input.email,
      input.phone,
      input.insuranceProvider ?? null,
      input.insuranceExpiry ?? null,
      input.yearsExperience ?? null,
      input.equipment ?? null,
      input.vatRegistered ?? null,
      input.vatNumber ?? null,
    ]
  );
  return { ok: true };
}

/** How many messages went to this recipient recently — cheap abuse guard. */
export async function countRecentNotifications(
  recipient: string,
  minutes: number,
  subjectLike: string
): Promise<number> {
  const row = await queryOne<{ n: number }>(
    `SELECT count(*)::int AS n
       FROM notifications
      WHERE recipient = $1
        AND subject LIKE $3
        AND created_at > now() - ($2 || ' minutes')::interval`,
    [recipient, String(minutes), subjectLike]
  );
  return row?.n ?? 0;
}

// ------------------------------------------------------- dropped jobs -----

/** Notice below this counts as a late drop when judging reliability. */
export const LATE_DROP_HOURS = 24;
/** Late drops inside this window before a cleaner is flagged for review. */
export const DROP_REVIEW_DAYS = 90;
export const DROP_REVIEW_LIMIT = 3;

export type ReleaseResult = {
  ok: boolean;
  reason?: string;
  offered: number;
  late: boolean;
};

/**
 * Take an accepted job off a cleaner and put it straight back to the market.
 *
 * Deliberately available to the cleaner as well as the office: a cleaner who
 * releases the night before is far better than one who no-shows on the day,
 * because the job goes back out while there's still time to fill it. Every
 * release is recorded against them either way.
 */
export async function releaseJob(input: {
  jobId: number;
  by: "cleaner" | "admin";
  reason: string;
  expectCleanerId?: number;
}): Promise<ReleaseResult> {
  const job = await getJob(input.jobId);
  if (!job || job.cleaner_id === null) {
    return { ok: false, reason: "That job isn't assigned to anyone.", offered: 0, late: false };
  }
  if (job.status !== "accepted") {
    return { ok: false, reason: "Only an accepted job can be reassigned.", offered: 0, late: false };
  }
  if (input.expectCleanerId && job.cleaner_id !== input.expectCleanerId) {
    return { ok: false, reason: "That job isn't yours.", offered: 0, late: false };
  }

  const hoursNotice = Math.max(0, Number(job.hours_until_slot));
  const late = hoursNotice < LATE_DROP_HOURS;
  const droppedBy = job.cleaner_id;

  await query(
    `INSERT INTO job_drops (job_id, cleaner_id, dropped_by, hours_notice, reason)
     VALUES ($1,$2,$3,$4,$5)`,
    [input.jobId, droppedBy, input.by, hoursNotice, input.reason.slice(0, 300)]
  );

  await query(
    `UPDATE jobs SET status = 'offered', cleaner_id = NULL, accepted_at = NULL
      WHERE id = $1`,
    [input.jobId]
  );
  await query(`DELETE FROM job_offers WHERE job_id = $1`, [input.jobId]);

  const offered = await broadcastJob(
    input.jobId,
    job.outward,
    job.slot_date,
    job.slot_window
  );

  const when = `${job.slot_date} (${job.slot_window.toUpperCase()})`;

  // The customer is not being cancelled on — their slot and price stand.
  await notifyCustomer(job, {
    subject: `We're arranging another cleaner for ${job.ref}`,
    body:
      `${job.customer_name}, the cleaner booked for ${when} can no longer make ` +
      `it, so we're arranging someone else.\\n\\n` +
      `Your time slot and your ${gbpShort(job.total_pence)} price are unchanged` +
      `${offered > 0 ? ", and we'll confirm your new cleaner shortly" : ""}.\\n\\n` +
      `${offered === 0 ? "Our team will call you to confirm.\\n\\n" : ""}` +
      `Anything you need: 0330 043 4811.`,
    smsBody:
      `${job.ref}: your cleaner for ${when} can't make it, so we're arranging ` +
      `another. Same slot, same ${gbpShort(job.total_pence)} price` +
      `${offered === 0 ? " — we'll call you to confirm." : "."}`,
    jobId: input.jobId,
  });

  const cleaner = await getCleaner(droppedBy);
  if (cleaner) {
    await notifyCleaner(cleaner, {
      subject: `Released — ${job.ref} on ${job.slot_date}`,
      body:
        `${cleaner.name}, ${job.ref} for ${when} has been taken off your diary ` +
        `and offered to other cleaners. No commission is due.\\n\\n` +
        (late
          ? `This was inside ${LATE_DROP_HOURS} hours of the slot, so it's ` +
            `recorded as a late drop. Repeated late drops are reviewed.`
          : `Thanks for letting us know in good time.`),
      smsBody:
        `${job.ref} (${when}) released from your diary${late ? " — logged as a late drop." : "."}`,
      jobId: input.jobId,
    });
  }

  return { ok: true, offered, late };
}

export type CleanerReliability = {
  completed: number;
  drops: number;
  late_drops: number;
  recent_late_drops: number;
};

export async function cleanerReliability(
  cleanerId: number
): Promise<CleanerReliability> {
  const row = await queryOne<CleanerReliability>(
    `SELECT
       (SELECT count(*)::int FROM jobs j
         WHERE j.cleaner_id = $1 AND j.status = 'completed')        AS completed,
       (SELECT count(*)::int FROM job_drops d WHERE d.cleaner_id = $1) AS drops,
       (SELECT count(*)::int FROM job_drops d
         WHERE d.cleaner_id = $1 AND d.hours_notice < $2)           AS late_drops,
       (SELECT count(*)::int FROM job_drops d
         WHERE d.cleaner_id = $1 AND d.hours_notice < $2
           AND d.dropped_at > now() - ($3 || ' days')::interval)    AS recent_late_drops`,
    [cleanerId, LATE_DROP_HOURS, String(DROP_REVIEW_DAYS)]
  );
  return row ?? { completed: 0, drops: 0, late_drops: 0, recent_late_drops: 0 };
}


// ------------------------------------------------------ invoice detail ----

export type InvoiceLine = {
  ref: string;
  slot_date: string;
  postcode: string;
  customer_name: string;
  total_pence: number;
  commission_pct: string | number;
  amount_pence: number;
};

/** One invoice with the jobs behind it, for the printable version. */
export async function getInvoice(
  ref: string
): Promise<{ invoice: InvoiceRow; lines: InvoiceLine[] } | null> {
  const invoice = await queryOne<InvoiceRow>(
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
      WHERE i.ref = $1`,
    [ref]
  );
  if (!invoice) return null;

  const lines = await query<InvoiceLine>(
    `SELECT j.ref,
            to_char(j.slot_date, 'YYYY-MM-DD') AS slot_date,
            j.postcode, j.customer_name, j.total_pence, j.commission_pct,
            l.amount_pence
       FROM commission_invoice_lines l
       JOIN jobs j ON j.id = l.job_id
      WHERE l.invoice_id = $1
      ORDER BY j.slot_date`,
    [invoice.id]
  );

  return { invoice, lines };
}

// -------------------------------------- activating provisional bookings ---

/**
 * Release provisional bookings that a newly-covered area can now service.
 *
 * A provisional booking carries a promise to confirm within 24 hours. Approving
 * a cleaner, or a cleaner widening their patch, is exactly the moment that
 * promise becomes keepable — leaving those jobs sitting in the queue until
 * someone notices is how the promise gets broken.
 */
export async function activateProvisionalJobs(
  cleanerId: number
): Promise<number> {
  const areas = await getCleanerAreas(cleanerId);
  if (areas.length === 0) return 0;

  const waiting = await query<Job>(
    `SELECT ${JOB_COLUMNS}
       FROM jobs j
      WHERE j.status = 'provisional'
        AND j.outward = ANY($1)
        AND j.slot_date >= CURRENT_DATE
      ORDER BY j.slot_date`,
    [areas]
  );

  let activated = 0;
  for (const job of waiting) {
    // Covering the postcode isn't enough — they have to be free that half-day.
    const matches = await findMatchingCleaners(
      job.outward,
      job.slot_date,
      job.slot_window
    );
    if (matches.length === 0) continue;

    const moved = await query<{ id: number }>(
      `UPDATE jobs SET status = 'offered'
        WHERE id = $1 AND status = 'provisional'
        RETURNING id`,
      [job.id]
    );
    if (moved.length === 0) continue;

    await broadcastJob(job.id, job.outward, job.slot_date, job.slot_window);

    await notifyCustomer(job, {
      subject: `Good news — we can cover ${job.outward} for ${job.ref}`,
      body:
        `${job.customer_name}, we've got a cleaner covering ${job.outward} now, ` +
        `so your request for ${job.slot_date} ` +
        `(${job.slot_window.toUpperCase()}) is going out to them.\n\n` +
        `Your ${gbpShort(job.total_pence)} price is unchanged and there's still ` +
        `nothing to pay until the day. We'll confirm who's coming shortly.`,
      smsBody:
        `${job.ref}: good news, we now cover ${job.outward}. Your ` +
        `${job.slot_date} ${job.slot_window.toUpperCase()} booking is with ` +
        `cleaners now — we'll confirm shortly. ${gbpShort(job.total_pence)}, ` +
        `nothing to pay until the day.`,
      jobId: job.id,
    });

    activated += 1;
  }

  return activated;
}

// ------------------------------------------------------- job detail -------

export type JobOfferRow = {
  cleaner_id: number;
  cleaner_name: string;
  business_name: string;
  phone: string;
  sent_at: string;
  response: string | null;
  responded_at: string | null;
};

/** Who a job went to and what they did about it. */
export async function getJobOffers(jobId: number): Promise<JobOfferRow[]> {
  return query<JobOfferRow>(
    `SELECT o.cleaner_id, c.name AS cleaner_name, c.business_name, c.phone,
            to_char(o.sent_at,      'YYYY-MM-DD HH24:MI') AS sent_at,
            o.response,
            to_char(o.responded_at, 'YYYY-MM-DD HH24:MI') AS responded_at
       FROM job_offers o
       JOIN cleaners c ON c.id = o.cleaner_id
      WHERE o.job_id = $1
      ORDER BY o.sent_at`,
    [jobId]
  );
}

export type JobDropRow = {
  cleaner_name: string;
  dropped_by: string;
  hours_notice: string | number;
  reason: string;
  dropped_at: string;
};

/** Anyone who took this job and then handed it back. */
export async function getJobDrops(jobId: number): Promise<JobDropRow[]> {
  return query<JobDropRow>(
    `SELECT c.name AS cleaner_name, d.dropped_by, d.hours_notice, d.reason,
            to_char(d.dropped_at, 'YYYY-MM-DD HH24:MI') AS dropped_at
       FROM job_drops d
       JOIN cleaners c ON c.id = d.cleaner_id
      WHERE d.job_id = $1
      ORDER BY d.dropped_at`,
    [jobId]
  );
}

export type JobMessage = {
  id: number;
  channel: string;
  recipient: string;
  subject: string;
  created_at: string;
  sent_at: string | null;
  error: string | null;
};

/**
 * Every message generated for one job.
 *
 * Being on the offer list only means a job was *addressed* to a cleaner — the
 * text may have bounced, or their number may not be a mobile. Without this,
 * a cleaner who never received the offer looks identical to one ignoring it.
 */
export async function getJobMessages(jobId: number): Promise<JobMessage[]> {
  return query<JobMessage>(
    `SELECT id, channel, recipient, subject,
            to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
            to_char(sent_at,    'HH24:MI')            AS sent_at,
            error
       FROM notifications
      WHERE job_id = $1
      ORDER BY id`,
    [jobId]
  );
}


/**
 * Adjust a job to a price agreed on the phone.
 *
 * Recorded as an extra line rather than by quietly rewriting the total, so the
 * itemisation still adds up to what the customer was told — the cleaner sees
 * the same breakdown the customer agreed to.
 */
export async function adjustJobPrice(
  jobId: number,
  agreedPence: number
): Promise<void> {
  const job = await getJob(jobId);
  if (!job) return;

  const difference = agreedPence - job.total_pence;
  if (difference === 0) return;

  const items = [
    ...job.items,
    {
      code: "adjustment",
      label: difference > 0 ? "Agreed extra" : "Agreed discount",
      qty: 1,
      amount_pence: difference,
      note: "Agreed over the phone",
    },
  ];
  const commission = Math.round(
    (agreedPence * Number(job.commission_pct)) / 100
  );

  await query(
    `UPDATE jobs
        SET items = $2::jsonb, total_pence = $3, commission_pence = $4
      WHERE id = $1`,
    [jobId, JSON.stringify(items), agreedPence, commission]
  );
}

// ---------------------------------------------------------- coverage map --

export type CoverageArea = {
  outward: string;
  cleaners: string;
  cleaner_count: number;
  jobs: number;
  requests: number;
};

/**
 * Every postcode a cleaner claims, with who claims it and what it has actually
 * produced. Claiming an area and it being worth covering are different things —
 * a district with cover but no jobs is wasted reach, and one with jobs but no
 * cover is lost work.
 */
export async function listCoverage(): Promise<CoverageArea[]> {
  return query<CoverageArea>(
    `SELECT a.outward,
            string_agg(DISTINCT c.name, ', ') AS cleaners,
            count(DISTINCT c.id)::int         AS cleaner_count,
            (SELECT count(*)::int FROM jobs j
              WHERE j.outward = a.outward
                AND j.status <> 'cancelled')  AS jobs,
            (SELECT count(*)::int FROM coverage_requests r
              WHERE r.outward = a.outward)    AS requests
       FROM cleaner_areas a
       JOIN cleaners c ON c.id = a.cleaner_id AND c.status = 'approved'
      GROUP BY a.outward
      ORDER BY a.outward`
  );
}

/** Postcodes that have produced work or enquiries but nobody covers. */
export async function listUncoveredDemand(): Promise<
  { outward: string; jobs: number; requests: number }[]
> {
  return query(
    `SELECT d.outward,
            (SELECT count(*)::int FROM jobs j
              WHERE j.outward = d.outward AND j.status <> 'cancelled') AS jobs,
            (SELECT count(*)::int FROM coverage_requests r
              WHERE r.outward = d.outward)                             AS requests
       FROM (
         SELECT outward FROM jobs
         UNION
         SELECT outward FROM coverage_requests
       ) d
      WHERE NOT EXISTS (
        SELECT 1 FROM cleaner_areas a
          JOIN cleaners c ON c.id = a.cleaner_id AND c.status = 'approved'
         WHERE a.outward = d.outward
      )
      ORDER BY d.outward`
  );
}
