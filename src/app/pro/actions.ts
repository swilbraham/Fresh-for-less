"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  currentCleaner,
  endCleanerSession,
  hashPassword,
  startCleanerSession,
  verifyPassword,
} from "@/lib/marketplace/auth";
import {
  acceptJob,
  addBlackout,
  completeJob,
  createCleaner,
  declineJob,
  findCleanerByEmail,
  removeBlackout,
  setAvailability,
  setCleanerAreas,
  setNotificationPrefs,
  notify,
} from "@/lib/marketplace/repo";
import { parseOutwardList } from "@/lib/marketplace/postcode";

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

function field(data: FormData, name: string, max = 200): string {
  return String(data.get(name) ?? "").trim().slice(0, max);
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/** Read the "day-N-am" / "day-N-pm" checkbox grid off a form. */
function readAvailability(data: FormData) {
  return WEEKDAYS.map((weekday) => ({
    weekday,
    am: data.get(`day-${weekday}-am`) === "on",
    pm: data.get(`day-${weekday}-pm`) === "on",
  }));
}

async function requireCleaner() {
  const cleaner = await currentCleaner();
  if (!cleaner) redirect("/pro?error=Please+sign+in+again.");
  return cleaner;
}

// ------------------------------------------------------------------ access --

export async function loginAction(data: FormData) {
  const email = field(data, "email", 120);
  const password = field(data, "password", 200);

  const cleaner = await findCleanerByEmail(email);
  if (!cleaner || !verifyPassword(password, cleaner.password_hash)) {
    fail("/pro", "That email and password don't match.");
  }
  if (cleaner.status === "suspended" || cleaner.status === "rejected") {
    fail("/pro", "This account isn't active. Please contact the office.");
  }

  await startCleanerSession(cleaner.id);
  redirect("/pro/dashboard");
}

export async function logoutAction() {
  await endCleanerSession();
  redirect("/pro");
}

export async function registerAction(data: FormData) {
  const name = field(data, "name", 80);
  const email = field(data, "email", 120);
  const phone = field(data, "phone", 30);
  const password = field(data, "password", 200);
  const coverageRaw = field(data, "coverage", 2000);

  if (name.length < 2) fail("/pro/register", "Please enter your name.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    fail("/pro/register", "Please enter a valid email address.");
  }
  if (phone.replace(/\D/g, "").length < 10) {
    fail("/pro/register", "Please enter a valid phone number.");
  }
  if (password.length < 8) {
    fail("/pro/register", "Choose a password of at least 8 characters.");
  }

  const { codes, invalid } = parseOutwardList(coverageRaw);
  if (codes.length === 0) {
    fail(
      "/pro/register",
      "List at least one postcode area you cover, e.g. CH41 CH42."
    );
  }
  if (invalid.length) {
    fail(
      "/pro/register",
      `These don't look like UK postcode areas: ${invalid.slice(0, 5).join(", ")}`
    );
  }

  const availability = readAvailability(data);
  if (!availability.some((a) => a.am || a.pm)) {
    fail("/pro/register", "Tick at least one half-day you can work.");
  }

  if (await findCleanerByEmail(email)) {
    fail("/pro/register", "An account already exists for that email.");
  }

  const expiryRaw = field(data, "insuranceExpiry", 10);
  const cleanerId = await createCleaner({
    name,
    businessName: field(data, "businessName", 120),
    email,
    phone,
    passwordHash: hashPassword(password),
    insuranceProvider: field(data, "insuranceProvider", 120),
    insuranceExpiry: /^\d{4}-\d{2}-\d{2}$/.test(expiryRaw) ? expiryRaw : null,
    yearsExperience: Math.max(0, Math.min(60, Number(field(data, "yearsExperience", 3)) || 0)),
    equipment: field(data, "equipment", 500),
  });

  await setCleanerAreas(cleanerId, codes);
  await setAvailability(cleanerId, availability);
  await notify({
    recipient: email,
    subject: "Your Fresh For Less cleaner application",
    body:
      `Thanks ${name} — your application is in.\n\n` +
      `We check insurance and experience before switching accounts on, usually ` +
      `within one working day. You'll get an email the moment you're approved ` +
      `and jobs in ${codes.join(", ")} start landing in your dashboard.`,
  });

  await startCleanerSession(cleanerId);
  redirect("/pro/dashboard");
}

// ---------------------------------------------------------------- coverage --

export async function saveCoverageAction(data: FormData) {
  const cleaner = await requireCleaner();
  const { codes, invalid } = parseOutwardList(field(data, "coverage", 4000));

  if (codes.length === 0) {
    fail("/pro/coverage", "List at least one postcode area you cover.");
  }
  if (invalid.length) {
    fail(
      "/pro/coverage",
      `These don't look like UK postcode areas: ${invalid.slice(0, 5).join(", ")}`
    );
  }

  const availability = readAvailability(data);
  if (!availability.some((a) => a.am || a.pm)) {
    fail("/pro/coverage", "Tick at least one half-day you can work.");
  }

  await setCleanerAreas(cleaner.id, codes);
  await setAvailability(cleaner.id, availability);
  await setNotificationPrefs(cleaner.id, {
    sms: data.get("notifySms") === "on",
    email: data.get("notifyEmail") === "on",
  });
  revalidatePath("/pro/coverage");
  redirect("/pro/coverage?saved=1");
}

export async function addBlackoutAction(data: FormData) {
  const cleaner = await requireCleaner();
  const day = field(data, "day", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    fail("/pro/coverage", "Pick a valid date to block out.");
  }
  await addBlackout(cleaner.id, day);
  revalidatePath("/pro/coverage");
  redirect("/pro/coverage?saved=1");
}

export async function removeBlackoutAction(data: FormData) {
  const cleaner = await requireCleaner();
  await removeBlackout(cleaner.id, field(data, "day", 10));
  revalidatePath("/pro/coverage");
  redirect("/pro/coverage?saved=1");
}

// -------------------------------------------------------------------- jobs --

export async function acceptJobAction(data: FormData) {
  const cleaner = await requireCleaner();
  const jobId = Number(field(data, "jobId", 12));

  const result = await acceptJob(jobId, cleaner.id);
  revalidatePath("/pro/dashboard");
  if (!result.ok) fail("/pro/dashboard", result.reason ?? "Couldn't accept that job.");
  redirect("/pro/dashboard?accepted=1");
}

export async function declineJobAction(data: FormData) {
  const cleaner = await requireCleaner();
  await declineJob(Number(field(data, "jobId", 12)), cleaner.id);
  revalidatePath("/pro/dashboard");
  redirect("/pro/dashboard");
}

export async function completeJobAction(data: FormData) {
  const cleaner = await requireCleaner();
  const result = await completeJob(Number(field(data, "jobId", 12)), cleaner.id);
  revalidatePath("/pro/dashboard");
  if (!result.ok) fail("/pro/dashboard", result.reason ?? "Couldn't complete that job.");
  redirect("/pro/dashboard?completed=1");
}
