import "server-only";

/**
 * The leaving-the-page offer.
 *
 * Deliberately not shown on the way in. A discount on the price screen teaches
 * everybody to expect one and costs margin on customers who would have paid
 * the full price; offered on the way out it only costs margin on work that was
 * about to be lost.
 */
export const EXIT_DISCOUNT_PCT = 10;

/** Short enough to be a reason to act today rather than a standing price. */
export const EXIT_DISCOUNT_HOURS = 24;
