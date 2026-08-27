/**
 * UK postcode helpers. Coverage is registered and matched on the *outward*
 * code — the part before the space, e.g. "CH41" in "CH41 5AB".
 */

const FULL = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;
const OUTWARD_ONLY = /^[A-Z]{1,2}\d[A-Z\d]?$/i;
/** The half of a postcode after the space, e.g. the "5AB" of "CH41 5AB". */
const INWARD_ONLY = /^\d[A-Z]{2}$/i;

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

/**
 * Parse a cleaner's free-text coverage list into unique outward codes.
 *
 * Accepts whatever anyone is realistically going to paste in: separated by
 * spaces, commas, semicolons or newlines, in any case, and either bare outward
 * codes ("CH41") or full postcodes ("CH41 5AB") mixed freely.
 *
 * The space inside a full postcode is the awkward part. It can't simply be a
 * separator, or "CH41 5AB" reads as two entries and the "5AB" half gets
 * rejected as nonsense — which used to throw out the whole save. So an outward
 * code followed by something shaped like an inward code is treated as one
 * postcode rather than two entries. Nothing is ambiguous here: outward codes
 * always start with a letter and inward codes always start with a digit.
 */
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

  for (let i = 0; i < tokens.length; i++) {
    const code = outwardOf(tokens[i]);
    if (!code) {
      invalid.push(tokens[i]);
      continue;
    }
    // Swallow the inward half of a postcode typed with its space, so it isn't
    // read as a separate — and invalid — entry on the next pass.
    if (INWARD_ONLY.test(tokens[i + 1] ?? "")) i++;
    if (!codes.includes(code)) codes.push(code);
  }

  return { codes, invalid };
}

/**
 * Why a coverage list was rejected, phrased so the reader can fix it.
 *
 * The old wording quoted the offending fragment and nothing else, which was
 * baffling when the fragment was half of a postcode the reader had typed
 * correctly. Say what good input looks like too.
 */
export function invalidCoverageMessage(invalid: string[]): string {
  const shown = invalid.slice(0, 5).join(", ");
  const rest = invalid.length - 5;
  const listed = rest > 0 ? `${shown} and ${rest} more` : shown;
  return (
    `Couldn't read ${listed} as a postcode. Enter areas like CH41, or full ` +
    `postcodes like CH41 5AB — separated by commas, spaces or new lines.`
  );
}
