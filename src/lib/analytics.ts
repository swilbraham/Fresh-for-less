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
 * STOPGAP — this is the /landing lead-form action, which is count-only at £0.
 * Bookings are reported against it so the campaign has *some* conversion
 * signal, but Google will optimise for the number of bookings rather than
 * their value, so a £99 job and a £300 job look identical to it.
 *
 * When a booking-specific conversion action exists (Purchase category, "use
 * different values for each conversion"), replace this label and nothing else
 * — the value and currency are already being sent.
 */
export const GOOGLE_ADS_BOOKING_LABEL = "v7HjCKq9_sIcEI6S0MRA";

export const GOOGLE_ADS_BOOKING_TARGET =
  `${GOOGLE_ADS_ID}/${GOOGLE_ADS_BOOKING_LABEL}`;
