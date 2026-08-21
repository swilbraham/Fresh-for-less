"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkAdminPassword,
  endAdminSession,
  isAdmin,
  startAdminSession,
} from "@/lib/marketplace/auth";
import {
  cancelJob,
  deleteBundle,
  deletePriceItem,
  generateCommissionInvoices,
  getPriceItems,
  rebroadcastJob,
  setCleanerStatus,
  setInvoiceStatus,
  updateSettings,
  upsertBundle,
  upsertPriceItem,
  notify,
  getCleaner,
} from "@/lib/marketplace/repo";
import { penceFromInput } from "@/lib/marketplace/money";
import { hitRateLimit } from "@/lib/marketplace/rate-limit";
import { parseOutwardList } from "@/lib/marketplace/postcode";
import { makeResetToken } from "@/lib/marketplace/auth";
import {
  assignJob,
  getCleanerPasswordHash,
  releaseJob,
  setAvailability,
  setCleanerAreas,
  updateCleanerProfile,
} from "@/lib/marketplace/repo";

function field(data: FormData, name: string, max = 200): string {
  return String(data.get(name) ?? "").trim().slice(0, max);
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function requireAdmin(path: string) {
  if (!(await isAdmin())) redirect(`/admin?error=${encodeURIComponent("Please sign in.")}`);
  return path;
}

// ------------------------------------------------------------------ access --

export async function adminLoginAction(data: FormData) {
  // One shared password guards every customer record in the system, so this is
  // the highest-value target on the site.
  const attempts = await hitRateLimit("login:admin", "admin", 10, 15 * 60);
  if (!attempts.allowed) {
    fail("/admin", "Too many attempts. Please wait a few minutes.");
  }

  if (!checkAdminPassword(field(data, "password", 200))) {
    fail("/admin", "Incorrect password.");
  }
  await startAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await endAdminSession();
  redirect("/admin");
}

// ------------------------------------------------------------ price control --

/** Save the whole national price list and platform settings in one submit. */
export async function savePricesAction(data: FormData) {
  await requireAdmin("/admin/prices");

  const commissionPct = Number(field(data, "commissionPct", 6));
  if (!Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 90) {
    fail("/admin/prices", "Commission must be between 0 and 90 percent.");
  }

  const minimumChargePence = penceFromInput(field(data, "minimumCharge", 12));
  if (minimumChargePence === null) {
    fail("/admin/prices", "Minimum charge must be a price like 69 or 69.00.");
  }

  const minNoticeDays = Number(field(data, "minNoticeDays", 3));
  if (!Number.isFinite(minNoticeDays) || minNoticeDays < 0 || minNoticeDays > 30) {
    fail("/admin/prices", "Notice period must be between 0 and 30 days.");
  }

  const cancellationNoticeHours = Number(field(data, "cancellationNoticeHours", 4));
  if (
    !Number.isFinite(cancellationNoticeHours) ||
    cancellationNoticeHours < 0 ||
    cancellationNoticeHours > 336
  ) {
    fail("/admin/prices", "Cancellation notice must be between 0 and 336 hours.");
  }

  const protectionPct = Number(field(data, "protectionPct", 6));
  if (!Number.isFinite(protectionPct) || protectionPct < 0 || protectionPct > 100) {
    fail("/admin/prices", "Stain guard must be between 0 and 100 percent.");
  }

  await updateSettings({
    commissionPct,
    minimumChargePence,
    minNoticeDays,
    bookingEmail: field(data, "bookingEmail", 120),
    cancellationNoticeHours,
    protectionPct,
    protectionEnabled: data.get("protectionEnabled") === "on",
  });

  for (const item of await getPriceItems()) {
    const price = penceFromInput(field(data, `price-${item.code}`, 12));
    if (price === null) {
      fail("/admin/prices", `"${item.label}" needs a valid price.`);
    }
    await upsertPriceItem({
      code: item.code,
      label: field(data, `label-${item.code}`, 80) || item.label,
      hint: field(data, `hint-${item.code}`, 120),
      kind: item.kind,
      unitPricePence: price,
      maxQty: Math.max(1, Math.min(50, Number(field(data, `max-${item.code}`, 3)) || item.max_qty)),
      sort: item.sort,
      active: data.get(`active-${item.code}`) === "on",
    });
  }

  revalidatePath("/admin/prices");
  revalidatePath("/book");
  redirect("/admin/prices?saved=1");
}

export async function addPriceItemAction(data: FormData) {
  await requireAdmin("/admin/prices");

  const code = field(data, "code", 40)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  const label = field(data, "label", 80);
  const price = penceFromInput(field(data, "price", 12));

  if (!code) fail("/admin/prices", "Give the new item a short code, e.g. curtains.");
  if (!label) fail("/admin/prices", "Give the new item a customer-facing label.");
  if (price === null) fail("/admin/prices", "Give the new item a valid price.");

  await upsertPriceItem({
    code,
    label,
    hint: field(data, "hint", 120),
    kind: field(data, "kind", 20) || "extra",
    unitPricePence: price,
    maxQty: Math.max(1, Math.min(50, Number(field(data, "maxQty", 3)) || 10)),
    sort: Number(field(data, "sort", 4)) || 500,
    active: true,
  });

  revalidatePath("/admin/prices");
  revalidatePath("/book");
  redirect("/admin/prices?saved=1");
}

export async function deletePriceItemAction(data: FormData) {
  await requireAdmin("/admin/prices");
  await deletePriceItem(field(data, "code", 40));
  revalidatePath("/admin/prices");
  revalidatePath("/book");
  redirect("/admin/prices?saved=1");
}

export async function addBundleAction(data: FormData) {
  await requireAdmin("/admin/prices");

  const itemCode = field(data, "itemCode", 40);
  const qty = Number(field(data, "qty", 3));
  const price = penceFromInput(field(data, "price", 12));

  if (!itemCode) fail("/admin/prices", "Pick which item the offer applies to.");
  if (!Number.isFinite(qty) || qty < 2 || qty > 50) {
    fail("/admin/prices", "An offer needs a quantity between 2 and 50.");
  }
  if (price === null) fail("/admin/prices", "Give the offer a valid price.");

  await upsertBundle({
    itemCode,
    qty,
    pricePence: price,
    label: field(data, "label", 80) || `${qty} for £${(price / 100).toFixed(0)}`,
  });

  revalidatePath("/admin/prices");
  revalidatePath("/book");
  redirect("/admin/prices?saved=1");
}

export async function deleteBundleAction(data: FormData) {
  await requireAdmin("/admin/prices");
  await deleteBundle(Number(field(data, "id", 12)));
  revalidatePath("/admin/prices");
  revalidatePath("/book");
  redirect("/admin/prices?saved=1");
}

// ---------------------------------------------------------------- vetting --

export async function setCleanerStatusAction(data: FormData) {
  await requireAdmin("/admin/cleaners");

  const id = Number(field(data, "id", 12));
  const status = field(data, "status", 20);
  if (!["approved", "suspended", "rejected", "pending"].includes(status)) {
    fail("/admin/cleaners", "Unknown status.");
  }

  await setCleanerStatus(id, status, field(data, "adminNotes", 1000) || undefined);

  if (status === "approved") {
    const cleaner = await getCleaner(id);
    if (cleaner) {
      await notify({
        recipient: cleaner.email,
        subject: "You're approved — jobs are on their way",
        body:
          `Good news ${cleaner.name}, your Fresh For Less cleaner account is live.\n\n` +
          `Jobs in your postcode areas will now appear at /pro/dashboard. ` +
          `First cleaner to accept keeps the job, so turn your notifications on.`,
      });
    }
  }

  revalidatePath("/admin/cleaners");
  redirect("/admin/cleaners?saved=1");
}

// ------------------------------------------------------------------- jobs --

export async function cancelJobAction(data: FormData) {
  await requireAdmin("/admin/jobs");
  await cancelJob(
    Number(field(data, "id", 12)),
    field(data, "reason", 200) || "Cancelled by admin"
  );
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs?saved=1");
}

/**
 * Take a job off its cleaner and put it back out. Distinct from cancelling:
 * the customer keeps their slot and price, so they must not be told their
 * booking is cancelled.
 */
/** Put a job in a named cleaner's diary — usually straight after a phone call. */
export async function assignJobAction(data: FormData) {
  await requireAdmin("/admin/jobs");
  const jobId = Number(field(data, "id", 12));
  const cleanerId = Number(field(data, "cleanerId", 12));
  if (!cleanerId) fail("/admin/jobs", "Pick a cleaner to assign it to.");

  const result = await assignJob(jobId, cleanerId);
  revalidatePath("/admin/jobs");
  if (!result.ok) fail("/admin/jobs", result.reason ?? "Couldn't assign that job.");
  redirect("/admin/jobs?assigned=1");
}

export async function reassignJobAction(data: FormData) {
  await requireAdmin("/admin/jobs");
  const result = await releaseJob({
    jobId: Number(field(data, "id", 12)),
    by: "admin",
    reason: field(data, "reason", 300) || "Reassigned by the office",
  });
  revalidatePath("/admin/jobs");
  if (!result.ok) {
    fail("/admin/jobs", result.reason ?? "Couldn't reassign that job.");
  }
  redirect(`/admin/jobs?offered=${result.offered}`);
}

export async function rebroadcastJobAction(data: FormData) {
  await requireAdmin("/admin/jobs");
  const offered = await rebroadcastJob(Number(field(data, "id", 12)));
  revalidatePath("/admin/jobs");
  redirect(`/admin/jobs?offered=${offered}`);
}

// -------------------------------------------------------------- invoicing --

export async function generateInvoicesAction(data: FormData) {
  await requireAdmin("/admin/invoices");

  const periodStart = field(data, "periodStart", 10);
  const periodEnd = field(data, "periodEnd", 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(periodStart) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)
  ) {
    fail("/admin/invoices", "Pick a valid start and end date for the period.");
  }

  const created = await generateCommissionInvoices(periodStart, periodEnd);
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices?created=${created.length}`);
}

export async function setInvoiceStatusAction(data: FormData) {
  await requireAdmin("/admin/invoices");
  const status = field(data, "status", 10) === "paid" ? "paid" : "issued";
  await setInvoiceStatus(Number(field(data, "id", 12)), status);
  revalidatePath("/admin/invoices");
  redirect("/admin/invoices?saved=1");
}


// ------------------------------------------------- editing cleaners -------

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Change a cleaner's details on their behalf — the "I've got a new mobile"
 * phone call. The mobile matters most: it's where job texts go, so a stale
 * number silently costs them work.
 */
export async function updateCleanerAction(data: FormData) {
  await requireAdmin("/admin/cleaners");
  const id = Number(field(data, "id", 12));

  const name = field(data, "name", 80);
  const email = field(data, "email", 120);
  const phone = field(data, "phone", 30);

  if (name.length < 2) fail("/admin/cleaners", "The cleaner needs a name.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    fail("/admin/cleaners", "That email address doesn't look right.");
  }
  if (phone.replace(/\D/g, "").length < 10) {
    fail("/admin/cleaners", "That phone number doesn't look right.");
  }

  const expiry = field(data, "insuranceExpiry", 10);
  const result = await updateCleanerProfile(id, {
    name,
    businessName: field(data, "businessName", 120),
    email,
    phone,
    insuranceProvider: field(data, "insuranceProvider", 120),
    insuranceExpiry: /^\d{4}-\d{2}-\d{2}$/.test(expiry) ? expiry : null,
    yearsExperience: Math.max(0, Math.min(60, Number(field(data, "yearsExperience", 3)) || 0)),
    equipment: field(data, "equipment", 500),
  });
  if (!result.ok) fail("/admin/cleaners", result.reason ?? "Couldn't save that.");

  revalidatePath("/admin/cleaners");
  redirect("/admin/cleaners?saved=1");
}

/** Change where and when a cleaner works, on their behalf. */
export async function updateCleanerCoverageAction(data: FormData) {
  await requireAdmin("/admin/cleaners");
  const id = Number(field(data, "id", 12));

  const { codes, invalid } = parseOutwardList(field(data, "coverage", 4000));
  if (codes.length === 0) {
    fail("/admin/cleaners", "List at least one postcode area.");
  }
  if (invalid.length) {
    fail(
      "/admin/cleaners",
      `These don't look like UK postcode areas: ${invalid.slice(0, 5).join(", ")}`
    );
  }

  const availability = WEEKDAYS.map((weekday) => ({
    weekday,
    am: data.get(`day-${weekday}-am`) === "on",
    pm: data.get(`day-${weekday}-pm`) === "on",
  }));
  if (!availability.some((a) => a.am || a.pm)) {
    fail("/admin/cleaners", "Tick at least one half-day.");
  }

  await setCleanerAreas(id, codes);
  await setAvailability(id, availability);
  revalidatePath("/admin/cleaners");
  redirect("/admin/cleaners?saved=1");
}

/**
 * Issue a one-time password reset link. With no mail provider configured the
 * link is shown in the admin page to copy and text over; it's also written to
 * the notification log so it's delivered if email is switched on later.
 */
export async function issueResetLinkAction(data: FormData) {
  await requireAdmin("/admin/cleaners");
  const id = Number(field(data, "id", 12));

  const hash = await getCleanerPasswordHash(id);
  const cleaner = await getCleaner(id);
  if (!hash || !cleaner) fail("/admin/cleaners", "Cleaner not found.");

  const token = makeResetToken(id, hash);
  const base = (
    process.env.MARKETPLACE_BASE_URL ??
    "https://www.freshforlesscarpetcleaning.co.uk"
  ).replace(/\/$/, "");
  const link = `${base}/pro/reset/${token}`;

  await notify({
    recipient: cleaner.email,
    subject: "Reset your Fresh For Less password",
    body:
      `${cleaner.name}, use this link within 48 hours to set a new password:\n\n` +
      `${link}\n\n` +
      `If you didn't ask for this, ignore it — your current password still works.`,
  });

  revalidatePath("/admin/cleaners");
  redirect(`/admin/cleaners?reset=${encodeURIComponent(link)}`);
}
