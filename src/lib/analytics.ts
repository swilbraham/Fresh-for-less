/**
 * Google Ads conversion tracking.
 *
 * Both values are public — they appear in the page source of every site that
 * runs the tag — so unlike API keys they belong in code rather than env vars.
 *
 * The tag itself was already live on /landing (public/landing/index.html);
 * this is the same account, now reporting marketplace bookings too.
 */
export const GOOGLE_ADS_ID = "AW-17323788558";

/**
 * The booking conversion action. The real booking value and GBP are sent
 * with every event, with the booking ref as transaction_id so Google
 * discards any duplicate report of the same booking.
 */
export const GOOGLE_ADS_BOOKING_LABEL = "W8ZvCL7x74cdEI6S0MRA";

export const GOOGLE_ADS_BOOKING_TARGET =
  `${GOOGLE_ADS_ID}/${GOOGLE_ADS_BOOKING_LABEL}`;
