/** Format integer pence as GBP, e.g. 9900 -> "£99.00". */
export function gbp(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format((pence ?? 0) / 100);
}

/** Format pence with no decimals when it's a round pound, e.g. 9900 -> "£99". */
export function gbpShort(pence: number): string {
  return pence % 100 === 0 ? `£${pence / 100}` : gbp(pence);
}

/** Parse a "99" / "99.50" / "£99.50" price input into integer pence. */
export function penceFromInput(input: unknown): number | null {
  const cleaned = String(input ?? "").trim().replace(/[£,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}
