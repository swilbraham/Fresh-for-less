/**
 * UK postcode helpers. Coverage is registered and matched on the *outward*
 * code — the part before the space, e.g. "CH41" in "CH41 5AB".
 */

const FULL = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;
const OUTWARD_ONLY = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

/** "ch415ab" -> "CH41 5AB", or null if it isn't a valid UK postcode. */
export function normalisePostcode(input: string): string | null {
  const match = String(input ?? "")
    .trim()
    .replace(/\s+/g, "")
    .match(FULL);
  if (!match) return null;
  return `${match[1].toUpperCase()} ${match[2].toUpperCase()}`;
}

/** Outward code from a full postcode, or null. */
export function outwardOf(input: string): string | null {
  const full = normalisePostcode(input);
  if (full) return full.split(" ")[0];
  const bare = String(input ?? "").trim().replace(/\s+/g, "");
  return OUTWARD_ONLY.test(bare) ? bare.toUpperCase() : null;
}

/** Parse a cleaner's free-text coverage list into unique outward codes. */
export function parseOutwardList(input: string): {
  codes: string[];
  invalid: string[];
} {
  const tokens = String(input ?? "")
    .split(/[\s,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const codes: string[] = [];
  const invalid: string[] = [];
  for (const token of tokens) {
    const code = outwardOf(token);
    if (!code) invalid.push(token);
    else if (!codes.includes(code)) codes.push(code);
  }
  return { codes, invalid };
}
