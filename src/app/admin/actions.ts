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

  await updateSettings({
    commissionPct,
    minimumChargePence,
    minNoticeDays,
    bookingEmail: field(data, "bookingEmail", 120),
    cancellationNoticeHours,
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
  redirect(`/admin/invoices?created=${created}`);
}

export async function setInvoiceStatusAction(data: FormData) {
  await requireAdmin("/admin/invoices");
  const status = field(data, "status", 10) === "paid" ? "paid" : "issued";
  await setInvoiceStatus(Number(field(data, "id", 12)), status);
  revalidatePath("/admin/invoices");
  redirect("/admin/invoices?saved=1");
}
