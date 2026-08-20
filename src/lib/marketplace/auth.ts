import "server-only";
import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { queryOne } from "./db";
import type { Cleaner } from "./types";

const PRO_COOKIE = "ffl_pro";
const ADMIN_COOKIE = "ffl_admin";
const SESSION_DAYS = 30;

const DEV_SECRET = "dev-only-marketplace-secret-not-for-production";
const DEV_ADMIN_PASSWORD = "admin";

function secret(): string {
  const value = process.env.MARKETPLACE_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "MARKETPLACE_SECRET is not set. Add a long random string to the Vercel project environment."
    );
  }
  return DEV_SECRET;
}

function adminPassword(): string {
  const value = process.env.ADMIN_PASSWORD;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to the Vercel project environment."
    );
  }
  return DEV_ADMIN_PASSWORD;
}

// ---- Passwords -----------------------------------------------------------

/** scrypt with a per-password salt. Format: "scrypt$<salt>$<hash>". */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = String(stored ?? "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

// ---- Signed session cookies ---------------------------------------------

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function makeToken(subject: string): string {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${subject}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [subject, expires, signature] = parts;
  const expected = sign(`${subject}.${expires}`);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  if (Number(expires) < Date.now()) return null;
  return subject;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

// ---- Cleaner sessions ----------------------------------------------------

export async function startCleanerSession(cleanerId: number): Promise<void> {
  const store = await cookies();
  store.set(PRO_COOKIE, makeToken(String(cleanerId)), cookieOptions);
}

export async function endCleanerSession(): Promise<void> {
  const store = await cookies();
  store.delete(PRO_COOKIE);
}

/** The signed-in cleaner, or null. Suspended/rejected accounts get null. */
export async function currentCleaner(): Promise<Cleaner | null> {
  const store = await cookies();
  const subject = readToken(store.get(PRO_COOKIE)?.value);
  if (!subject) return null;
  const cleaner = await queryOne<Cleaner>(
    `SELECT * FROM cleaners WHERE id = $1`,
    [Number(subject)]
  );
  if (!cleaner) return null;
  if (cleaner.status === "suspended" || cleaner.status === "rejected") {
    return null;
  }
  return cleaner;
}

// ---- Admin session -------------------------------------------------------

export function checkAdminPassword(password: string): boolean {
  const expected = adminPassword();
  const a = Buffer.from(String(password ?? ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function startAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, makeToken("admin"), cookieOptions);
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return readToken(store.get(ADMIN_COOKIE)?.value) === "admin";
}

// ---- Booking access tokens ----------------------------------------------

/**
 * Customers manage a booking through a signed link rather than an account —
 * they book once, so a password would be friction for no security gain.
 *
 * The token is an HMAC over the booking reference with a "booking:" purpose
 * prefix, so it can never be confused with a session cookie. It grants access
 * to exactly one booking and nothing else.
 */
export function bookingToken(ref: string): string {
  return createHmac("sha256", secret())
    .update(`booking:${ref.toUpperCase()}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyBookingToken(ref: string, token: string): boolean {
  const expected = bookingToken(ref);
  const given = String(token ?? "");
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

/** Full customer-facing link for managing a booking. */
export function bookingUrl(ref: string, baseUrl: string): string {
  return `${baseUrl}/booking/${ref}?t=${bookingToken(ref)}`;
}

// ---- Password reset links -----------------------------------------------

const RESET_HOURS = 48;

/**
 * A reset link that needs no database table and can only be used once.
 *
 * The signature covers the cleaner's *current* password hash, so the moment
 * they set a new password the old link stops verifying. An expiry is baked in
 * as well, so a link texted and forgotten doesn't stay live indefinitely.
 */
export function makeResetToken(
  cleanerId: number,
  currentPasswordHash: string
): string {
  const expires = Date.now() + RESET_HOURS * 60 * 60 * 1000;
  const payload = `${cleanerId}.${expires}`;
  const signature = createHmac("sha256", secret())
    .update(`reset:${payload}:${currentPasswordHash}`)
    .digest("hex")
    .slice(0, 32);
  return `${payload}.${signature}`;
}

export function verifyResetToken(
  token: string,
  currentPasswordHash: string
): { cleanerId: number } | null {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 3) return null;
  const [id, expires, signature] = parts;

  if (!/^\d+$/.test(id) || !/^\d+$/.test(expires)) return null;
  if (Number(expires) < Date.now()) return null;

  const expected = createHmac("sha256", secret())
    .update(`reset:${id}.${expires}:${currentPasswordHash}`)
    .digest("hex")
    .slice(0, 32);

  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  return { cleanerId: Number(id) };
}

/** The cleaner id embedded in a reset token, before the signature is checked. */
export function cleanerIdFromResetToken(token: string): number | null {
  const id = String(token ?? "").split(".")[0];
  return /^\d+$/.test(id) ? Number(id) : null;
}
