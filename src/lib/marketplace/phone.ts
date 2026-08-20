/**
 * UK mobile numbers, normalised to E.164 for the SMS gateway.
 *
 * Cleaners type their number however they like ("07700 900123", "+44 7700
 * 900123", "0044…"), but Twilio only accepts +447700900123.
 */
export function toE164(input: string): string | null {
  const digits = String(input ?? "").replace(/[\s()\-.]/g, "");
  if (!digits) return null;

  let national: string;
  if (digits.startsWith("+44")) national = digits.slice(3);
  else if (digits.startsWith("0044")) national = digits.slice(4);
  else if (digits.startsWith("44") && digits.length >= 12) national = digits.slice(2);
  else if (digits.startsWith("0")) national = digits.slice(1);
  else return null;

  // UK national numbers are 10 digits after the trunk zero, and must not
  // start with another zero.
  if (!/^[1-9]\d{9}$/.test(national)) return null;
  return `+44${national}`;
}

/** True for UK mobiles (07xxx / +447xxx) — the only numbers worth texting. */
export function isMobile(input: string): boolean {
  const e164 = toE164(input);
  return e164 !== null && e164.startsWith("+447");
}
